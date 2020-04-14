import React, {Component, Fragment} from 'react';
import _ from 'lodash';
import Delay from 'lodash-decorators/delay';
import Bind from 'lodash-decorators/bind';
import {message, Button, Tooltip} from 'antd';
import {CanvasDraw, Tools} from 'lib/CanvasDraw';
import styles from './index.less';
import {SCALEIMAGE} from '../../../constant';
import $ from 'jquery';

class ImageCanvas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      size: props.page.size,
      image: props.page.image,
      pos: props.page.pos,
      showRect: props.showRect === undefined ? true : props.showRect,
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
      size: nextProps.page.size,
    });
  }

  componentDidUpdate() {
    this.buildCanvasJSON(this.state.image, this.state.pos, this.state.size);
    const {addSketch} = this.props;
    if (addSketch && this._stage) {
      addSketch(this._stage);
    }
  }

  componentDidMount() {
    this.buildCanvasJSON(this.state.image, this.state.pos, this.state.size);
    const {addSketch} = this.props;
    if (addSketch && this._stage) {
      addSketch(this._stage);
    }
  }

  @Bind()
  @Delay(400)
  buildCanvasJSON = (image, pos, size) => {
    if (_.isEmpty(image)) {
      return;
    }

    if (SCALEIMAGE) {
      image = `${image}_q10${image.substring(image.indexOf('.'))}`;
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
      if (pos && pos.length > 0) {
        pos.forEach(p => {
          if (p && p.length > 0) {
            const arr = p.split(' ');
            if (arr && arr.length === 4) {
              const top = arr[1], left = arr[0], width = (arr[2] - arr[0]), height = (arr[3] - arr[1]);
              rects.push({
                className: 'Rect',
                attrs: {
                  x: left,
                  y: top,
                  width: width,
                  height: height,
                  fill: 'rgba(255,0,0,.2)',
                  stroke: 'rgba(255,0,0,.3)',
                  strokeWidth: 1,
                },
              });
            }
          }
        });
      }
      this._stage.addRect(rects);
    });
  };

  getDrawJson = () => {
    return this._stage.toJSON();
  };

  onChange = (e) => {
    if (e && e.type === 'mouseup' && e.button === 0) {
      const activeRect = this._stage.activeRect;
      const width = activeRect ? activeRect.width() : 0;
      const height = activeRect ? activeRect.height() : 0;
      if (width === 0 && height === 0) {
        this._stage.removeActiveRect();
      } else {
        if (width <= 5 || height <= 5) {
          message.warning('请指定有效的文字选取范围。');
          this._stage.removeActiveRect();
        } else {
          const {getLastMark} = this.props;
          if (getLastMark) {
            const x = activeRect.x();
            const y = activeRect.y();
            const {scaleX, scaleY} = this._stage.getImageScale();
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

  render() {

    const {onCopy} = this.props;

    const clientHeight = document.body.clientHeight;

    return (
      <div className={styles.image} style={{position: 'relative'}}>
        <CanvasDraw ref={(c) => this._stage = c}
                    tool={Tools.Rectangle}
                    lineColor='rgba(255,0,0,1)'
                    fillColor='rgba(255,0,0,.25)'
                    lineWidth={1}
                    height={clientHeight - 90}
                    onChange={this.onChange}
                    onCopy={onCopy}/>
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
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.state.scaleFact, nextState.scaleFact) ||
      !_.isEqual(this.state.fullScreen, nextState.fullScreen) ||
      !_.isEqual(this.state.draggable, nextState.draggable);
  }

  zoom = (scale) => {
    this.setState({scaleFact: scale});
    const {sketchs} = this.props;
    if (sketchs && sketchs.length > 0) {
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
    this.setState({draggable: !this.state.draggable}, () => {
      const {sketchs} = this.props;
      if (sketchs && sketchs.length > 0) {
        sketchs.map(s => s.draggable(this.state.draggable));
      }
    });

  };

  hideTrigger = () => {
    const {onHide, sketchs} = this.props;
    this.setState({fullScreen: !this.state.fullScreen});
    if (onHide) {
      onHide();
    }
    if (sketchs && sketchs.length > 0) {
      sketchs.map(s => s._resize());
    }
  };

  render() {
    const {fullScreen, draggable, scaleFact} = this.state;
    const {onHide} = this.props;

    return (
      <Fragment>
        <div className={styles.toolbar}
        style={{background:'red'}}>
          <div className={styles.left}>
            <Tooltip title='还原'>
              <a onClick={() => this.zoom(1)}>{`${scaleFact * 100}%`}</a>
            </Tooltip>
            <Tooltip title='缩小'>
              <Button onClick={() => this.onScaleClick(false)}
                      type='ghost'
                      icon="minus-circle-o"/>
            </Tooltip>
            <Tooltip title='放大'>
              <Button onClick={() => this.onScaleClick(true)}
                      type='ghost'
                      icon="plus-circle-o"/>
            </Tooltip>
            <Tooltip title={draggable ? '自由移动' : '锁定'}>
              <Button onClick={() => this.toggleDragClick()}
                      type='ghost'
                      icon={draggable ? 'unlock' : 'lock'}/>
            </Tooltip>
          </div>
          <div className={styles.center}>
            &nbsp;
          </div>
          <div className={styles.right}>
            {
              onHide && (
                <Tooltip title={fullScreen ? '退出全屏' : '全屏'}>
                  <Button onClick={this.hideTrigger}
                          type='ghost'
                          icon={fullScreen ? 'shrink' : 'arrows-alt'}/>
                </Tooltip>
              )
            }
          </div>
        </div>
      </Fragment>
    );
  }
}

export default class DocPreview extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pages: this.buildPages(props.source),
    };

    this._stages = [];
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      pages: this.buildPages(nextProps.source),
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.props.source, nextProps.source);
  }

  componentWillUpdate() {
    this._stages = [];
    // $(this.div).scrollTop(0);
  }

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
          size: page.size,
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
      return [{image: ''}];
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

  render() {
    const {showToolbar = true} = this.props;
    return (
      <div className={styles.DocPreview}>
        {
          showToolbar && <ToolBar sketchs={this._stages} onHide={this.props.onHide}/>
        }
        <div className={styles.Container} ref={c => this.div = c}>
          {
            this.state.pages.map((page, index) => {
              return (
                <ImageCanvas addSketch={this.addSketch}
                             key={index}
                             page={page}
                             showRect={this.props.showRect}
                             onCopy={this.props.onCopy}
                             getLastMark={this.props.getLastMark}
                             onMark={this.props.onMark}/>
              );
            })
          }
        </div>
      </div>
    );
  }

}
