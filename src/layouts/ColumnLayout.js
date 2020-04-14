import React from "react";
import $ from 'jquery';
import styles from "./ColumnLayout.less";
import {Icon} from 'antd';

class ColumnLayout extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      w: 260,
    };
    this.lastMouseX = 260;
  }

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
    let neww = w + (e.clientX - this.lastMouseX);
    this.resize(neww);
    this.lastMouseX = e.clientX;
  };

  resize = (w) => {
    w = w < 0 ? 0 : w;
    this.setState({
      w: w,
    });
    if (this.props.onResize) {
      this.props.onResize(w);
    }
  };

  toggleAside = () => {
    const {w} = this.state;
    this.setState({w: w === 0 ? 260 : 0})
  };

  render() {
    const {aside, children} = this.props;
    const {w} = this.state;
    return (
      <div className={styles.ColumnLayout}>
        <div className={styles.aside} style={{width: w}}>
          {aside}
        </div>
        <div  className={styles.ResizeTrigger}>
          <span className={styles.close} onClick={this.toggleAside}>
            <Icon type={w === 0 ? "caret-right" : "caret-left"} theme="filled"  />
          </span>
          <span className={styles.trigger} onMouseDown={this.onResizeTriggerDown}>
            <Icon type="swap" theme="outlined" />
          </span>
        </div>
        <div className={styles.main}>
          {children}
        </div>
      </div>
    );
  }
}

export default ColumnLayout;
