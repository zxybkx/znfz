import React, {PureComponent} from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import {connect} from 'dva';
import {Link, routerRedux} from 'dva/router';
import {Row, Col, Icon, Tabs, Divider} from 'antd';
import classnames from 'classnames';
import styles from './light.less';
import ZcjdChart from './components/Charts/ZcjdChart';
import AjclChart from './components/Charts/AjclChart';
import BazqChart from './components/Charts/BazqChart';
import DynamicRefreshTable from './components/DynamicRefreshTable';
import Authorized from 'utils/Authorized';
import {PROCESS_MULTIPLE} from '../../constant';

const {AuthorizedRoute} = Authorized;
const TabPane = Tabs.TabPane;
class Workplace extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ajlb: 'GS',
      munu:2,
      workingDataTablePagesize: 0,
    };
  }
  check_tittle_index(index){
    return index===this.state.currentIndex ? `${styles.tabItem}  ${styles.tabItem_active}` : `${styles.tabItem}`;
}

  //切换tab数据
  callback = (key) => {

    if (key == 1) {
      this.setState({
        ajlb: 'ZJ',
        munu:key
       
      });
      const data = {
        startDate: this.startDate,
        endDate: this.endDate,
        ajlb: 'ZJ',
        jcg: '1',
      };
      this.getCount(data);
    } else if (key == 2) {
      this.setState({
        ajlb: 'GS',
        munu:key
      });
      const data = {
        startDate: this.startDate,
        endDate: this.endDate,
        ajlb: 'GS',
        jcg: '1',
      };
      this.getCount(data);
    }
  }

  componentDidMount() {
    const {dispatch} = this.props;
    dispatch({
      type: 'portal/getTopfile',
      payload: 1,
    });
    dispatch({
      type: 'portal/getBottomfile',
      payload: 2,
    });
    dispatch({
      type: 'portal/getLatestAjxx',
    });

    dispatch({
      type: 'portal/getDxal',
      payload: {},
    });
    dispatch({
      type: 'portal/getFlfg',
      payload: {},
    });
    const myDate = new Date();
    const startDate = moment(myDate).format('YYYY-01-01');
    const endDate = moment(myDate).format('YYYY-MM-DD');
    const data = {
      startDate: startDate,
      endDate: endDate,
      ajlb: 'GS',
      jcg: '1',
    };
    this.getCount(data);

    let workingDataTable = ReactDOM.findDOMNode(this.refs.workingDataTable);
    let workingDataTableHeightStr = window.getComputedStyle(workingDataTable).height;
    let workingDataTableHeight = workingDataTableHeightStr.substring(0, workingDataTableHeightStr.length - 2);
    let workingDataTablePagesize = this.calPageSize(workingDataTableHeight);
    this.setState({workingDataTablePagesize: workingDataTablePagesize});

  }

  calPageSize = (height) => {
    const tableHeaderHeight = 37;
    const tableItemHeight = 37;
    let tableContentHeight = height - tableHeaderHeight;
    let pageSize = Math.floor(tableContentHeight / tableItemHeight);
    pageSize = pageSize < 1 ? 1 : pageSize;
    return pageSize;
  };

  getCount = (data) => {
    const {dispatch} = this.props;
    dispatch({
      type: 'portal/countZcjd',
      payload: data,
    });
    dispatch({
      type: 'portal/countAjcl',
      payload: data,
    });
    dispatch({
      type: 'portal/countBasc',
      payload: data,
    });
    dispatch({
      type: 'portal/countBaqk',
      payload: {
        ...data,
        startDate: '2019-01-01'
      },
    });
  };

  componentWillUnmount() {
    const {dispatch} = this.props;
    dispatch({
      type: 'chart/clear',
    });
  }

  getLatestDealPath = () => {
    let path = '';
    const {portal: {ajxx}} = this.props;
    if (ajxx && ajxx.bmsah) {
      let basePath = ajxx.latest_stage === 'ZJ' ? 'zcjd' : ajxx.latest_stage === 'GS' ? 'gsjd' : 'spjd';
      let dealPath = ajxx.latest_stage === 'SP' ? 'spdeal' : 'deal';

      dealPath = PROCESS_MULTIPLE.indexOf(ajxx.ysay_aymc) >= 0 ? 'xdeal' : dealPath;

      path = `${basePath}/${dealPath}/${ajxx.bmsah}`;
    }
    return path;
  };

  render() {
    const myDate = new Date();
    const startDate = moment(myDate).format('YYYY-01-01');
    const endDate = moment(myDate).format('YYYY-MM-DD');
    const {dispatch, portal: {ajxx, Topfile, Bottomfile, zcjdList, ajclList, bascList, baqkList, dxalList, flfgList}} = this.props;
    const {ajlb} = this.state;

    const gzsjDataList = {
      dataSource: baqkList ? baqkList['工作数据'] : [],
      columns: [{
        title: '案件名称',
        dataIndex: 'ajmc',
        key: 'ajmc',
      }, {
        title: '工作笔记',
        dataIndex: 'gzbj',
        key: 'gzbj',
      }, {
        title: '文书制作',
        dataIndex: 'wszz',
        key: 'wszz',
      }, {
        title: '卷宗册数',
        dataIndex: 'ajzs',
        key: 'ajzs',
      }],
    };

    let lastest = '无';
    if (ajxx && ajxx.bmsah) {
      lastest =
        <Link to={this.getLatestDealPath()}><Icon type='clock-circle-o' style={{color: 'red'}}/>{ajxx.ajmc}</Link>;
    }

    const zcjdchart = {dispatch, ajlb, zcjdList};
    const bazqchart = {bascList};
    const ajclchart = {dispatch, ajlb, ajclList};
    const gglProps = {dispatch, Topfile, Bottomfile};
    const dxalProps = {dxalList, flfgList};

    return (
      //首页审查逮捕切换
      <Row gutter={24} className={'cm-workspace'}>
        <Col xl={24} lg={24} md={24} sm={24} xs={24}>
            <div className={classnames(styles.currentbtn)}>
              <button 
              className={this.state.munu == 1 ? classnames(styles.ac):''}
              onClick={this.callback.bind(this,1)}>审查逮捕</button>
              <button 
                 className={this.state.munu == 2 ? classnames(styles.ac):''}
              onClick={this.callback.bind(this,2)}>审查起诉</button>
            </div>
          <Row gutter={16} className={classnames(styles.leftTop, 'left-top')}>
            <Col xl={6} lg={6} md={6} sm={24} xs={24} className={classnames(styles.topCard, 'top-card')} span={6}>
              <div className={classnames(styles.ujaj)}>
                <span className={classnames(styles.text)} style={{fontSize: 22}}>
                 <div className={classnames(styles.yj)}>
                   <div className={classnames(styles.yjtp)}></div>
                   <div className={classnames(styles.yjbottom)}></div>
                 </div>
                   <div className={classnames(styles.yjright)}>
                      <span className={styles.count}
                      onClick={() => {
                        const path = this.state.ajlb === 'ZJ' ? '/zcjd' : '/gsjd';
                        dispatch(routerRedux.push({pathname: `${path}/list`, query: {baqk: '超期预警'}}));
                      }}>
                  {baqkList && baqkList['办案情况'] ? baqkList['办案情况'][3]['预警案件'] : 0}
                </span>
                     <div className={classnames(styles.yjname)}>预警案件</div>
                   </div>
                </span>
                
              </div>
            </Col>
            <Col xl={6} lg={6} md={6} sm={24} xs={24} className={classnames(styles.topCard, 'top-card')}>
              <div className={classnames(styles.wjaj)}>
                <span className={classnames(styles.text)} style={{fontSize: 22}}>
                <div className={classnames(styles.yj)}>
                   <div className={classnames(styles.wjaj)}></div>
                   <div className={classnames(styles.yjbottom)}></div>
                 </div>
                 <div className={classnames(styles.yjright)}>
                 <span className={styles.count}
                      onClick={() => {
                        const path = this.state.ajlb === 'ZJ' ? '/zcjd' : '/gsjd';
                        dispatch(routerRedux.push({pathname: path, query: {ysay: 'all', zt: 1, startTime: '2018-01-01'}}));
                      }}>
                  {baqkList && baqkList['办案情况'] ? baqkList['办案情况'][2]['未结案件'] : 0}
                </span>
                  <div className={classnames(styles.yjname)}>未结案件</div>
                 </div>
                </span>
              </div>
            </Col>
            <Col xl={6} lg={6} md={6} sm={24} xs={24} className={classnames(styles.topCard, 'top-card')}>
              <div className={classnames(styles.yjaj)}>
                <span className={classnames(styles.text)} style={{fontSize: 22}}>
                <div className={classnames(styles.yj)}>
                   <div className={classnames(styles.yjaj)}></div>
                   <div className={classnames(styles.yjbottom)}></div>
                 </div>
                
              <div className={classnames(styles.yjright)}>
              <span className={styles.count}
                      onClick={() => {
                        const path = this.state.ajlb === 'ZJ' ? '/zcjd' : '/gsjd';
                        dispatch(routerRedux.push({pathname: path, query: {ysay: 'all', zt: 9}}));
                      }}>
                  {baqkList && baqkList['办案情况'] ? baqkList['办案情况'][1]['已结案件'] : 0}
                </span>
                <div className={classnames(styles.yjname)}>已结案件</div>
              </div>
              </span>
              </div>
            </Col>
            <Col xl={6} lg={6} md={6} sm={24} xs={24} className={classnames(styles.topCard, 'top-card')}>
              <div className={classnames(styles.ajzs)}>
                <span className={classnames(styles.text)} style={{fontSize: 18}}>
                  
                  <div className={classnames(styles.yj)}>
                   <div className={classnames(styles.spjd)}></div>
                   <div className={classnames(styles.yjbottom)}></div>
                 </div>
               
                  <div className={classnames(styles.yjright)}>
                  {ajlb === 'GS' ?
                  <span className={styles.count}
                        onClick={() => {
                          const path = this.state.ajlb === 'ZJ' ? '/zcjd' : '/gsjd';
                        dispatch(routerRedux.push({pathname: path, query: {ysay: 'all', zt: -1}}))
                        }}>
                    {baqkList && baqkList['办案情况'] ? baqkList['办案情况'][0]['案件总数'] : 0}
                  </span> :
                  <span className={styles.count}
                        onClick={() => {
                          dispatch(routerRedux.push({pathname: `/zcjd`, query: {ysay: 'all', zt: -1, startTime: '2018-01-01'}}));
                        }}>
                    {baqkList && baqkList['办案情况'] ? baqkList['办案情况'][0]['案件总数'] : 0}
                  </span>
                  }
                  <div className={classnames(styles.yjname)}>
                  {ajlb === 'ZJ' ? '案件总数' : '案件总数'}
                  </div>
                
                  </div>
                  </span>
              </div>
            </Col>
          </Row>
          <Row gutter={16} className={classnames(styles.leftMain, 'left-main')}>
            {/* workplace界面工作数据 */}
          <Col xl={12} lg={12} md={12} sm={24} xs={24}>
              <div className={classnames(styles.body, 'body')}>
                <div className={classnames(styles.bodyleft)}></div>
                <Divider className={classnames(styles.gzsjdivider)}/>
                <p className={classnames(styles.title, 'title')}>工作数据</p>
               
                <div ref="workingDataTable" className={classnames(styles.table, 'table')}>
                  <div className={classnames(styles.border)}></div>
                  <DynamicRefreshTable rowKey={record => record.id || record.key || Math.random()}
                                       pageSize={this.state.workingDataTablePagesize}
                                       data={baqkList ? baqkList['工作数据'] : []}
                                       columns={gzsjDataList.columns}/>
                </div>
              </div>
            </Col>
            {/* 案件处理 */}
            <Col xl={12} lg={12} md={12} sm={24} xs={24}>
              <AjclChart {...ajclchart}/>
            </Col>
             {/* 在线办案时长 */}
             <Col xl={12} lg={12} md={12} sm={24} xs={24}>
              <BazqChart  {...bazqchart} />
            </Col>
            {/* 侦察监督 */}
            <Col xl={12} lg={12} md={12} sm={24} xs={24}>
              <ZcjdChart  {...zcjdchart} />
            </Col>
           
           
          </Row>
        </Col>
      </Row>
    );
  }
}

@connect(({portal, project, activities, chart, loading}) => ({
  portal,
  project,
  activities,
  chart,
  projectLoading: loading.effects['project/fetchNotice'],
  activitiesLoading: loading.effects['activities/fetchList'],
  topLoading: loading.effects['portal/getTopfil'],
  bottomLoading: loading.effects['portal/getBottomfile'],
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Workplace {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}

