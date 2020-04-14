import React, {PureComponent} from 'react';
import {Modal, Button, Icon} from 'antd';
import styles from './ImageModal.less';

export default class ImageModal extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  };

  showModelHandler = (e) => {
    if (e) {
      e.stopPropagation();
    }
    ;
    this.setState({
      visible: true,
    });
  };

  hideModelHandler = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const {src, children} = this.props;
    return (
      <span>
        <span onClick={this.showModelHandler}>
          {children}
        </span>
        <Modal width='calc(100vw - 20px)'
               className={styles.default}
               title={<span>
                       <span><Icon type='question-circle'/>系统问题截图</span>
                       <Button className="modal-close"
                               icon="close"
                               onClick={this.hideModelHandler}
                               type='ghost'>关闭</Button>
                     </span>}
               closable={false}
               visible={this.state.visible}
               onCancel={this.hideModelHandler}
               footer={null}
        >
          <img src={src} style={{width: '100%', height: '100%'}}/>
        </Modal>
      </span>
    );
  }
}


