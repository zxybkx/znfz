import React, {PureComponent, Fragment} from 'react';
import {connect} from 'dva';
import {Card, Modal} from 'antd';
import OnlineOffice from 'components/xDeal/OnlineOffice';
import Session from 'utils/session';
import {getHttpHostPrefix} from 'utils/utils';
import {PROVENCE_SHORT_CODE, WOPI_HOST} from '../../../../constant';
import _ from 'lodash';

const confirm = Modal.confirm;

@connect(({znfz, xgsjd, loading}) => ({
  znfz,
  xgsjd,
  loading: loading.effects['xgsjd/getProblems'],
}))
export default class Document extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fullScreen: false,
      currentDocument: '',
      docParam: {},
      docUrl: '',
      docId: '',
      wsMessage: '',
    };
    this.loadedDoc = {};
  }

  componentDidMount() {
    const {dispatch, match, history, stage} = this.props;
    const query = history.location.query;
    dispatch({
      type: 'znfz/getAjxx',
      payload: {
        bmsah: match.params.id,
      },
    });

    dispatch({
      type: 'znfz/getDocConfigs',
      payload: {
        bmsah: match.params.id,
        dwbm: PROVENCE_SHORT_CODE,
        stage,
      },
    }).then(() => {
      const {znfz: {docConfigs, ajxx}} = this.props;
      if (query.wsmbmc && query.bgr) {
        const payload = {
          ysay: ajxx.ysay_aymc,
          tysah: ajxx.tysah,
          stage,
          bmsah: match.params.id,
          wsmbmc: query.wsmbmc,
          bgr: query.bgr,
          http_header: getHttpHostPrefix(),
        };
        dispatch({
          type: 'znfz/loadDocData',
          payload: payload,
        }).then((result) => {
          if (result) {
            this.setState({
              docId: result.uuid,
              wsMessage: result.message ? result.message : '',
            });
            result.message ? this.showWsConfirm() : '';
            const doc = query.wsmbmc + '-' + query.bgr;
            this.fetchDocument(doc, result.uuid);
          }
        });
      } else if (query.wsmbmc) {
        const payload = {
          ysay: ajxx.ysay_aymc,
          tysah: ajxx.tysah,
          stage,
          bmsah: match.params.id,
          wsmbmc: query.wsmbmc,
          http_header: getHttpHostPrefix(),
        };
        dispatch({
          type: 'znfz/loadDocData',
          payload: payload,
        }).then((result) => {
          if (result) {
            this.setState({
              docId: result.uuid,
              wsMessage: result.message ? result.message : '',
            });
            result.message ? this.showWsConfirm() : '';
            const doc = query.wsmbmc;
            this.fetchDocument(doc, result.uuid);
          }
        });
      } else {
        if (docConfigs && docConfigs.length > 0) {
          const filterDocs = _.filter(docConfigs, o => {
            return o.znfz_doc_config.process === 'yes'
          });
          const wsmbmc = filterDocs[0] && filterDocs[0].znfz_doc_config && filterDocs[0].znfz_doc_config.wsmbmc;
          const payload = filterDocs[0] && filterDocs[0].bgrs && filterDocs[1].bgrs.length > 0 ?
            {
              ysay: ajxx.ysay_aymc,
              tysah: ajxx.tysah,
              stage,
              bmsah: match.params.id,
              wsmbmc: wsmbmc,
              bgr: filterDocs[0].bgrs[0],
              http_header: getHttpHostPrefix(),
            } : {
              ysay: ajxx.ysay_aymc,
              tysah: ajxx.tysah,
              stage,
              bmsah: match.params.id,
              wsmbmc: wsmbmc,
              http_header: getHttpHostPrefix(),
            };
          dispatch({
            type: 'znfz/loadDocData',
            payload: payload,
          }).then((result) => {
            if (result) {
              this.setState({
                wsMessage: result.message ? result.message : '',
              });
              result.message ? this.showWsConfirm() : '';
              this.fetchDocument(wsmbmc, result.uuid);
            }
          });
        }
      }


    });

    dispatch({
      type: 'znfz/getTree',
      payload: {
        bmsah: match.params.id,
      },
    });

    dispatch({
      type: 'znfz/getSybs',
      payload: {
        bmsah: match.params.id,
        tysah: query.tysah,
        ysay: query.ysay,
      },
    });

  }

  showWsConfirm = () => {
    const {wsMessage} = this.state;
    const info = <div style={{fontSize: 16, textIndent: '2em'}}>{wsMessage}</div>;
    Modal.error({
      title: '文书生成失败',
      content: info,
      okText: '确定',
      onOk(){
      },
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

  onLoad = (doc) => {
    const {stage} = this.props;
    if (this.loadedDoc[doc]) {
      this.fetchDocument(doc, this.loadedDoc[doc]);
      return false;
    }
    const {dispatch, match} = this.props;
    const docs = doc.split('-');
    const payload = docs[1] ?
      {
        stage,
        bmsah: match.params.id,
        wsmbmc: docs[0],
        bgr: docs[1],
        http_header: getHttpHostPrefix(),
      } : {
        stage,
        bmsah: match.params.id,
        wsmbmc: doc,
        http_header: getHttpHostPrefix(),
      };
    dispatch({
      type: 'znfz/loadDocData',
      payload: payload,
    }).then((result) => {
      if (result) {
        this.setState({
          wsMessage: result.message ? result.message : '',
        });
        result.message ? this.showWsConfirm() : '';
        this.fetchDocument(doc, result.uuid);
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
    const {dispatch, match, znfz: {ajxx}, stage} = this.props;
    const {currentDocument} = this.state;
    dispatch({
      type: 'znfz/removeDocData',
      payload: {
        stage,
        ajxx,
        wsmbmc: currentDocument,
      },
    }).then(() => {
      const docs = currentDocument.split('-');
      const payload = docs[1] ?
        {
          ysay: ajxx.ysay_aymc,
          tysah: ajxx.tysah,
          stage,
          bmsah: match.params.id,
          wsmbmc: docs[0],
          bgr: docs[1],
          http_header: getHttpHostPrefix(),
        } : {
          ysay: ajxx.ysay_aymc,
          tysah: ajxx.tysah,
          stage,
          bmsah: match.params.id,
          wsmbmc: currentDocument,
          http_header: getHttpHostPrefix(),
        };
      dispatch({
        type: 'znfz/loadDocData',
        payload: payload,
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
    const {znfz: {docConfigs}, dispatch, match,history} = this.props;
    const session = Session.get();
    const query = history.location.query;


    const filterDoc = _.filter(docConfigs, o => {
      return o && o.znfz_doc_config.process === 'yes'
    });
    let docs = _.map(filterDoc, (d) => {
      const config = d.znfz_doc_config;
      const code = session.dwbm.substr(4, 2);
      if (config && config.zdwbm === null || config && config.zdwbm === code) {
        const doc = {
          bgrs: d.bgrs,
          multiple: config.multiple,
          wsmbmc: config.wsmbmc,
        };
        return doc && doc;
      }
    });


    let jldocs = _.map(docConfigs, (d) => {
      const config = d.znfz_doc_config;
      const code = session.dwbm.substr(4, 2);
      if (config && config.zdwbm === null || config && config.zdwbm === code) {
        const doc = {
          bgrs: d.bgrs,
          multiple: config.multiple,
          wsmbmc: config.wsmbmc,
        };
        return doc;
      }
    });

    return (
      <Fragment>
        <OnlineOffice docs={docs}
                      jldocs={jldocs}
                      query={query}
                      currentDocument={this.state.currentDocument}
                      src={this.state.docUrl}
                      params={this.state.docParam}
                      onLoad={this.onLoad}
                      onPush={this.onPush}
                      dispatch={dispatch}
                      match={match}
                      showTips = {query && query.showTips}
                      docId={this.state.docId}
                      onReload={this.onReload}/>
      </Fragment>
    );
  }
}

