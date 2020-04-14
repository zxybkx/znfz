/**
 *案件审查详情
 */
import React, {PureComponent} from 'react';
import {Modal, Button, Icon} from 'antd';
import Detail from './Detail';
import styles from './FactDetailModal.less';

export default class FactDetailModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    }
  }

  showModal = () => {
    this.setState({
      visible: true
    })
  };

  hideModelHandler = () => {
    this.setState({visible: false}, () => {
      this.props.onClose && this.props.onClose(true);
    });
  };

  render() {
    const {currentIndex, children, stage, ysay} = this.props;
    const {visible} = this.state;

    return (
      <span>
        <span onClick={this.showModal}>
          {children}
        </span>
      <Modal width='calc(100vw - 20px)'
             className={styles.modal}
             title={
               <span>
                   <span><Icon type='form'/> 文书及关联审查项处理</span>
                   <Button className="modal-close"
                           icon="close"
                           onClick={this.hideModelHandler}
                           type='ghost'>关闭</Button>
                 </span>
             }
             visible={visible}
             maskClosable={false}
             closable={false}
             onCancel={this.hideModelHandler}
             destroyOnClose={true}
             footer={null}>
        <Detail {...this.props} currentIndex={currentIndex} stage={stage} ysay={ysay}/>
      </Modal>
    </span>

    );
  }
}

