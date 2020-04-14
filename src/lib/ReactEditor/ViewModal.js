import React, {PureComponent} from 'react';
import {Modal, Button} from 'antd';

export default class MyModal extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      content: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      visible: nextProps.visible,
      content: nextProps.content,
    });
  }

  hideModelHandler = () => {
    this.setState({
      visible: false,
    });
    this.props.close();
  };

  render() {

    const {visible, content} = this.state;

    return (
      <Modal className="ccidit-ant-modal-custom"
             width='99%'
             title={
               <span>
                       <span>模版内容</span>
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
             footer={null}
             style={{
               top: '5px',
               height: '98%',
               minHeight: '98%',
               paddingBottom: 0
             }}>
        <textarea style={{width: '100%', height: '100%'}} value={content}/>
      </Modal>
    );
  }
}
