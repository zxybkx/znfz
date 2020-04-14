import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Card} from 'antd';
import classnames from 'classnames';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import DocEditor from 'components/Deal/DocEditor';
import FlowStep from 'components/Deal/FlowStep';
import Tools from 'components/Deal/Tools';
import ViewModal from 'components/Deal/ViewModal';
import styles from './document.less';
import Authorized from 'utils/Authorized';

const {AuthorizedRoute} = Authorized;

const stage = 'SP';

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
      type: 'gsjd/loadDocData',
      payload: {
        stage,
        bmsah: match.params.id,
        wsmbmc: '刑事判决、裁定审查表',
      },
    }).then(({success, data}) => {
      if (success) {
        this.fetchDocument('刑事判决、裁定审查表', data);
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
      type: 'gsjd/loadDocData',
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
        type: 'gsjd/loadDocData',
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

  onModalClose = ()=> {
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
    const {docData} = this.state;

    const {ajxx, coords, problem, problemResultVisible, docViewVisible} = gsjd;
    const resultModalProps = {
      stage, ajxx, dispatch, problem, docTree, visible: problemResultVisible, onClose: this.onModalClose
    };

    const flowStep = (
      <div className={styles.flow}>
        <div className={styles.steps}>
          <FlowStep match={match} dispatch={dispatch} bmsah={id} stage={stage} ajxx={ajxx}/>
        </div>
        <div className={styles.tools}>
          <Tools docViewVisible={docViewVisible}
                 stage={stage}
                 coords={coords}
                 dispatch={dispatch}
                 ajxx={ajxx}
                 onClose={this.onModalClose}/>
        </div>
      </div>
    );

    let docs = [
      '刑事判决、裁定审查表',
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


@connect(({znfz, gsjd, loading}) => ({
  znfz,
  gsjd,
  loading: loading.effects['gsjd/loadDocData'],
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

