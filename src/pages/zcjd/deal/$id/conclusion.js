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

const stage = 'ZJ';

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
      type: 'zcjd/getAjxx',
      payload: {
        bmsah: match.params.id,
      },
    }).then(() => {
      const {zcjd: {ajxx}} = this.props;
      if (ajxx && ajxx.bmsah) {
        dispatch({
          type: 'znfz/getAllBDPZ',
          payload: {
            ysay: ajxx.ysay_aymc,
            stage: 'ZJ',
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
      type: 'zcjd/getAllProblem',
      payload: {
        bmsah: match.params.id,
      },
    });
    dispatch({
      type: 'zcjd/getBybb',
      payload: {
        bmsah: match.params.id,
        tysah: query.tysah,
        ysay: query.ysay,
      },
    });
    dispatch({
      type: 'zcjd/getFact',
      payload: {
        bmsah: match.params.id,
        tysah: query.tysah,
        ysay: query.ysay,
      },
    });
    dispatch({
      type: 'znfz/getConclusionConfigs',
      payload: {
        lx: 'ZJ',
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
    const {dispatch, match, znfz, zcjd} = this.props;
    const {params: {id}} = match;
    const {ajxx, coords, fact, conclusion, allProblem} = zcjd;
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

    const {problem, problemResultVisible} = zcjd;

    const viewModalProps = {
      stage, ajxx, dispatch, problem, docTree, visible: problemResultVisible,
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

@connect(({znfz, zcjd, loading}) => ({
  znfz,
  zcjd,
  loading: loading.effects['zcjd/getProblems'],
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

