import React, {Component} from 'react';
import {Modal} from 'antd';
import {connect} from 'dva';
import ProblemViewWindow from 'components/Deal/ViewModal/ProblemViewWindow';
import styles from './result.less'

@connect(({znfz, loading}) => ({
  znfz,
  loading: loading.effects['znfz/getProblems'],
}))
export default class ResultView extends Component {

  constructor(props) {
    super(props);
  };

  componentDidMount() {
    const {dispatch, location: {query}} = this.props;
    const {linkid} = query;

    dispatch({
      type: 'znfz/getWsLinkData',
      payload: {
        id: linkid,
      },
    }).then(({data, success}) => {
      if (success) {
        const {bmsah, keyid, stage} = data;
        const _keyid = keyid.match(/YSJL_(.*)/)[1];
        dispatch({
          type: `znfz/changeState`,
          payload: {
            stage,
          },
        });
        dispatch({
          type: `znfz/getAjxx`,
          payload: {
            bmsah,
          },
        });
        dispatch({
          type: `znfz/getTree`,
          payload: {
            bmsah,
          },
        });
        dispatch({
          type: `znfz/getProblemByKey`,
          payload: {
            bmsah,
            keyid: _keyid,
            stage,
          },
        });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
  }


  render() {
    const {dispatch} = this.props;

    const {znfz: {stage}} = this.props;
    let windowProps = {
      stage,
      dispatch,
      close: () => {
        window.close();
      },
    };

    const {znfz: {ajxx, problem, docTree}} = this.props;
    windowProps = Object.assign({}, windowProps, {ajxx, problem, docTree});

    return (
      <Modal className={styles.modal}
             width='calc(100vw - 20px)'
             visible={true}
             maskClosable={false}
             closable={false}
             onCancel={null}
             footer={null}>
        <ProblemViewWindow {...windowProps}/>
      </Modal>
    );
  }
}
