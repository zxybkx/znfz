import React, {Component} from 'react';
import classnames from 'classnames';
import {Icon} from 'antd';
import $ from 'jquery';
import _ from 'lodash';
import styles from './index.less';

let commonZIndex = 300;
let commonWindows = [];
let minimizedWindows = [];

export default class Window extends Component {
  static defaultProps = {
    color: '#4475cc',
    theme: 'light',
    visible: false,
    showStatus: true,
    lastMouseX: 0,
    lastMouseY: 0,
    lastX: 200,
    lastY: 60,
    lastWidth: 400,
    lastHeight: 300,
    width: document.body.clientWidth * 0.6,
    height: document.body.clientHeight * 0.8,
    x: 200,
    y: 60,
    zIndex: commonZIndex,
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: props.visible,
      draggable: true,
      isMaximized: false,
      isMinimized: false,
      zIndex: props.zIndex,
      x: props.x,
      y: props.y,
      w: props.width,
      h: props.height,
    };
    this.id = `window-${Math.floor(Math.random() * 1000)}`;
    this.lastMouseX = props.lastMouseX;
    this.lastMouseY = props.lastMouseY;
    this.lastX = props.lastX;
    this.lastY = props.lastY;
    this.lastWidth = props.width;
    this.lastHeight = props.height;
    this.windowWidth = $(window).width();
    this.windowHeight = $(window).height();
    this.restoreCoords = {
      x: this.lastX,
      y: this.lastY,
      w: this.lastWidth,
      h: this.lastHeight,
    }
  }

  componentDidMount() {
    //initial the content size
    if (this.props.onResize) {
      this.props.onResize(this.state.w, this.state.h);
    }
    if (commonWindows) {
      this.setState({
        x: this.state.x + commonWindows.length,
        y: this.state.y + commonWindows.length,
      });
      commonWindows.push(this);
    }

    this.setContainer();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.visible,
    })
  }

  componentWillUnmount() {
  }

  setContainer = () => {
    let {container} = this.props;
    if (!container) {
      container = window.document.body;
    }

    this.cx = $(container).offset().left;
    this.cy = $(container).offset().top;
    this.cw = $(container).width();
    this.ch = $(container).height();
  };

  setFocus = () => {
    this.setState({zIndex: commonZIndex++});
  };

  setBodySelection = (flag) => {
    $(this.window).css('user-select', !!flag ? 'auto' : 'none');
  };

  onTitleDown = (e) => {
    if (this.state.isMinimized || this.state.isMaximized) {
      return false;
    }
    this.setFocus();
    const _this = this;
    e = e ? e : window.event;
    this.lastMouseX = e.nativeEvent.clientX;
    this.lastMouseY = e.nativeEvent.clientY;

    $(document).bind('mousemove', function (e) {
      _this.dragging(e);
    });

    $(document).bind('mouseup', function (e) {
      $(document).unbind('mousemove');
      $(document).unbind('mouseup');
    });

    this.setBodySelection(false);
  };

  dragging = (e) => {
    if (this.state.draggable) {
      e = e ? e : window.event;
      if (e.clientX > this.cx + this.cw || e.clientX < this.cx
        || e.clientY > this.cy + this.ch || e.clientY < this.cy) {
        return false;
      }
      this.move(e);
    }
  };

  move = function (e) {

    let {x, y} = this.state;
    x = x + (e.clientX - this.lastMouseX);
    y = y + (e.clientY - this.lastMouseY);

    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.lastX = x;
    this.lastY = y;

    this.setState({
      x: x,
      y: y,
    });

    this.setBodySelection(true);
  };

  onResizeTriggerDown = (e) => {
    if (this.state.isMinimized || this.state.isMaximized) {
      return false;
    }
    this.setFocus();
    const _this = this;
    e = e ? e : window.event;
    this.lastMouseX = e.nativeEvent.clientX;
    this.lastMouseY = e.nativeEvent.clientY;

    const trigger = $(e.target).attr('data');

    $(document).bind('mousemove', function (e) {
      _this.resizing(e, trigger);
    });

    $(document).bind('mouseup', function (e) {
      $(document).unbind('mousemove');
      $(document).unbind('mouseup');
    });

    this.setBodySelection(false);
  };

  resizing = (e, trigger) => {

    e = e ? e : window.event;

    if (e.clientX > this.cx + this.cw || e.clientX < this.cx
      || e.clientY > this.cy + this.ch || e.clientY < this.cy) {
      return false;
    }

    let {w, h, x, y} = this.state;
    w = _.isNumber(w) ? w : $(this.window).width();
    h = _.isNumber(h) ? h : $(this.window).height();

    let newh, neww, newx, newy;
    switch (trigger) {
      case 't':
        newh = h - (e.clientY - this.lastMouseY);
        newy = y + (e.clientY - this.lastMouseY);
        this.resize(this.state.w, newh, this.state.x, newy);
        break;
      case 'b':
        newh = h + (e.clientY - this.lastMouseY);
        this.resize(this.state.w, newh, this.state.x, this.state.y);
        break;
      case 'l':
        neww = w - (e.clientX - this.lastMouseX);
        newx = x + (e.clientX - this.lastMouseX);
        this.resize(neww, this.state.h, newx, this.state.y);
        break;
      case 'r':
        neww = w + (e.clientX - this.lastMouseX);
        this.resize(neww, this.state.h, this.state.x, this.state.y);
        break;
      case 'br':
        neww = w + (e.clientX - this.lastMouseX);
        newh = h + (e.clientY - this.lastMouseY);
        this.resize(neww, newh, this.state.x, this.state.y);
        break;
    }

    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
  };

  resize = (w, h, x, y) => {

    h = h < 150 ? 150 : h;
    w = w < 250 ? 250 : w;

    this.lastWidth = w;
    this.lastHeight = h;
    this.lastX = x;
    this.lastY = y;

    this.setState({
      w: w,
      h: h,
      x: x,
      y: y,
    }, ()=> {
      this.restoreCoords = {
        w: w,
        h: h,
        x: x,
        y: y,
      };
      this.setBodySelection(true);
      if (this.props.onResize) {
        this.props.onResize(w, h);
      }
    });
  };

  close = () => {
    if (this.props.onClose) {
      this.props.onClose();
    }
    this.restore();
  };

  restore = () => {
    this.setState({
      isMaximized: false,
      isMinimized: false,
      ...this.restoreCoords,
    });
  };

  toggleMinimize = () => {
    let _x, _y, _w, _h;
    if (this.state.isMinimized) {
      _x = this.restoreCoords.x;
      _y = this.restoreCoords.y;
      _w = this.restoreCoords.w;
      _h = this.restoreCoords.h;
      _.remove(minimizedWindows, id => id === this.id);
    } else {
      const {fixed = true} = this.props;
      _w = 300;
      _h = 39;
      if(fixed){
        _x = $(window).width() - 310;
        if (minimizedWindows.length === 1 && minimizedWindows[0] === this.id) {
          _y = $(window).height() - 55;
        } else {
          _y = $(window).height() - 55 * (minimizedWindows.length + 1);
        }
      }else{
        _x = this.cw - 310;
        if (minimizedWindows.length === 1 && minimizedWindows[0] === this.id) {
          _y = this.ch  - 60;
        } else {
          _y = this.ch  - 60 * (minimizedWindows.length + 1);
        }
      }

      const index = _.findIndex(minimizedWindows, (id) => id === this.id);
      if (index < 0) {
        minimizedWindows.push(this.id);
      }
    }

    this.setState({
      isMaximized: false,
      isMinimized: !this.state.isMinimized,
      x: _x,
      y: _y,
      w: _w,
      h: _h,
    });

    if (this.props.onResize) {
      this.props.onResize(_w, _h);
    }
  };

  toggleMaximize = () => {
    const {fixed = true} = this.props;
    let _x, _y, _w, _h;
    if (this.state.isMaximized) {
      _x = this.restoreCoords.x;
      _y = this.restoreCoords.y;
      _w = this.restoreCoords.w;
      _h = this.restoreCoords.h;
    } else {
      let width = fixed ? 'calc(100vw - 20px)' : 'calc(100% - 20px)';
      let height = fixed ? 'calc(100vh - 20px)' : 'calc(100% - 20px)';
      _w = width;
      _h = height;
      _x = 0;
      _y = 0;
    }

    this.setState({
      isMinimized: false,
      isMaximized: !this.state.isMaximized,
      x: _x,
      y: _y,
      w: _w,
      h: _h,
    });
    if (this.props.onResize) {
      this.props.onResize(w, h);
    }
  };

  render() {
    const {title = '数据编辑', icon = 'edit', fixed = true, closable = true} = this.props;
    const {visible, isMaximized, isMinimized, zIndex, w, h, x, y} = this.state;
    const left = x < 0 ? 0 : (x > this.windowWidth ? this.windowWidth - 50 : x);
    const top = y < 0 ? 0 : (y > this.windowHeight ? this.windowHeight - 50 : y);

    return (
      <div className={styles.Window}
           ref={c => this.window = c}
           onClick={(e) => {
             this.setFocus();
             e.stopPropagation();
           }}
           style={{
             position: fixed ? 'fixed' : 'absolute',
             display: visible ? 'flex' : 'none',
             zIndex: zIndex,
             left: left,
             top: top,
             width: w,
             height: h,
           }}>
        <div onMouseDown={this.onResizeTriggerDown} data="t"
             className={classnames(styles.ResizeTrigger, styles.top)}>&nbsp;</div>
        <div onMouseDown={this.onResizeTriggerDown} data="l"
             className={classnames(styles.ResizeTrigger, styles.left)}>&nbsp;</div>
        <div onMouseDown={this.onResizeTriggerDown} data="b"
             className={classnames(styles.ResizeTrigger, styles.bottom)}>&nbsp;</div>
        <div onMouseDown={this.onResizeTriggerDown} data="r"
             className={classnames(styles.ResizeTrigger, styles.right)}>&nbsp;</div>
        <div className={styles.TitleBar} onMouseDown={this.onTitleDown}>
          <div className={styles.Title}>
            {
              icon && icon.length > 0 && <Icon className={styles.Icon} type={icon}/>
            }
            &nbsp;{title}
          </div>
          <div className={styles.Operation}>
            <ul>
              <li onClick={this.toggleMinimize}><Icon className={styles.Icon}
                                                      type={isMinimized ? 'block' : 'minus'}/>
              </li>
              <li onClick={this.toggleMaximize}>
                <Icon className={styles.Icon} type={isMaximized ? 'block' : 'border'}/>
              </li>
              {
                closable && (
                  <li onClick={this.close} className={styles.close}>
                    <Icon className={styles.Icon} type="close"/>
                  </li>
                )
              }
            </ul>
          </div>
        </div>
        <div className={styles.Container} style={{display: isMinimized ? 'none' : 'block'}}>
          {this.props.children}
        </div>
        <div className={styles.StatusBar} style={{display: this.state.showStatus ? (isMinimized ? 'none' : 'block') : 'none'}}>
          &nbsp;
          <div className={classnames(styles.ResizeTrigger)} onMouseDown={this.onResizeTriggerDown} data="br">
          </div>
        </div>
      </div>
    );
  }
}
