import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Card, Row, Col, Spin} from 'antd';
import classnames from 'classnames';
import _ from 'lodash';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import ProblemList from 'components/Deal/ProblemList';
import FlowStep from 'components/Deal/FlowStep';
import CategoryList from 'components/Deal/CategoryList';
import StatusList from 'components/Deal/StatusList';
import Tools from 'components/Deal/Tools';
import styles from './question.less';
import Authorized from 'utils/Authorized';

const {AuthorizedRoute} = Authorized;

const stage = 'GS';

class Question extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      currentList: [],
      fullScreen: false,
    }
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
      type: 'gsjd/getCategories',
      payload: {
        bmsah: match.params.id,
      },
    });

    dispatch({
      type: 'gsjd/getProblems',
      payload: {
        bmsah: match.params.id,
        categoryName: '程序',
        level: 1,
      },
    }).then(() => this.getDataListByDqzt('全部'));

    dispatch({
      type: 'znfz/getTree',
      payload: {
        bmsah: match.params.id,
      },
    });
  }

  toggleFullScreen = () => {
    this.setState({fullScreen: !this.state.fullScreen});
  };

  getDqztSet = () => {
    const {gsjd: {allList}} = this.props;
    let _dqztSet = allList.map(d => ({title: d.dqzt, iconConfig: d.znfz_icon}));
    _dqztSet = _.uniqBy(_dqztSet, 'title');
    _dqztSet = _dqztSet.map(zt => {
      zt.count = allList.filter(d => d.dqzt === zt.title).length;
      return zt;
    });
    let dqztSet = [];
    dqztSet.push({
      title: '全部',
      iconConfig: {},
      count: allList.length,
    });
    dqztSet.push(..._dqztSet);

    return dqztSet;
  };

  getDataListByDqzt = (dqzt) => {
    const {gsjd: {allList}} = this.props;
    this.setState({
      currentList: dqzt === '全部' ? allList : allList.filter(d => d.dqzt === dqzt),
    })
  };

  refresh = () => {
    const {dispatch} = this.props;
    dispatch({
      type: `gsjd/query`,
      payload: {
        stage: 'GS',
      },
    }).then(() => this.getDataListByDqzt('全部'));
  };

  render() {
    const {dispatch, match, znfz, gsjd, loading, globalLoading} = this.props;
    const {params: {id}} = match;
    const {ajxx, coords, categories} = gsjd;
    const {docTree} = znfz;
    const {fullScreen, currentList} = this.state;

    const listProps = {
      fullScreen,
      loading,
      ajxx,
      stage,
      dispatch,
      docTree,
      list: currentList,
      refresh: this.refresh,
    };

    const flowStep = (
      <div className={styles.flow}>
        <div className={styles.steps}>
          <FlowStep match={match} dispatch={dispatch} bmsah={id} ajxx={ajxx} stage={stage}/>
        </div>
        <div className={styles.tools}>
          <Tools stage={stage} coords={coords} dispatch={dispatch} ajxx={ajxx}/>
        </div>
      </div>
    );

    return (
      <PageHeaderLayout content={flowStep} wrapperClassName={styles.default}>
        <div className={classnames(styles.mask, this.state.fullScreen ? styles.fullScreen : '')}/>
        <Card className={classnames(styles.content, this.state.fullScreen ? styles.fullScreen : '')}>
          <Row gutter={16}>
            <Col xl={8} lg={8} md={8} sm={24} xs={24}>
              <CategoryList categories={categories}
                            stage={stage}
                            clickHandler={(level, categoryName) => {
                              dispatch({
                                type: 'gsjd/getProblems',
                                payload: {
                                  bmsah: ajxx.bmsah,
                                  categoryName: categoryName,
                                  level: level,
                                },
                              }).then(() => this.getDataListByDqzt('全部'));
                            }}/>
            </Col>
            <Col xl={16} lg={16} md={16} sm={24} xs={24} style={{textAlign: 'right'}}>
              <StatusList list={this.getDqztSet()}
                          stage={stage}
                          clickHandler={this.getDataListByDqzt}/>
            </Col>
            <Col span={24}>
              <Spin spinning={globalLoading}>
                <ProblemList {...listProps}/>
              </Spin>
            </Col>
          </Row>
        </Card>
      </PageHeaderLayout>
    );
  }
}

@connect(({znfz, gsjd, loading}) => ({
  znfz,
  gsjd,
  loading: loading.effects['gsjd/getProblems'],
  globalLoading: loading.effects['znfz/getTree'],
}))
export default class Wrapper extends PureComponent {
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
