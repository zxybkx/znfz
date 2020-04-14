import React, {Component} from 'react';
import {Modal, Button, Icon} from 'antd';
import styles from './index.less';
import AjxxInfo from './AjxxInfo';

export default class AjxxModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
  }

  showModelHandler = (e) => {
    if (e) e.stopPropagation();
    this.setState({
      visible: true,
    });
  };

  hideModelHandler = () => {
    this.setState({visible: false}, ()=> {
      this.props.onClose && this.props.onClose();
    })
  };

  render() {
    const {visible} = this.state;
    return (
      <span>
            <span onClick={this.showModelHandler}>
              {this.props.children}
            </span>
      <Modal className={styles.default}
             width='calc(100vw - 20px)'
             title={<span>
                        <span><Icon  type="align-left"/> 案件信息</span>
                        <Button className="modal-close" icon="close" type='ghost'
                                onClick={this.hideModelHandler}>关闭</Button>
                    </span>}
             visible={visible}
             maskClosable={false}
             closable={false}
             onCancel={this.hideModelHandler}
             footer={null}>
        <AjxxInfo {...this.props}/>
      </Modal>
      </span>
    );
  }
}


