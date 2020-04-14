import React, {PureComponent} from 'react';
import {Modal, Spin, Collapse, Tooltip, message, Tree, Button} from 'antd';
import uuidV4 from 'uuid/v4';
import _ from 'lodash';
import $ from 'jquery';
import styles from './ProblemViewWindow.less';

import DocPreview from 'components/xDeal/DocPreview';
import Window from 'lib/Window';
import ProblemDealForm from '../DealModal/ProblemDealForm';
import ColumnLayout from 'layouts/ColumnLayout';
import DocumentTree from '../DocumentTree';


const TreeNode = Tree.TreeNode;
const Panel = Collapse.Panel;

const DocTree = ({dispatch, stage, onSelect, tree, expandKeys, expandAll, onMark}) => {

  const treeProps = {
    tree,
    expandRoot: false,
    expandKeys: expandKeys || [1],
    expandAll: expandAll || false,
    onSelect: (data) => {
      onSelect(data);
    },
    onMark: onMark,
  };

  return (
    <DocumentTree {...treeProps}/>
  );
}

export default class ProblemDealWindow extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ajxx: props.ajxx,
      problem: props.problem,
      docTree: props.docTree,
      leftImageSource: null,
      rightImageSource: null,
      noteVisible: false,
      markVisible: false,
      markItem: null,
      markCoords: null,
      loading: false,
      shouldReload: false,
      w: '50%',
      tw: '2px',
    };
    this.lastMouseX = 0;
    this.imageArr = [];
  }

  componentDidMount() {
    const {problem, docTree, ajxx} = this.state;
    this.setState({...this.rebuildState(problem, docTree), ajxx});
  }

  componentWillReceiveProps(nextProps){
    const {problem, docTree, ajxx} = nextProps;
    this.setState({...this.rebuildState(problem, docTree), ajxx});
  }

  hideSideWindow = (side) => {
    const {w} = this.state;
    let neww;
    let tw;
    if (w === 0 || w === '100%') {
      neww = '50%';
      tw = '2px';
    } else {
      neww = side === 'left' ? 0 : '100%';
      tw = 0;
    }
    this.setState({w: neww, tw})
  };

  resize = (w) => {
    w = w < 5 ? 5 : w;
    this.setState({
      w: w,
    });
    if (this.props.onResize) {
      this.props.onResize(w);
    }
  };

  onResizeTriggerDown = (e) => {
    const _this = this;
    e = e ? e : window.event;
    this.lastMouseX = e.nativeEvent.clientX;

    $(document).bind('mousemove', function (e) {
      _this.resizing(e);
    });

    $(document).bind('mouseup', function (e) {
      $(document).unbind('mousemove');
      $(document).unbind('mouseup');
    });
  };

  resizing = (e) => {
    e = e ? e : window.event;
    let {w} = this.state;
    if (!_.isNumber(w)) {
      w = $(this._left).width();
    }
    let neww = w + (e.clientX - this.lastMouseX);
    this.resize(neww);
    this.lastMouseX = e.clientX;
  };

  loopContent = (content, children, file) => {
    content.map(c => {
      if(!_.has(c, 'fieldname')){
        _.forEach(c, (v, key) => {
          let child;
          if(key.indexOf('|') !== -1){
            let name =key.substr(0, key.indexOf('|'));
            let path = key.substr(key.indexOf('|') + 1);
            child = {
              id: Math.random(),
              isProblem: true,
              fieldname: name,
              fieldpath: path,
              name: name,
              children: [],
            };
          }else {
            child = {
              id: Math.random(),
              isProblem: true,
              fieldname: key,
              name: key,
              children: [],
            };
          }
          children.push(child);
          this.loopContent(v, child.children, file);
        })
      }else{
        let fieldname = _.trim(c.fieldname);
        let fieldvalue = _.trim(c.fieldvalue);
        let fieldpath = _.trim(c.fieldpath);
        let child = {
          id: Math.random(),
          isProblem: true,
          fieldname: fieldname,
          fieldpath: fieldpath,
          name: fieldname + ': ' + fieldvalue,
          isMarked: (fieldname === '文书存在' && fieldvalue === '否') || (fieldname !== '文书存在' && fieldvalue === ''),
        };
        if (c.coords && c.coords.length > 0) {
          file.coords.push(...c.coords);
        }
        if (c.fieldname === '文书存在' && c.fieldvalue === '是') {
          this.imageArr.push(file);
        }
        children.push(child);
      }
    })
  };

  rebuildState = (problem, docTree) => {
    this.imageArr = [];
    let newState = {};
    if (problem && problem.jsondata && problem.jsondata.data && !_.isEmpty(docTree)) {
      const problemWsRoot = docTree[0];
      problemWsRoot.children = [];
      problem.jsondata.data.forEach((p, i) => {
        let node = {
          id: Math.random(),
          name: p.title,
          coords: p.coords ? p.coords : [],
        };
        if (p.contents) {
          node.children = [];
          node.isFile = true;
          this.loopContent(p.contents, node.children, node);
        }

        if (this.imageArr.length >= 2) {
          newState.leftImageSource = this.imageArr[0].coords;
          newState.rightImageSource = this.imageArr[1].coords;
        } else if (this.imageArr.length === 1) {
          newState.leftImageSource = this.imageArr[0].coords;
          newState.rightImageSource = this.imageArr[0].coords;
        } else {
          newState.leftImageSource = [{image: '/dzws/oops/oops.png', pos: ''}];
          newState.rightImageSource = [{image: '/dzws/oops/oops.png', pos: ''}];
        }

        problemWsRoot.children.push(node);
      });
    }

    newState.docTree = _.cloneDeep(docTree);
    newState.problem = problem;

    return newState;

  };

  onDrop = (e, target) => {
    const transferData = e.dataTransfer.getData('node');
    if (!transferData) return;
    const data = JSON.parse(transferData);

    if (target && target === 'right') {
      if (data.coords.length > 0) {
        this.setState({
          rightImageSource: data.coords,
        });
      } else {
        this.setState({
          rightImageSource: [{image: '/dzws/oops/oops.png', pos: ''}],
        });
      }
    } else {
      if (data.coords.length > 0) {
        this.setState({
          leftImageSource: data.coords,
        });
      } else {
        this.setState({
          leftImageSource: [{image: '/dzws/oops/oops.png', pos: ''}],
        });
      }
    }
  };

  onSelect = (data) => {
    if (data.isProblem) {
      this.setState({fieldpath: data.fieldpath});
    } else {
      if (data && data.coords) {
        if (this.state.leftImageSource && this.state.leftImageSource.length > 1) {
          if (data.coords.length > 0) {
            this.setState({
              rightImageSource: data.coords,
            });
          } else {
            this.setState({
              rightImageSource: [{image: '/dzws/oops/oops.png', pos: ''}],
            });
          }
        } else {
          if (data.coords.length > 0) {
            this.setState({
              leftImageSource: data.coords,
            });
          } else {
            this.setState({
              leftImageSource: [{image: '/dzws/oops/oops.png', pos: ''}],
            });
          }
        }
      }
    }
  };

  onEditClick = () => {
    this.setState({noteVisible: true});
  };

  saveData = (data) => {
    const {stage, close, dispatch} = this.props;
    const {problem} = this.state;
    const xtwt = {
      pid: problem.id,
      keyid: problem.keyid,
      bmsah: problem.bmsah,
      tysah: problem.tysah,
      yjfl: problem.yjfl,
      gzmc: problem.gzmc,
      zbjg: data.zbjg,
      cwlx: data.zbjg === 'B' ? data.cwlx : null,
      wtms: data.wtms,
    };

    delete data.zbjg;
    delete data.cwlx;
    delete data.wtms;

    if (data && !_.isEmpty(data)) {
      dispatch({
        type: `znfz/saveProblem`,
        payload: {
          stage: stage,
          data: data,
          id: problem.id,
        },
      }).then(()=>{
        this.setState({noteVisible: false});
        close && close();
      });
    }
    if (xtwt.zbjg) {
      dispatch({
        type: `znfz/saveXtwt`,
        payload: {
          data: xtwt,
        },
      }).then(()=>{
        this.setState({noteVisible: false});
        close && close();
      });
    }
  };

  onCopy = (params) => {
    const {dispatch} = this.props;
    dispatch({
      type: `global/getTextFromOcr`,
      payload: {
        ...params
      },
    });
  };

  onMark = (data) => {
    this.setState({
      markItem: data,
      markVisible: true,
      markCoords: null,
    });
  };

  getLastMark = (coords) => {
    if (!this.state.markVisible) {
      return false;
    }

    const pos = parseInt(coords.x1) + ' ' + parseInt(coords.y1) + ' ' + parseInt(coords.x2) + ' ' + parseInt(coords.y2);
    let markCoords = []; //_.cloneDeep(this.state.markCoords);
    markCoords.push({
      image: coords.image,
      pos: pos,
    });
    this.setState({
      markCoords,
    })
  };

  detailRules = (conclusion) => {
    return (
      <Tree showLine>
        {
          _.map(conclusion, (row) => {
            let renderParent = <Tooltip
              title={row.fieldname}>{row.fieldname && row.fieldname.length >= 18 ? `${row.fieldname.substr(0, 15)}...` : row.fieldname}</Tooltip>
            let renderChild = <Tooltip
              title={row.fieldvalue}>{row.fieldvalue && row.fieldvalue.length >= 18 ? `${row.fieldvalue.substr(0, 15)}...` : row.fieldvalue}</Tooltip>
            return (
              <TreeNode title={renderParent} key={uuidV4()}>
                {
                  row.fieldvalue && _.trim(row.fieldvalue).length > 0 && <TreeNode title={renderChild} key={uuidV4()}/>
                }
              </TreeNode>
            );
          })
        }
      </Tree>
    );
  };

  render() {
    const {dispatch, stage} = this.props;
    const {docTree, ajxx, problem, leftImageSource, rightImageSource, noteVisible, markVisible} = this.state;

    const clientWidth = document.body.clientWidth;
    const clientHeight = document.body.clientHeight;

    const aside = (
      <Collapse bordered={false} defaultActiveKey={['1', '2']}>
        <Panel header="问题详细信息" key="1">
          <div className={styles.problemDetail}>
            <div dangerouslySetInnerHTML={{__html: problem && problem.wtms}}></div>
          </div>
        </Panel>
        <Panel header="细则" key="3">
          {
            problem && problem.jsondata && problem.jsondata.conclusion
            && this.detailRules(problem.jsondata.conclusion)
          }
        </Panel>
        <Panel header="案件卷宗列表" key="2">
          <DocTree stage={stage} dispatch={dispatch} tree={docTree} expandKeys={[1]} expandAll={true}
                   onSelect={this.onSelect} onMark={this.onMark}/>
        </Panel>
      </Collapse>
    );

    const {w, tw} = this.state;

    return (
      <ColumnLayout aside={aside}>
        <div className={styles.main}>
          <div className={styles.mainLeft}
               ref={(c) => this._left = c}
               style={{width: w}}
               onDrop={(e) => this.onDrop(e, 'left')}
               onDragOver={(e) => {
                 e.preventDefault();
                 return true;
               }}>
            <DocPreview source={leftImageSource}
                           onHide={() => this.hideSideWindow('right')}
                           onCopy={this.onCopy}
                           getLastMark={this.getLastMark}/>
          </div>
          <div onMouseDown={this.onResizeTriggerDown}
               className={styles.resizeTrigger}
               style={{width: tw}}>&nbsp;</div>
          <div className={styles.mainRight}
               onDrop={(e) => this.onDrop(e, 'right')}
               onDragOver={(e) => {
                 e.preventDefault();
                 return true;
               }}>
            <DocPreview source={rightImageSource}
                           onHide={() => this.hideSideWindow('left')}
                           onCopy={this.onCopy}
                           getLastMark={this.getLastMark}/>
          </div>
          <div>
            <div className={styles.FloatButton}>
              <ul>
                <li onClick={this.onEditClick}>
                  <Tooltip placement="left" title="问题处理" overlayStyle={{marginRight: '1rem'}}>
                    <Button type='primary' size='large' shape="circle" icon="form"/>
                  </Tooltip>
                </li>
              </ul>
            </div>
            <Window width={clientWidth * 0.4}
                    height={clientHeight * 0.6}
                    onClose={() => this.setState({noteVisible: false})}
                    visible={noteVisible}
                    title={<span>问题处理</span>}
                    icon="edit">
              <ProblemDealForm dispatch={dispatch} stage={stage} problem={problem} ajxx={ajxx} save={data => this.saveData(data)}/>
            </Window>
          </div>
        </div>
      </ColumnLayout>
    );
  }
}




