import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import Delay from 'lodash-decorators/delay';
import Bind from 'lodash-decorators/bind';
import { message, Button, Tooltip, Modal, Card } from 'antd';
import { CanvasDraw, Tools } from 'lib/CanvasDraw';
import styles from './index.less';
import $ from 'jquery';

class ImageCanvas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: props.page.image,
      pos: props.page.pos,
      showRect: props.showRect === undefined ? true : props.showRect,
      OCRImg: '',
      OCRcopy: false
    };
    this._stage = null;
    
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props.page, nextProps.page) || !_.isEqual(this.state.page, nextState.page);
  }


  componentWillReceiveProps(nextProps) {
    this.setState({
      image: nextProps.page.image,
      pos: nextProps.page.pos,
    });
  }

  componentDidUpdate() {
    this.buildCanvasJSON(this.state.image, this.state.pos);
    const { addSketch } = this.props;
    if (addSketch && this._stage) {
      addSketch(this._stage);
    }
  }

  componentDidMount() {
    this.buildCanvasJSON(this.state.image, this.state.pos);
    const { addSketch } = this.props;
    if (addSketch && this._stage) {
      addSketch(this._stage);
    }
  }

  @Bind()
  @Delay(400)
  buildCanvasJSON = (image) => {
    if (_.isEmpty(image)) {
      return;
    }

    if (!/.*\/dzws\/.*/.test(image)) {
      image = `/dzws/${image}`;
    }

    this._stage.clear();
    this._stage.addImage(image, {}, () => {
      if (!this.state.showRect) {
        return false;
      }

      let rects = [];
      // if (pos && pos.length > 0) {
      //   pos.forEach(p => {
      //     if (p && p.length > 0) {
      //       const arr = p.split(' ');
      //       if (arr && arr.length === 4) {
      //         const top = arr[1], left = arr[0], width = (arr[2] - arr[0]), height = (arr[3] - arr[1]);
      //         rects.push({
      //           className: 'Rect',
      //           attrs: {
      //             x: left,
      //             y: top,
      //             width: width,
      //             height: height,
      //             fill: 'rgba(255,0,0,.2)',
      //             stroke: 'rgba(255,0,0,.3)',
      //             strokeWidth: 1,
      //           },
      //         });
      //       }
      //     }
      //   });
      // }
      if (!_.isEmpty(rects) && this._stage) {
        this._stage.addRect(rects);
      }
    });
  };

  onChange = (e) => {
    
    if (e && e.type === 'mouseup' && e.button === 0) {
      const activeRect = this._stage.activeRect;
      // const activeRect = this._stage.activeRect;
      const width = activeRect ? activeRect.width() : 0;
      const height = activeRect ? activeRect.height() : 0;
      if (width === 0 && height === 0) {
        this._stage.removeActiveRect();
      } else {
        if (width <= 5 || height <= 5) {
          message.warning('请指定有效的文字选取范围。');
          this._stage.removeActiveRect();
        } else {
          const { getLastMark } = this.props;
          if (getLastMark) {
            const x = activeRect.x();
            const y = activeRect.y();
            const { scaleX, scaleY } = this._stage.getImageScale();
            const coords = {
              x1: x / scaleX,
              y1: y / scaleY,
              x2: x / scaleX + activeRect.width() / scaleX,
              y2: y / scaleY + activeRect.height() / scaleY,
              image: this.state.image,
            };
            getLastMark(coords);
          }
        }
      }
    } 
  };

  removeActiveRect = () => {
    this._stage.removeActiveObject();
  };

  onCopy = (params) => {
    if (params.img !== this.state.OCRImg) {
      this.setState({
        OCRImg: params.img
      });
      const { onCopy } = this.props;
      onCopy && onCopy(params)
    }
  };


  render() {
    const clientHeight = document.body.clientHeight;
    
    return (
      <div className={styles.image} style={{ position: 'relative' }}>
        {
          this.state.OCRcopy ?
            <div style={{ position: 'absolute', top: '0' }}>复制</div>
            : ''

        }
        <CanvasDraw 
          ref={(c) => this._stage = c}
          tool={Tools.Rectangle}
          lineColor='rgba(255,0,0,1)'
          fillColor='rgba(255,0,0,.25)'
          lineWidth={1}
          height={clientHeight - 90}
          onChange={this.onChange}
          onCopy={this.onCopy} />



      </div>
    );
  }
}

class ToolBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scaleFact: 1,
      fullScreen: false,
      draggable: false,
      value: '',
      selected: 'bbox',
      sketchs: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.state.sketchs, nextProps.sketchs)) {
      this.setState({
        scaleFact: 1,
      });
      this.zoom(1);
    }
    this.setState({
      sketchs: nextProps.sketchs
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.state.scaleFact, nextState.scaleFact) ||
      !_.isEqual(this.state.fullScreen, nextState.fullScreen) ||
      !_.isEqual(this.state.draggable, nextState.draggable) ||
      !_.isEqual(this.state.selected, nextState.selected);
  }

  zoom = (scale) => {
    // scaleFact当前图片缩放倍数
    this.setState({ scaleFact: scale });
    const { sketchs } = this.props;
    if (sketchs && sketchs.length > 0) {
      // 就是这里
      sketchs.map(s => s.zoom(scale));
    }
  };

  onScaleClick = (zoomIn) => {
    if (zoomIn) {
      this.zoom(this.state.scaleFact + 0.5 > 5 ? 5 : this.state.scaleFact + 0.5)
    } else {
      this.zoom(this.state.scaleFact - 0.5 < 1 ? 1 : this.state.scaleFact - 0.5)
    }
  };

  toggleDragClick = () => {
    this.setState({ draggable: !this.state.draggable }, () => {
      const { sketchs } = this.props;
      if (sketchs && sketchs.length > 0) {
        sketchs.map(s => s.draggable(this.state.draggable));
      }
    });

  };

  hideTrigger = () => {
    const { onHide, sketchs } = this.props;
    this.setState({ fullScreen: !this.state.fullScreen });
    if (onHide) {
      onHide();
    }
    if (sketchs && sketchs.length > 0) {
      sketchs.map(s => s._resize());
    }
  };

  draw = (type) => {
    this.setState({
      selected: type
    });
    const { onDraw } = this.props;
    onDraw(type);
  };


  render() {
    const { fullScreen, draggable, scaleFact, selected } = this.state;
    const { onHide } = this.props;
    const path = location.href.split('/');
    const length = path.length;


    return (
      <Fragment>
        <div className={styles.fd}>
          <div className={styles.toolbar}>
            <div className={styles.left}>
              <Tooltip title={draggable ? '锁定' : '自由移动'}>
                <Button onClick={() => this.toggleDragClick()}
                  type='ghost'
                  icon={draggable ? 'unlock' : 'lock'} />
              </Tooltip>

              <Tooltip title='放大'>
                <Button onClick={() => this.onScaleClick(true)}
                  type='ghost'
                  icon="plus-circle-o" />
              </Tooltip>

              <Tooltip title='还原'>
                <a onClick={() => this.zoom(1)}>{`${scaleFact * 100}%`}</a>
              </Tooltip>

              <Tooltip title='缩小'>
                <Button onClick={() => this.onScaleClick(false)}
                  type='ghost'
                  icon="minus-circle-o" />
              </Tooltip>
            </div>
            <div className={styles.center}>
              {
                path[length - 2] && path[length - 2] === 'znfz' ?
                  <span>
                    <Button onClick={() => this.draw('bbox')}
                      style={{ color: selected === 'bbox' ? 'blue' : '' }}
                      type='ghost'>
                      BBOX
                  </Button>
                    <Button onClick={() => this.draw('fingerprints')}
                      style={{ color: selected === 'fingerprints' ? 'blue' : '' }}
                      type='ghost'>
                      指纹
                  </Button>
                    <Button onClick={() => this.draw('postmarks')}
                      style={{ color: selected === 'postmarks' ? 'blue' : '' }}
                      type='ghost'>
                      邮戳
                  </Button>
                    <Button onClick={() => this.draw('signatures')}
                      style={{ color: selected === 'signatures' ? 'blue' : '' }}
                      type='ghost'>
                      签名
                  </Button>
                    <Button onClick={() => this.draw('stamps')}
                      style={{ color: selected === 'stamps' ? 'blue' : '' }}
                      type='ghost'>
                      印章
                  </Button>
                  </span>
                  : ''
              }
              &nbsp;
            </div>
            <div className={styles.right}>
              {
                onHide && (
                  <Tooltip title={fullScreen ? '退出全屏' : '全屏'}>
                    <Button onClick={this.hideTrigger}
                      type='ghost'
                      icon={fullScreen ? 'shrink' : 'arrows-alt'} />
                  </Tooltip>
                )
              }
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

class RotateImg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDeg: 0,
    }
  }

  translate = (e, value) => {
    const { currentDeg } = this.state;
    this.setState({
      currentDeg: value ? (currentDeg + value) % 360 : 0,
    }, () => {
      this.img.style.transform = `rotate(${this.state.currentDeg}deg)`;
    });
  }

  render() {
    return <Card type="inner" title={
      <div>
        <span style={{ fontWeight: 'bold' }}>{this.props.title}</span>
        <div style={{ float: 'right' }}>
          <Tooltip title="逆时针旋转">
            <Button shape="circle" icon="undo" onClick={(e) => this.translate(e, -90)} style={{ marginRight: 6 }}
              size="small" />
          </Tooltip>
          <Tooltip title="顺时针旋转">
            <Button shape="circle" icon="redo" onClick={(e) => this.translate(e, 90)} style={{ marginRight: 6 }}
              size="small" />
          </Tooltip>
          <Tooltip title="恢复">
            <Button shape="circle" icon="lock" onClick={(e) => this.translate(e)} style={{ marginRight: 12 }}
              size="small" />
          </Tooltip>
        </div>
      </div>
    }>
      <div style={{ width: '100%', textAlign: 'center' }}>
        <img src={this.props.src}
          ref={c => this.img = c}
          style={{ width: '90%' }} />
      </div>
    </Card>
  }
}

