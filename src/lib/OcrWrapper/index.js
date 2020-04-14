import React, {PureComponent} from 'react';
import {Icon, Tooltip} from 'antd';
import _ from 'lodash';
import styles from './index.less';

export default class OcrWrapper extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      active: false,
      visible: false,
    }
  }

  componentDidMount() {
    this.mounted = true;
    if(this.wrapper) {
      this.wrapper.addEventListener('click', this.onClick, true);
      this.wrapper.addEventListener('focus', this.onClick, true);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    if(this.wrapper) {
      this.wrapper.removeEventListener('click', this.onClick, false);
      this.wrapper.removeEventListener('focus', this.onClick, false);
    }
  }

  onClick = () => {
    if(!this.mounted){
      return false;
    }
    if(!_.isEqual(this, window.activeOcrObject)){
      window.activeOcrObject && window.activeOcrObject.blur();
      window.activeOcrObject = this;
    }

    this.setState({active: true, visible: true}, () => {
      this.props.onClick && this.props.onClick();
      window.ocrCancel = () => {
        window.ocrListener = null;
        this.setState({active: false, visible: false});
      };
    });
  };

  focus = () => {
    this.onClick();
  };

  blur = () => {
    if(!this.mounted){
      return false;
    }
    this.setState({visible: false}, ()=> {
      window._currentCursorTarget = null;
      window._currentCursorPosition = null;
    });
  };

  render() {
    const {children} = this.props;
    return (
      <div tabIndex={-1} className={styles.default}
           ref={c => this.wrapper = c}>
        <Tooltip title={'从图片解析'}>
          <span style={{display: this.state.visible ? 'block' : 'none'}}
                className={styles.trigger}>
            <Icon type='select'/>
          </span>
        </Tooltip>
        {children}
      </div>
    )
  }
}
