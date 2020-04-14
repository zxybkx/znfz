import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Card} from 'antd';
import classnames from 'classnames';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import FlowStep from 'components/Deal/FlowStep';
import Tools from 'components/Deal/Tools';
import DocEditor from 'components/Deal/DocEditor';
import ViewModal from 'components/Deal/ViewModal';
import styles from './process.less';
import Authorized from 'utils/Authorized';

const {AuthorizedRoute} = Authorized;

const stage = 'GS';

class Process extends PureComponent {

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
      type: 'gsjd/_loadDocData',
      payload: {
        stage,
        bmsah: match.params.id,
        wsmbmc: '讯问提纲',
      },
    }).then(({success, data}) => {
      if (success) {
        this.fetchDocument('讯问提纲', data);
      }
    });
  }

  fetchDocument = (doc, data) => {
    this.loadedDoc[doc] = data;
    this.setState({
      stage: 'GS',
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
    const {docData} = this.state;

    const {ajxx, problem, coords, problemResultVisible, docViewVisible} = gsjd;
    const resultModalProps = {
      stage, ajxx, dispatch, problem, docTree, visible: problemResultVisible, onClose: this.onModalClose
    };

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
                 docViewVisible={docViewVisible}
                 onClose={this.onModalClose}/>
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
        render={() => <Process {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}
