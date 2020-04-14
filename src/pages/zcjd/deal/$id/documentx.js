import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Card} from 'antd';
import classnames from 'classnames';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import FlowStep from 'components/Deal/FlowStep';
import Tools from 'components/Deal/Tools';
import DocEditor from 'components/Deal/DocEditor';
import ViewModal from 'components/Deal/ViewModal';
import Authorized from 'utils/Authorized';
import styles from './document.less';

const {AuthorizedRoute} = Authorized;

const stage = 'ZJ';

class DocumentX extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      fullScreen: false,
      currentDocument: '',
      docData: {},
    };
    this.loadedDoc = {};
  }

  componentDidMount() {
    const {dispatch, match} = this.props;
    dispatch({
      type: 'zcjd/getAjxx',
      payload: {
        bmsah: match.params.id,
      },
    });
    dispatch({
      type: 'znfz/getTree',
      payload: {
        bmsah: match.params.id,
      },
    });
    dispatch({
      type: 'zcjd/_loadDocData',
      payload: {
        stage,
        bmsah: match.params.id,
        wsmbmc: '审查逮捕意见书',
      },
    }).then(({success, data}) => {
      if (success) {
        this.fetchDocument('审查逮捕意见书', data);
      }
    });
  }

  toggleFullScreen = () => {
    this.setState({fullScreen: !this.state.fullScreen});
  };

  fetchDocument = (doc, data) => {
    this.loadedDoc[doc] = data;
    this.setState({
      currentDocument: doc,
      docData: data,
    })
  };

  onLoad = (activeKey) => {
    if (this.loadedDoc[activeKey]) {
      this.fetchDocument(activeKey, this.loadedDoc[activeKey]);
      return false;
    }
    const {dispatch, match} = this.props;
    dispatch({
      type: 'zcjd/_loadDocData',
      payload: {
        stage,
        bmsah: match.params.id,
        wsmbmc: activeKey,
      },
    }).then(({success, data}) => {
      if (success) {
        this.fetchDocument(activeKey, data);
      }
    });
  };

  onReload = () => {
    const {dispatch, match, zcjd: {ajxx}} = this.props;
    const {currentDocument} = this.state;
    dispatch({
      type: 'zcjd/removeDocData',
      payload: {
        stage,
        ajxx,
        wsmbmc: currentDocument,
      },
    }).then(() => {
      dispatch({
        type: 'zcjd/_loadDocData',
        payload: {
          stage,
          bmsah: match.params.id,
          wsmbmc: currentDocument,
        },
      }).then(({success, data}) => {
        if (success) {
          this.fetchDocument(currentDocument, data);
        }
      });
    });

  };

  onModalClose = () => {
    this.props.dispatch({
      type: 'zcjd/changeState',
      payload: {
        problemResultVisible: false,
        docViewVisible: false
      }
    })
  };

  render() {
    const {dispatch, match, zcjd, znfz} = this.props;
    const {params: {id}} = match;
    const {docTree} = znfz;
    const {docData} = this.state;

    const {ajxx, problem, coords, problemResultVisible, docViewVisible} = zcjd;
    const resultModalProps = {
      stage, ajxx, dispatch, problem, docTree, visible: problemResultVisible, onClose: this.onModalClose
    };

    const flowStep = (
      <div className={styles.flow}>
        <div className={styles.steps}>
          <FlowStep match={match} dispatch={dispatch} bmsah={id} stage={stage} ajxx={ajxx}/>
        </div>
        <div className={styles.tools}>
          <Tools stage={stage}
                 coords={coords}
                 dispatch={dispatch}
                 ajxx={ajxx}
                 docViewVisible={docViewVisible}
                 onClose={this.onModalClose}/>
        </div>
      </div>
    );

    let docs = [
      '审查逮捕意见书',
      '纠正违法通知书',
      '检察建议书',
    ];

    return (
      <PageHeaderLayout content={flowStep} wrapperClassName={styles.default}>
        <div className={classnames(styles.mask, this.state.fullScreen ? styles.fullScreen : '')}/>
        <Card className={classnames(styles.content, this.state.fullScreen ? styles.fullScreen : '')}>
          <DocEditor docs={docs}
                     stage={stage}
                     dispatch={dispatch}
                     currentDocument={this.state.currentDocument}
                     ajxx={ajxx}
                     docData={docData}
                     onLoad={this.onLoad}
                     onReload={this.onReload}/>
        </Card>
        <ViewModal {...resultModalProps}/>
      </PageHeaderLayout>
    );
  }
}

@connect(({znfz, zcjd, loading}) => ({
  znfz,
  zcjd,
  loading: loading.effects['zcjd/_loadDocData'],
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <DocumentX {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}