export default class DocPreview extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pages: this.buildPages(props.source),
      scrollPageNum: 0,
      fullScreen: false,
      currentDeg: 0,
    };

    this._stages = [];
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      pages: this.buildPages(nextProps.source),
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const nextPage = this.buildPages(nextProps.source);
    return !_.isEqual(this.state.pages, nextPage) || !_.isEqual(this.state.fullScreen, nextState.fullScreen);
  }

  componentWillUpdate() {
    this._stages = [];
    $(this.div).scrollTop(0);
  }

  // componentDidMount() {
  // 根据滚动切换页码

  // $(document).on('mousewheel DOMMouseScroll', (e)=>{
  //   e.preventDefault();
  //   const wheel = e.originalEvent.wheelDelta || -e.originalEvent.detail;
  //   const delta = Math.max(-1, Math.min(1, wheel));
  //   if (delta < 0) {
  //     console.log('下');
  //     mouseScroll= 'down';
  //   } else {
  //     console.log('上');
  //     mouseScroll = 'up';
  //   }
  // });

  // $(this.div).bind('scroll', _.throttle((e) => {
  //   const scrollTop = $(this.div).scrollTop();
  //   const height = $(this.div).height();
  //   const scrollHeight = this.div.scrollHeight;
  // console.log(scrollTop, height, scrollHeight);
  // if (scrollTop + height >= scrollHeight) {
  //   this.props.onPageChange('down')
  // } else if (scrollTop < 0) {
  //   // this.props.onPageChange('up')
  // }
  // }, 250));

  // }

  rebuildPos = (pos) => {
    if (_.isArray(pos)) {
      return pos.map(p1 => {
        if (!(/^0\s0\s.+$/.test(p1))) {
          return p1;
        }
      })
    } else if (_.isString(pos)) {
      if (!(/^0\s0\s.+$/.test(pos))) {
        return [pos];
      } else {
        return [];
      }
    } else {
      return [];
    }
  };

  rebuildPageData = (source) => {
    source = source || [];
    let pageData = [];
    source.map((page) => {
      if (!page || !page.image || page.image === 'null' || page.image === '') {
        return;
      }
      const index = pageData.findIndex(n => n.image === page.image);
      if (index < 0) {
        let p = {
          image: page.image,
          pos: [],
        };
        if (page.pos && page.pos.length > 0) {
          p.pos.push(...this.rebuildPos(page.pos));
        }
        pageData.push(p);
      } else {
        pageData[index].pos && pageData[index].pos.push(...this.rebuildPos(page.pos));
      }
    });
    return pageData;
  };

  buildPages = (source) => {
    if (source === null || source === undefined) {
      return [{ image: '' }];
    }
    const pageData = this.rebuildPageData(source);
    const pages = pageData.map((page, index) => {
      return {
        id: `img-${index}`,
        image: page.image,
        pos: page.pos,
      }
    });
    return _.orderBy(pages, 'image');
  };

  addSketch = (sketch) => {
    this._stages.push(sketch);
  };

  onScroll = () => {
    const clientHeight = document.body.clientHeight - 75;
    const num = Math.round($(this.div).scrollTop() / clientHeight);
    if (this.state.scrollPageNum !== num) {
      this.setState({ scrollPageNum: num });
      this.props.onScroll && this.props.onScroll(num);
    }
  };


  onDoubleClick = (image) => {
    this.setState({
      fullScreen: true,
      fullScreenImage: `/dzws/${image}`
    })
  };

  handleCancel = () => {
    this.setState({
      fullScreen: false,
    })
  };

  translate = (e, value) => {
    const { currentDeg } = this.state;
    this.setState({
      currentDeg: value ? (currentDeg + value) % 360 : 0,
    }, () => {
      this.img.style.transform = `rotate(${this.state.currentDeg}deg)`;
    });
  }

  render() {
    const { showToolbar = true, source } = this.props;
    return (
      <div className={styles.DocPreview} tabIndex={-1}>
        {
          showToolbar && <ToolBar sketchs={this._stages}
            onDraw={this.props.onDraw}
            onHide={this.props.onHide}
            onClick={this.props.onBtnClick}
            stage={this.props.stage}
          />
        }
        <Modal
          className={styles.modal}
          destroyOnClose={true}
          visible={this.state.fullScreen}
          title={
            <div style={{ float: 'right' }}>
              <Button onClick={this.handleCancel} icon='close'>关闭</Button>
            </div>}
          width={'90vw'}
          closable={false}
          footer={null}
        >
          {
            source && source.length > 0 ? source.map((item, index) => {
              return <RotateImg src={`/dzws/${item.image}`} key={index} title={`第  ${index + 1}/${source.length} 页`} />
            }) : ''
          }

        </Modal>
        <div className={styles.Container} onScroll={this.onScroll} ref={c => this.div = c}>
          {
            this.state.pages.map((page, index) => {
              return (
                <div onDoubleClick={() => this.onDoubleClick(page && page.image)} key={index}>
                  <ImageCanvas addSketch={this.addSketch}
                    page={page}
                    showRect={this.props.showRect}
                    onCopy={this.props.onCopy}
                    getLastMark={this.props.getLastMark}
                    onMark={this.props.onMark} />

                </div>
              );
            })
          }
        </div>


      </div>
    );
  }

}
