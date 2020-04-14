import React, {PureComponent} from 'react';
import {Modal, Button, Icon} from 'antd';
import styles from './index.less';

export default class CustomModal extends PureComponent{

  constructor(props) {
    super(props);
    this.state = {
      visible: props.visible,
    };
  }

  componentWillReceiveProps(nextProps){
    this.setState({visible: nextProps.visible});
  }

  visibleHandle = ()=> {
    this.setState({visible: false}, ()=> {
      const {onClose} = this.props;
      onClose && onClose();
    });

  };

  render(){
    const {title, footer, icon, children} = this.props;
    const {visible} = this.state;
    return (
      <Modal width='calc(100vw - 20px)'
             className={styles.default}
             title={
               <span>
                       <span><Icon type={icon || 'form'} /> {title}</span>
                       <Button className="modal-close"
                               icon="close"
                               onClick={this.visibleHandle}
                               type='ghost'>关闭</Button>
                     </span>
             }
             visible={visible}
             maskClosable={false}
             closable={false}
             footer={footer || null}
             onCancel={this.visibleHandle}
      >
        {children}
      </Modal>
    );
  }
}
