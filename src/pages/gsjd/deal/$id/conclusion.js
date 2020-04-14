import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Card} from 'antd';
import classnames from 'classnames';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import FlowStep from 'components/Deal/FlowStep';
import Tools from 'components/Deal/Tools';
import ConclusionView from 'components/Deal/ConclusionView';
import ViewModal from 'components/Deal/ViewModal';
import styles from './conclusion.less';
import {PROVENCE_SHORT_CODE} from '../../../../constant';
import Authorized from 'utils/Authorized';

const {AuthorizedRoute} = Authorized;

const stage = 'GS';

class Conclusion extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      fullScreen: false,
    }
  }

  componentDidMount() {
    const {dispatch, match, location: {query}} = this.props;
    dispatch({
      type: 'gsjd/getAjxx',
      payload: {
        bmsah: match.params.id,
      },
    }).then(() => {
      const {gsjd: {ajxx}} = this.props;
      if (ajxx && ajxx.bmsah) {
        dispatch({
          type: 'znfz/getAllBDPZ',
          payload: {
            ysay: ajxx.ysay_aymc,
            stage: 'GS',
            dwbm: PROVENCE_SHORT_CODE,
          },
        })
      }
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
      type: 'gsjd/getFact',
      payload: {
        bmsah: match.params.id,
        tysah: query.tysah,
        ysay: query.ysay,
      },
    });
    dispatch({
      type: 'gsjd/getAllProblem',
      payload: {
        bmsah: match.params.id,
      },
    });
    dispatch({
      type: 'znfz/getConclusionConfigs',
      payload: {
        lx: 'GS',
        bmsah: match.params.id,
        tysah: query.tysah,
        ysay: query.ysay,
      },
    });
  }

  toggleFullScreen = () => {
    this.setState({fullScreen: !this.state.fullScreen});
  };

  render() {
    const {dispatch, match, znfz, gsjd,  location: {query}} = this.props;
    const {params: {id}} = match;
    const {ajxx, coords, fact, conclusion, allProblem} = gsjd;
    const {list: bdpzList, conclusionConfigs, docTree} = znfz;

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
          />
        </div>
      </div>
    );

    const conclusionProps = {
      bdpzList, stage, ajxx, dispatch, fact, conclusion, conclusionConfigs, allProblem,
    };

    const {problem, problemResultVisible} = gsjd;

    const viewModalProps = {
      stage, ajxx, dispatch, problem, docTree, visible: problemResultVisible, match, query
    };

    return (
      <PageHeaderLayout content={flowStep}
                        wrapperClassName={styles.default}>
        <div className={classnames(styles.mask, this.state.fullScreen ? styles.fullScreen : '')}/>
        <Card className={classnames(styles.content, this.state.fullScreen ? styles.fullScreen : '')}>
          <ConclusionView {...conclusionProps}/>
          <ViewModal {...viewModalProps}/>
        </Card>
      </PageHeaderLayout>
    );
  }
}

@connect(({znfz, gsjd, loading}) => ({
  znfz,
  gsjd,
  loading: loading.effects['gsjd/getProblems'],
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Conclusion {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}
