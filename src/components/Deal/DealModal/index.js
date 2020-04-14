import React, {PureComponent} from 'react';
import {Modal, Button, Icon} from 'antd';
import ProblemDealWindow from './ProblemDealWindow';
import styles from './index.less';

export default class DealModal extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  showModelHandler = (e) => {
    if (e) e.stopPropagation();
    this.setState({
      visible: true,
    });
  };

  hideModelHandler = () => {
    if (this._window.state.shouldReload) {
      this._window.onReloadClick(this.close);
    } else {
      this.close();
    }
  };

  close = () => {
    this.setState({
      visible: false,
    }, () => this.props.refresh && this.props.refresh());
    window.ocrListener = null;
  };

  render() {

    const {ajxx, stage, dispatch, problem, docTree} = this.props;
    const {visible} = this.state;

    const windowProps = {
      ajxx,
      stage,
      dispatch,
      problem,
      docTree,
      close: this.hideModelHandler,
    };

    return (
      <span>
            <span onClick={this.showModelHandler}>
              {this.props.children}
            </span>
            <Modal width='calc(100vw - 20px)'
                   className={styles.default}
                   title={
                     <span>
                       <span><Icon type='form' /> 问题处理{problem && `-${problem.gzmc}`}</span>
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
                   footer={null}>
                <ProblemDealWindow ref={(c) => this._window = c} {...windowProps}/>
            </Modal>
            </span>
    );
  }
}
