import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Card, Form, Row, Col, Checkbox, Select, Modal, Steps, Popconfirm, Button, Icon} from 'antd';
import classnames from 'classnames';
import _ from 'lodash';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import OnlineOffice from 'components/xDeal/OnlineOffice';
import FlowStep from 'components/Deal/FlowStep';
import Tools from 'components/Deal/Tools';
import Session from 'utils/session';
import {getHttpHostPrefix} from 'utils/utils';
import {PROVENCE_SHORT_CODE, WOPI_HOST} from '../../../../constant';
import styles from './document.less';
import Authorized from 'utils/Authorized';
import Documents from 'components/currencydeal/conclusion/Document'

const Step = Steps.Step;
const {AuthorizedRoute} = Authorized;
const stage = 'SP';

class Document extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      fullScreen: false,
      currentDocument: '',
      docParam: {},
      docUrl: '',
      wsMessage: '',
      jlzt: '',
    };
    this.loadedDoc = {};
  }

  componentDidMount() {
    const {dispatch, match} = this.props;
    dispatch({
      type: 'znfz/findSpjdZt',
      payload: {
       bmsah: _.replace(match.params.id, '审判', '起诉'),
      }
    }).then(({success, data}) => {
      this.setState({
        jlzt: data,
      })
    })
    // dispatch({
    //   type: 'znfz/getAjxx',
    //   payload: {

    //   },
    // });
    //
    // dispatch({
    //   type: 'znfz/getDocConfigs',
    //   payload: {
    //     bmsah: _.replace(match.params.id, '审判', '起诉'),
    //     dwbm: PROVENCE_SHORT_CODE,
    //     stage,
    //   },
    // }).then(() => {
    //   const {znfz: {docConfigs}, znfz: {ajxx}} = this.props;
    //   if (docConfigs && docConfigs.length > 0) {
    //     const wsmbmc = docConfigs[0].znfz_doc_config.wsmbmc;
    //     const payload = docConfigs[0].bgrs && docConfigs[1].bgrs.length > 0 ?
    //       {
    //         ysay: ajxx.ysay_aymc,
    //         tysah: ajxx.tysah,
    //         stage,
    //         bmsah: _.replace(match.params.id, '审判', '起诉'),
    //         wsmbmc: wsmbmc,
    //         bgr: docConfigs[0].bgrs[0],
    //         http_header: getHttpHostPrefix(),
    //       } : {
    //         ysay: ajxx.ysay_aymc,
    //         tysah: ajxx.tysah,
    //         stage,
    //         bmsah: _.replace(match.params.id, '审判', '起诉'),
    //         wsmbmc: wsmbmc,
    //         http_header: getHttpHostPrefix(),
    //       };
    //     dispatch({
    //       type: 'znfz/loadDocData',
    //       payload: payload,
    //     }).then((result) => {
    //       if (result) {
    //         this.setState({
    //           wsMessage: result.message ? result.message : '',
    //         });
    //         result.message ? this.showWsConfirm() : '';
    //         this.fetchDocument(wsmbmc, result.uuid);
    //       }
    //     })
    //  }
    // });
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

  toggleFullScreen = () => {
    this.setState({fullScreen: !this.state.fullScreen});
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

  onLoad = (doc) => {
    if (this.loadedDoc[doc]) {
      this.fetchDocument(doc, this.loadedDoc[doc]);
      return false;
    }
    const {dispatch, match} = this.props;
    const docs = doc.split('-');
    const {znfz: {ajxx}} = this.props;
    const payload = docs[1] ?
      {
        ysay: ajxx.ysay_aymc,
        tysah: ajxx.tysah,
        stage,
        bmsah: _.replace(match.params.id, '审判', '起诉'),
        wsmbmc: docs[0],
        bgr: docs[1],
        http_header: getHttpHostPrefix(),
      } : {
        ysay: ajxx.ysay_aymc,
        tysah: ajxx.tysah,
        stage,
        bmsah: _.replace(match.params.id, '审判', '起诉'),
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

  onReload = () => {
    const {dispatch, match, znfz: {ajxx}} = this.props;
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
          bmsah: _.replace(match.params.id, '审判', '起诉'),
          wsmbmc: docs[0],
          bgr: docs[1],
          http_header: getHttpHostPrefix(),
        } : {
          ysay: ajxx.ysay_aymc,
          tysah: ajxx.tysah,
          stage,
          bmsah: _.replace(match.params.id, '审判', '起诉'),
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

  SPfinish = () => {
    const {znfz: {ajxx}, dispatch, match} = this.props;
    if (!ajxx || !ajxx.bmsah) {
      return;
    }
    dispatch({
      type: 'znfz/updateSpjdBjsj',
      payload: {
        bmsah: _.replace(match.params.id, '起诉', '审判'),
        zt: 9,
      }
    }).then(() => {
      Modal.info({
        title: '案件已审结',
        okText: '确定',
        onOk(){
        }
      });
      this.setState({
        jlzt: 9
      })
    })
  };


  render() {
    const {dispatch, match, znfz} = this.props;
    const {params: {id}} = match;
    const {ajxx, viewDocTree, coords, docConfigs} = znfz;
    const session = Session.get();
    const {jlzt} = this.state;

    const flowStep = (
      <div className={styles.flow}>
        <div className={styles.steps}>
          <FlowStep match={match} dispatch={dispatch} bmsah={_.replace(id, '起诉', '审判')} stage={stage} ajxx={ajxx}/>
        </div>
        <div className={styles.tools}>
          <Tools stage={stage}
                 coords={coords}
                 dispatch={dispatch}
                 ajxx={ajxx}
                 docTree={viewDocTree}/>
        </div>
      </div>
    );
    let docs = _.map(docConfigs, (d) => {
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

    const _match = _.replace(match.params.id, '审判', '起诉');
    match.params.id = _match;

    const documentsProps = {
      znfz,
      ajxx,
      jlzt,
      match,
      stage,
      dispatch,
      spFinish: this.SPfinish
    };

    return (
      <PageHeaderLayout content={flowStep} wrapperClassName={styles.default}>
        {/*<div className={classnames(styles.mask, this.state.fullScreen ? styles.fullScreen : '')}/>
         <Card className={classnames(styles.content, this.state.fullScreen ? styles.fullScreen : '')}>
         <OnlineOffice docs={docs}
         currentDocument={this.state.currentDocument}
         src={this.state.docUrl}
         params={this.state.docParam}
         spVisible={true}
         onPush={this.onPush}
         dispatch={dispatch}
         match={match}
         onLoad={this.onLoad}
         onReload={this.onReload}/>
         </Card>*/}
        <div className={classnames(styles.mask, this.state.fullScreen ? styles.fullScreen : '')}/>
        <Card className={classnames(styles.content, this.state.fullScreen ? styles.fullScreen : '')}>
          <div style={{marginTop: '20px'}}>
            <Row style={{marginBottom: '20px'}}>
              <Col span={2} offset={12}>
                <Steps>
                  <Step
                    title={<a>文书制作</a>}
                    icon={<Icon type="form"/>}
                    style={{cursor: 'pointer'}}
                    status='finish'/>
                </Steps>
              </Col>
            </Row>
            <Documents {...documentsProps}/>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}

@connect(({znfz, loading}) => ({
  znfz,
  loading: loading.effects['znfz/loadDocData'],
}))

export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Document {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}

