import React, {PureComponent} from 'react';
import {Modal, Icon, Button, Spin, Collapse} from 'antd';
import _ from 'lodash';
import qs from 'querystring';
import $ from 'jquery';
import {connect} from 'dva';
import styles from './FrameModal.less';
import ColumnLayout from 'layouts/ColumnLayout';
import DocPreview from 'components/xDeal/DocPreview';
import DocumentTree from 'components/Deal/DocumentTree';

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

@connect(({global, znfz, loading}) => ({
  global,
  znfz,
}))
export default class Frame extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      loading: true,
      src: '',
      params: {},
      ajxx: props.ajxx,
      docTree: props.params.docTree || [],
      leftImageSource: null,
      w: '50%',
      tw: '2px',
      isSimple: true
    };
    this.lastMouseX = 0;
  }

  componentDidMount() {
    this.initPages();
  }

  initPages = () => {
    const {ajxx, docTree} = this.state;
    let leftImageSource = docTree.length > 1 && docTree[1] && docTree[1].children[0].coords;
    let pages = this.getAllPages();

    if ((!leftImageSource || leftImageSource.length === 0) && pages && pages.length > 0) {
      leftImageSource = pages[0];
    }
    this.setState({
      ajxx,
      docTree,
      leftImageSource,
    });
  };

  getAllPages = () => {
    const {docTree} = this.state;
    let pages = [];
    if (docTree && docTree.length > 0) {
      docTree.forEach(book => {
        book && book.children && book.children.forEach(cat => {
          cat && cat.children && cat.children.forEach(page => pages.push(page.coords))
        });
      });
    }
    return pages;
  };

  showModelHandler = (e) => {
    const {znfz: {docTree}} = this.props;

    if (e) e.stopPropagation();
    this.setState({
      visible: true,
      docTree: docTree,
      leftImageSource: docTree[1] && docTree[1].children[0] && docTree[1].children[0].children[0] && docTree[1].children[0].children[0].coords || null,
    });
    setTimeout(() => this.setState({loading: false}), 1500);
  };

  hideModelHandler = () => {
    this.setState({visible: false}, () => {
      this.props.onClose && this.props.onClose();
    });
  };

  switchSimple = () => {
    const {isSimple} = this.state;
    this.setState({
      isSimple: !isSimple
    })
  }

  close = () => {
    this.setState({
      visible: false,
    }, () => {
      this.props.onClose && this.props.onClose();
    });
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

    if (target && target === 'left') {
      this.setState({leftImageSource: data.coords});
    }
  };

  onSelect = (data) => {
    if (data.isProblem) {
    } else {
      if (data && data.coords) {
        this.setState({
          leftImageSource: data.coords,
        });
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
    const {title, icon, src, params, dispatch} = this.props;
    const {visible, isSimple} = this.state;
    const {w, tw} = this.state;
    const {docTree, leftImageSource} = this.state;

    const aside = (
      <Collapse bordered={false} defaultActiveKey={['1']}
                className={'ccidit-ant-collapse-custom'}>
        <Panel header="案件卷宗列表" key="1">
          <DocTree dispatch={dispatch} tree={docTree} expandKeys={[2]} expandAll={true} onSelect={this.onSelect}/>
        </Panel>
      </Collapse>
    );

    return (
      <span>
            <span onClick={this.showModelHandler}>
              {this.props.children}
            </span>
            <Modal width='calc(100vw - 20px)'
                   className={styles.default}
                   title={
                     <div>
                       <span><Icon type={icon || 'form'}/> {title} </span>
                       <Button className="modal-close"
                               icon="close"
                               onClick={this.hideModelHandler}
                               type='ghost'>关闭</Button>
                       <Button onClick={this.switchSimple}
                               size='small'
                               style={{
                                 float: 'right',
                                 marginRight: '6px',
                                 marginTop:'4px'
                               }}>{isSimple ? '切换图片对比' : '切换文书'}</Button>
                     </div>
                   }
                   visible={visible}
                   maskClosable={false}
                   closable={false}
                   destroyOnClose
                   onCancel={this.hideModelHandler}
                   footer={null}>
              <Spin style={{width: '100%', position: 'absolute', textAlign: 'center', marginTop: '60px'}}
                    spinning={this.state.loading} tip="正在加载..."
                    size="large"/>
              {
                isSimple ?
                  <iframe src={!_.isEmpty(params) ? `${src}?${qs.stringify({...params,showTips:true})}` : {...src,showTips:true}}/>
                  : <ColumnLayout aside={aside}>
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
                    {/*<div onMouseDown={this.onResizeTriggerDown}*/}
                    {/*className={styles.resizeTrigger}*/}
                    {/*style={{width: tw}}>&nbsp;</div>*/}
                    <div className={styles.mainRight}
                         onDrop={(e) => this.onDrop(e, 'right')}
                         onDragOver={(e) => {
                           e.preventDefault();
                           return true;
                         }}>
                      <iframe src={!_.isEmpty(params) ? `${src}?${qs.stringify(params)}` : src} height='100%'
                              width={'100%'}/>
                    </div>
                  </div>
                </ColumnLayout>
              }

            </Modal>
      </span>
    );
  }
}
