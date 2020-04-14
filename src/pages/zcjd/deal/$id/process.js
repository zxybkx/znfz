import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Card, Modal} from 'antd';
import classnames from 'classnames';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import OnlineOffice from 'components/Deal/OnlineOffice';
import FlowStep from 'components/Deal/FlowStep';
import Tools from 'components/Deal/Tools';
import Session from 'utils/session';
import {getHttpHostPrefix} from 'utils/utils';
import {WOPI_HOST} from '../../../../constant';
import styles from './process.less';
import Authorized from 'utils/Authorized';

const {AuthorizedRoute} = Authorized;

const stage = 'ZJ';

class Process extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      fullScreen: false,
      currentDocument: '',
      docParam: {},
      docUrl: '',
      wsMessage: '',
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
      type: 'zcjd/loadDocData',
      payload: {
        stage,
        bmsah: match.params.id,
        wsmbmc: '讯问提纲',
        http_header: getHttpHostPrefix(),
      },
    }).then((result) => {
      if (result) {
        this.setState({
          wsMessage: result.message ? result.message : '',
        });
        result.message ? this.showWsConfirm() : '';
        this.fetchDocument('讯问提纲', result.uuid);
      }
    });
  };

  showWsConfirm = () => {
    const {wsMessage} = this.state;
    const info = <div style={{fontSize: 16,textIndent: '2em'}}>{wsMessage}</div>;
    Modal.error({
      title: '文书生成失败',
      content: info,
      okText: '确定',
      onOk(){},
    });
  };

  fetchDocument = (doc, data) => {
    const session = Session.get();
    if (session) {
      const token = session.access_token || session.token;
      const docParam = {
        WOPISrc: `http://gateway:8762/wopi/files/${data}`,
        access_token: token,
      };
      this.loadedDoc[doc] = data;
      this.setState({
        currentDocument: doc,
        docParam,
        docUrl: `http://${WOPI_HOST}/we/wordeditorframe.aspx`,
      })
    }
  };

  toggleFullScreen = () => {
    this.setState({fullScreen: !this.state.fullScreen});
  };

  onLoad = (activeKey) => {
    if (this.loadedDoc[activeKey]) {
      this.fetchDocument(activeKey, this.loadedDoc[activeKey]);
      return false;
    }
    const {dispatch, match} = this.props;
    dispatch({
      type: 'zcjd/loadDocData',
      payload: {
        stage,
        bmsah: match.params.id,
        wsmbmc: activeKey,
        http_header: getHttpHostPrefix(),
      },
    }).then((result) => {
      if (result) {
        this.setState({
          wsMessage: result.message ? result.message : '',
        });
        result.message ? this.showWsConfirm() : '';
        this.fetchDocument(activeKey,  result.uuid);
      }
    });
  };

  onPush = (docId) => {
    const {dispatch} = this.props;
    dispatch({
      type: 'znfz/pushDoc',
      payload: docId,
    }).then(({success, data}) => {
      if (success) {
        Modal.info({
          title: '正在推送',
          content: '从智能辅助系统推送到统一业务系统的文书,若该文书在统一业务系统需要更新,直接在智能辅助系统文书界面重新推送即可!请勿在统一业务系统直接删除该文书,避免文号跳号!',
          onOk() {
          },
        });
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
        type: 'zcjd/loadDocData',
        payload: {
          stage,
          bmsah: match.params.id,
          wsmbmc: currentDocument,
          http_header: getHttpHostPrefix(),
        },
      }).then((result) => {
        if (result) {
          this.setState({
            wsMessage: result.message ? result.message : '',
          });
          result.message ? this.showWsConfirm() : '';
          this.fetchDocument(currentDocument, result.uuid);
        }
      });
    });

  };

  render() {
    const {dispatch, match, zcjd} = this.props;
    const {params: {id}} = match;
    const {ajxx, coords} = zcjd;

    const flowStep = (
      <div className={styles.flow}>
        <div className={styles.steps}>
          <FlowStep match={match} dispatch={dispatch} bmsah={id} ajxx={ajxx} stage={stage}/>
        </div>
        <div className={styles.tools}>
          <Tools stage={stage}
                 coords={coords}
                 dispatch={dispatch}
                 ajxx={ajxx}
          />
        </div>
      </div>
    );

    let docs = [
      '讯问提纲',
    ];

    return (
      <PageHeaderLayout content={flowStep} wrapperClassName={styles.default}>
        <div className={classnames(styles.mask, this.state.fullScreen ? styles.fullScreen : '')}/>
        <Card className={classnames(styles.content, this.state.fullScreen ? styles.fullScreen : '')}>
          <OnlineOffice docs={docs}
                        currentDocument={this.state.currentDocument}
                        src={this.state.docUrl}
                        params={this.state.docParam}
                        dispatch={dispatch}
                        match={match}
                        onLoad={this.onLoad}
                        onPush={this.onPush}
                        onReload={this.onReload}/>
        </Card>
      </PageHeaderLayout>
    );
  }
}

@connect(({zcjd, znfz, loading}) => ({
  zcjd,
  znfz,
  loading: loading.effects['zcjd/loadDocData'],
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Process {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}
