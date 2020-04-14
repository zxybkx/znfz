import React, {Component} from 'react';
import {Modal, Button, Icon} from 'antd';
import styles from './index.less';
import DocView from './DocView';


export default class DocViewModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: props.docViewVisible,
    };
  }

  componentWillReceiveProps(nextProps) {
    const {docViewVisible} = nextProps;
    this.setState({
      visible: docViewVisible
    })
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
                        <span><Icon type='book'/> 电子卷宗</span>
                        <Button className="modal-close" icon="close" type='ghost'
                                onClick={this.hideModelHandler}>关闭</Button>
                    </span>}
             visible={visible}
             maskClosable={false}
             closable={false}
             onCancel={this.hideModelHandler}
             footer={null}>
        <DocView {...this.props}/>
      </Modal>
      </span>
    );
  }
}




