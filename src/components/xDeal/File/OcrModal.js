import React, {PureComponent} from 'react';
import {Input, message, Modal} from 'antd';
import qs from "qs";

export default class OcrModal extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      visible: false
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (e) => {
    // if (/.*file.*/.test(window.location.href)) {
    if (e.key === 'F4') {
      this.setState({
        visible: true,
      });
    }
    // }
  };

  handleOk = () => {
    if (this.state.value === 'ocr') {
      this.setState({
        visible: false,
      });
      const {bmsahAndImage} = this.props;
      window.open(`/cm/znfz/ocr?${qs.stringify(bmsahAndImage)}`)
    } else {
      message.error('密码错误')
    }
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  onBlur = (e) => {
    this.setState({
      value: e.target.value,
    });
  };

  render() {

    return (
      <Modal
        visible={this.state.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        title="ocr解析"
      >
        <Input placeholder="请输入密码" onBlur={this.onBlur}/>
      </Modal>
    );
  }
}
