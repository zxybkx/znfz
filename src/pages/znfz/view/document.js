import React, {Component} from 'react';
import {connect} from 'dva';
import {Modal, Card} from 'antd';
import DocView from 'components/Deal/DocViewModal/DocView';
import styles from './document.less';

@connect(({znfz, loading}) => ({
  znfz,
  loading: loading.effects['znfz/getProblems'],
}))
export default class ResultView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      coords: [],
    }
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
        const {bmsah, coords, stage} = data;
        const basePath = stage === 'ZJ' ? 'zcjd' : 'gsjd';
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
        this.setState({coords: coords.coords})
      }
    })
  }

  render() {
    const {dispatch, stage} = this.props;

    let windowProps = {
      stage,
      dispatch,
      coords: this.state.coords,
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
        <DocView {...windowProps}/>
      </Modal>
    );
  }
}
