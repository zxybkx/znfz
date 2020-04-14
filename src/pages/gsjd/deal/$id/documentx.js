import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Card} from 'antd';
import classnames from 'classnames';
import _ from 'lodash';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import FlowStep from 'components/Deal/FlowStep';
import Tools from 'components/Deal/Tools';
import Session from 'utils/session';
import Authorized from 'utils/Authorized';
import DocEditor from 'components/Deal/DocEditor';
import ViewModal from 'components/Deal/ViewModal';
import styles from './document.less';

const {AuthorizedRoute} = Authorized;

const stage = 'GS';

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
    const {dispatch, match, location: {query}} = this.props;

    dispatch({
      type: 'gsjd/getAjxx',
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
      type: 'gsjd/getSybs',
      payload: {
        bmsah: match.params.id,
        tysah: query.tysah,
        ysay: query.ysay,
      },
    });

    dispatch({
      type: 'gsjd/_loadDocData',
      payload: {
        stage,
        bmsah: match.params.id,
        wsmbmc: '公诉案件审查报告',
      },
    }).then(({success, data}) => {
      if (success) {
        this.fetchDocument('公诉案件审查报告', data);
      }
    });
  }

  fetchDocument = (doc, data) => {
    this.loadedDoc[doc] = data;
    this.setState({
      currentDocument: doc,
      docData: data,
    })
  };

  toggleFullScreen = () => {
    this.setState({fullScreen: !this.state.fullScreen});
  };

  onLoad = (doc) => {
    if (this.loadedDoc[doc]) {
      this.fetchDocument(doc, this.loadedDoc[doc]);
      return false;
    }
    const {dispatch, match} = this.props;
    dispatch({
      type: 'gsjd/_loadDocData',
      payload: {
        stage,
        bmsah: match.params.id,
        wsmbmc: doc,
      },
    }).then(({success, data}) => {
      if (success) {
        this.fetchDocument(doc, data);
      }
    });
  };

  onReload = () => {
    const {dispatch, match, gsjd: {ajxx}} = this.props;
    const {currentDocument} = this.state;
    dispatch({
      type: 'gsjd/removeDocData',
      payload: {
        stage,
        ajxx,
        wsmbmc: currentDocument,
      },
    }).then(() => {
      dispatch({
        type: 'gsjd/_loadDocData',
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
      type: 'gsjd/changeState',
      payload: {
        problemResultVisible: false,
        docViewVisible: false
      }
    })
  };

  render() {
    const {dispatch, match, gsjd, znfz} = this.props;
    const {params: {id}} = match;
    const {docTree} = znfz;
    const {conclusion} = gsjd;
    const {docData} = this.state;

    const {ajxx, problem, coords, problemResultVisible, docViewVisible} = gsjd;
    const resultModalProps = {
      stage, ajxx, dispatch, problem, docTree, visible: problemResultVisible, onClose: this.onModalClose
    };


    const djlType = conclusion.djl && conclusion.djl.indexOf('不起诉') > 0 ? 0 : 1;

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

    const session = Session.get();

    let docs = [
      '公诉案件审查报告',
      (!(/3201\d*/.test(session.dwbm)) || !(/3205\d*/.test(session.dwbm))) && '公诉案件审查报告（简化版）',
      /3201\d*/.test(session.dwbm) && '认罪认罚普通程序审查报告',
      /3201\d*/.test(session.dwbm) && '公诉案件审查报告（速裁程序）',
      /3201\d*/.test(session.dwbm) && conclusion.wsmbmc === '起诉书' && '起诉书(认罪认罚模式)',
      /3201\d*/.test(session.dwbm) && conclusion.wsmbmc === '起诉书' && '起诉书(模式2)',
      /3201\d*/.test(session.dwbm) && conclusion.wsmbmc === '起诉书' && '起诉书（速裁程序）',
      /3201\d*/.test(session.dwbm) && '刑事判决、裁定审查表',
      /3201\d*/.test(session.dwbm) && ajxx && ajxx.ysay_aymc === '交通肇事罪' && '交通肇事罪速裁审查表',
      /3201\d*/.test(session.dwbm) && ajxx && ajxx.ysay_aymc === '危险驾驶罪' && '危险驾驶罪速裁审查表',
      /3205\d*/.test(session.dwbm) && '苏州检察机关表格化案件审查报告（通用类）',
      /3205\d*/.test(session.dwbm) && ajxx.ysay_aymc === '交通肇事罪' && '交通肇事案件审查报告简化模版',
      /3205\d*/.test(session.dwbm) && ajxx && ajxx.ysay_aymc === '危险驾驶罪' && '危险驾驶表格式审查报告',
      /3205\d*/.test(session.dwbm) && ajxx && ajxx.ysay_aymc === '危险驾驶罪' && '危险驾驶案件审查报告简化模版',
      /3205\d*/.test(session.dwbm) && ajxx && ajxx.ysay_aymc === '危险驾驶罪' && '危险驾驶类案件表格式讯问笔录(2017版)',
      conclusion.wsmbmc === '起诉书' && '起诉书',
      conclusion.wsmbmc === '存疑不起诉决定书' && '存疑不起诉决定书',
      conclusion.wsmbmc === '法定不起诉决定书' && '法定不起诉决定书',
      conclusion.wsmbmc === '相对不起诉决定书' && '相对不起诉决定书',
      conclusion.wsmbmc !== '公诉案件审查报告' && djlType === 1 && '量刑建议书',
      conclusion.wsmbmc !== '公诉案件审查报告' && '检察建议书',
      conclusion.wsmbmc !== '公诉案件审查报告' && '纠正违法通知书',
      conclusion.wsmbmc !== '公诉案件审查报告' && '补充侦查提纲',
      conclusion.wsmbmc !== '公诉案件审查报告' && '出庭预案',
      conclusion.wsmbmc !== '公诉案件审查报告' && '庭审笔录',
    ];

    docs = _.compact(docs);

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

@connect(({znfz, gsjd, loading}) => ({
  znfz,
  gsjd,
  loading: loading.effects['gsjd/_loadDocData'],
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

