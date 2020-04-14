import React, {Component} from 'react';
import {Modal, Button, Icon} from 'antd';
import ProblemViewWindow from './ProblemViewWindow';
import styles from './index.less';


export default class ResultViewWindow extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  hideModelHandler = () => {
    const {dispatch, stage, match, query} = this.props;
    const bastPath = stage === 'ZJ' ? 'zcjd' : 'gsjd';
    dispatch({
      type: `${bastPath}/changeState`,
      payload: {
        problemResultVisible: false
      },
    });
    dispatch({
      type: `${bastPath}/getFact`,
      payload: {
        bmsah: match.params.id,
        tysah: query.tysah,
        ysay: query.ysay,
      },
    });
    dispatch({
      type: stage === 'ZJ' ? 'zcjd/getBybb' : 'gsjd/getSybs',
      payload: {
        bmsah: match.params.id,
        tysah: query.tysah,
        ysay: query.ysay,
      },
    });
  };

  render() {
    const {visible, ajxx, stage, dispatch, problem, docTree} = this.props;

    const windowProps = {
      ajxx,
      stage,
      dispatch,
      problem,
      docTree,
      close: this.hideModelHandler,
    };

    return (
      <Modal width='calc(100vw - 20px)'
             className={styles.default}
             title={
               <span>
                       <span><Icon type='question-circle'/> 关联问题 {problem && `-${problem.gzmc}`}</span>
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
        <ProblemViewWindow ref={(c) => this._window = c} {...windowProps}/>
      </Modal>
    );
  }
}


