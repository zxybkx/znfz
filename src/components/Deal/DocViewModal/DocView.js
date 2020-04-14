import React, {Component} from 'react';
import {Collapse} from 'antd';
import _ from 'lodash';
import styles from './index.less';

import DocPreview from 'components/xDeal/DocPreview';
import ColumnLayout from 'layouts/ColumnLayout';
import $ from 'jquery';
import DocumentTree from '../DocumentTree';

const Panel = Collapse.Panel;

const DocTree = ({stage, dispatch, onSelect, tree, expandKeys, expandAll, onMark}) => {

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
};

export default class DocViewModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ajxx: props.ajxx,
      coords: props.coords,
      docTree: props.docTree,
      leftImageSource: null,
      rightImageSource: null,
      w: '50%',
      tw: '2px',
    };
    this.lastMouseX = 0;
  }

  componentDidMount() {
    this.initPages();
  }

  componentWillReceiveProps(nextProps) {
    const {ajxx, docTree, coords} = nextProps;
    this.setState({
      ajxx,
      docTree,
      coords,
    }, ()=> {
      this.initPages();
    });
  }

  initPages = () => {
    const {ajxx, docTree, coords} = this.state;
    let leftImageSource = coords;
    let rightImageSource = null;
    let pages = this.getAllPages();
    if((!leftImageSource || leftImageSource.length === 0) && pages && pages.length >0){
      leftImageSource = pages[0];
    }
    if(pages && pages.length > 1){
      rightImageSource = pages[1];
    }
    this.setState({
      ajxx,
      docTree,
      leftImageSource,
      rightImageSource,
    });
  };

  getAllPages = ()=>{
    const {docTree} = this.state;
    let pages = [];
    if(docTree && docTree.length > 0) {
      docTree.forEach(book => {
        book && book.children && book.children.forEach(cat => {
          cat && cat.children && cat.children.forEach(page => pages.push(page.coords))
        });
      });
    }
    return pages;
  };

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

  onDrop = (e, target) => {
    const transferData = e.dataTransfer.getData('node');
    if (!transferData) return;
    const data = JSON.parse(transferData);

    if (target && target === 'right') {
      this.setState({rightImageSource: data.coords});
    } else {
      this.setState({leftImageSource: data.coords});
    }
  };

  onSelect = (data) => {
    if (data.isProblem) {
    } else {
      if (data && data.coords) {
        if (this.state.leftImageSource && this.state.leftImageSource.length > 0) {
          this.setState({
            rightImageSource: data.coords,
          });
        } else {
          this.setState({
            leftImageSource: data.coords,
          });
        }
      }
    }
  };

  onCopy = (params) => {
    const {dispatch} = this.props;
    dispatch({
      type: `global/getTextFromOcr`,
      payload: {
        ...params,
      },
    });
  };

  render() {
    const {dispatch} = this.props;
    const {docTree, leftImageSource, rightImageSource} = this.state;

    const aside = (
      <Collapse bordered={false} defaultActiveKey={['1']}
                className={'ccidit-ant-collapse-custom'}>
        <Panel header="案件卷宗列表" key="1">
          <DocTree dispatch={dispatch} tree={docTree} expandKeys={[2]} expandAll={true} onSelect={this.onSelect}/>
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
              <DocPreview showRect={false}
                             source={leftImageSource}
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
              <DocPreview showRect={false}
                             source={rightImageSource}
                             onHide={() => this.hideSideWindow('left')}
                             onCopy={this.onCopy}
                             getLastMark={this.getLastMark}/>
            </div>
          </div>
        </ColumnLayout>
    );
  }
}




