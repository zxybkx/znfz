import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Card, Row, Col, Spin, Collapse} from 'antd';
import classnames from 'classnames';
import _ from 'lodash';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import Ellipsis from 'lib/Ellipsis';
import {ToggleTrigger} from 'components/xDeal/Trigger';
import FlowStep from 'components/Deal/FlowStep';
import Tools from 'components/Deal/Tools';
import Tabs from 'components/xDeal/Tabs';
import ProblemList from 'components/xDeal/ProblemList';
import DealForm from 'components/xDeal/DealForm';
import Authorized from 'utils/Authorized';
import {PROVENCE_SHORT_CODE} from 'constant';
import FileGrid from './components/FileGrid';
import styles from './question.less';

const {AuthorizedRoute} = Authorized;
const {Panel} = Collapse;

const stage = 'SP';

class Question extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      fullScreen: false,
      showDetail: false,
      allProblemList: [],
      subProblemList: [],
      keyid: '',
      subProblemCurrent: {},
      tabkey: '',
      flfg: [],
      title: '',
      facts: [],
      currentFilter: ''
    }
  }


  componentDidMount() {
    const {dispatch, match} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: 'znfz/getAjxx',
      payload: {
        bmsah: _.replace(id, '审判', '起诉'),
      },
    });
    dispatch({
      type: 'znfz/getFactList',
      payload: {
        bmsah: id,
      },
    }).then(({success, data}) => {
      if (success && data) {
        this.setState({facts: data});
      }
    });
    const {location: {query: {type = '1'}}} = this.props;
    this.getProblems(type);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.location.query, nextProps.location.query)) {
      const {location: {query: {type = '1'}}} = nextProps;
      this.getProblems(type);
    }
  }

  getProblems = (type) => {
    const {dispatch, match: {params: {id}}} = this.props;
    dispatch({
      type: 'spjd/getProblemList',
      payload: {
        bmsah: id,
      },
    }).then((data) => {
      const list = _.filter(data, (d) => d.yjfl !== '判决结论');
      this.setState({
        allProblemList: list,
      }, () => {
        this.onClick(list && list[0]);
      });
    });
  };


  toggleFullScreen = () => {
    this.setState({fullScreen: !this.state.fullScreen});
  };


  onClick = (problem) => {
    if (_.isEmpty(problem)) {
      return false;
    }
    this.setState({
      title: problem.gzmc,
      keyid: problem.keyid,
      tabkey: 0,
    }, () => {
      this.getAjListAndFlfg(problem.keyid);
    });
  };

  getAjListAndFlfg = (keyid) => {
    const {dispatch, match} = this.props;
    const {params: {id}} = match;

    dispatch({
      type: 'spjd/getSubProblemByKey',
      payload: {
        bmsah: id,
        keyid: keyid,
      },
    }).then(data => {
      const {tabkey} = this.state;
      let subProblemCurrent = {};
      if (_.isEmpty(tabkey)) {
        subProblemCurrent = data ? data[0] || {} : {};
      } else {
        subProblemCurrent = _.find(data, d => `${d.mergekey}-${d.filekey}` === tabkey);
      }
      this.setState({
        subProblemList: data || [],
        subProblemCurrent,
      });
    });

    dispatch({
      type: 'spjd/getFlfgByKey',
      payload: {
        bmsah: id,
        keyid: keyid,
        dwbm: PROVENCE_SHORT_CODE,
      },
    }).then((data) => {
      this.setState({
        flfg: data && data.law,
      });
    });
  };

  onTabChange = (key) => {
    const {subProblemList} = this.state;
    this.setState({
      tabkey: key,
      subProblemCurrent: _.find(subProblemList, d => `${d.mergekey}-${d.filekey}` === key) || {},
    });
  };

  onProblemFilter = (key) => {
    this.setState({
      currentFilter: key,
    });
  };

  reload = () => {
    const {dispatch, match} = this.props;

    const {params: {id}} = match;

    !_.isEmpty(this.state.keyid) && this.getAjListAndFlfg(this.state.keyid);

    dispatch({
      type: 'spjd/getProblemList',
      payload: {
        bmsah: id,
      },
    }).then((data) => {
      const list = _.filter(data, (d) => d.yjfl !== '判决结论');
      this.setState({
        allProblemList: list,
      });

    });
  };

  render() {
    const {dispatch, match, location, znfz, loading, mainLoading, nlpLoading} = this.props;
    const {
      allProblemList,
      title,
      subProblemList,
      subProblemCurrent,
      flfg,
      facts,
      tabkey
    } = this.state;
    const {params: {id}} = match;
    const {ajxx, viewDocTree, coords} = znfz;
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
                 docTree={viewDocTree}/>
        </div>
      </div>
    );

    const tabData = subProblemList.map(d => {
      return {key: `${d.mergekey}-${d.filekey}`, label: d.mergekey, iconConfig: d.znfz_icon};
    });

    const TabList = {
      tabs: tabData,
      editable: false,
      onTabChange: this.onTabChange,
      activeTab: tabkey
    };

    const head = <Ellipsis style={{display: 'inline', width: 'auto'}} length={60}
                           tooltip>{`问题描述-${subProblemCurrent && subProblemCurrent.wtms ? subProblemCurrent.wtms + '材料如下：' : '材料如下：'}`}</Ellipsis>;

    const _facts = _.orderBy(facts, v => _.toNumber(v.mergekey.replace(/[^0-9]/ig, '')));

    return (
      <PageHeaderLayout content={flowStep} wrapperClassName={styles.default}>
        <Spin spinning={loading || mainLoading} size='large' className={styles.spin}/>
        <Card className={styles.content}>
          <div className={styles.main}>
            <div className={classnames(styles.aside, this.state.fullScreen ? styles.fullScreen : '')}>
              <div className={styles.title}>审查处理</div>
              <div className={styles.bottom}>
                <ProblemList data={allProblemList}
                             onClick={this.onClick}
                             onProblemFilter={this.onProblemFilter}/>
              </div>
            </div>
            <div className={styles.right}>
              <div className={classnames(styles.top, styles.top1)}>
                <ToggleTrigger style={{top: 8}} onClick={this.toggleFullScreen}/>
                {title}
              </div>
              <div className={classnames(styles.top, styles.top2)}>
                <Tabs {...TabList}/>
              </div>
              <div className={classnames(styles.bottom, 'custom-scrollbar-panel')}>
                <Collapse defaultActiveKey={['涉及材料信息']}>
                  <Panel key='涉及材料信息'
                         header={head}>
                    <FileGrid data={subProblemCurrent}
                              loading={nlpLoading}
                              title={title}
                              dispatch={dispatch}
                              match={match}
                              location={location}
                              ajxx={ajxx}
                              facts={_facts}
                              onClose={this.reload}/>
                  </Panel>
                  <Panel key='法律法规' header={'法律法规'}>
                    {
                      flfg && flfg.map((o, i) => {
                        return (
                          <div key={i}>
                            <p>{o.lawname}</p>
                            <p>{o.laworder}</p>
                            <p>{o.lawcontent}</p>
                          </div>
                        )
                      })
                    }
                  </Panel>
                </Collapse>
                <DealForm dispatch={dispatch}
                          stage={stage}
                          ajxx={ajxx}
                          problem={subProblemCurrent}
                          reload={this.reload}
                />
              </div>
            </div>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}

@connect(({znfz, spjd, loading}) => ({
  znfz,
  spjd,
  loading: loading.effects['spjd/getSubProblemByKey'],
  mainLoading: loading.effects['spjd/getProblemList'],
  nlpLoading: loading.effects['znfz/getNlpByBmsahAndImage'],
}))
export default class Wrapper
  extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Question {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}

