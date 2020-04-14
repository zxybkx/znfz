import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import {Card} from 'antd';
import moment from 'moment';
import {routerRedux} from 'dva/router';
import _ from 'lodash';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import Ellipsis from 'lib/Ellipsis';
import Table from '../components/WtTable';
import AjxgSearch from '../components/AjxgSearch';
import XtxgSearch from '../components/XtxgSearch';
import styles from './index.less';
import Authorized from 'utils/Authorized';

const {AuthorizedRoute} = Authorized;

class Index extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      searchFields: props.searchFields || {},
      activeTab: '1',
    }
  }

  componentDidMount() {
    const {dispatch, wtfk: {searchFields}, location: {query}} = this.props;

    this.setState({activeTab: query.activeTab || '1'}, () => {
      if (!query.activeTab || query.activeTab === '1') {
        dispatch({
          type: 'wtfk/getAjxg',
          payload: {
            page: 0,
            size: 10,
            data: searchFields
          },
        });
      } else {
        dispatch({
          type: 'wtfk/getXtxg',
          payload: searchFields,
        });
      }
    });
  }

  getAjxgColumn = () => {
    const columns = [
      {
        title: '序号',
        dataIndex: 'rownumber',
        key: 'rownumber',
        width: '5%',
      }, {
        title: '承办人',
        dataIndex: 'cbr',
        key: 'cbr',
        width: '8%',
      }, {
        title: '案件名称',
        dataIndex: 'ajmc',
        key: 'ajmc',
        width: '20%',
      }, {
        title: '规则问题',
        dataIndex: 'gzCount',
        key: 'gzCount',
        width: '10%',
        render: field => (
          <span style={{color: field.dealed === field.total ? '' : 'red'}}>
            {field.total || 0}/{field.dealed || 0}
            </span>
        ),
      }, {
        title: '结论问题',
        dataIndex: 'jlCount',
        key: 'jlCount',
        width: '10%',
        render: field => (
          <span style={{color: field.dealed === field.total ? '' : 'red'}}>
            {field.total || 0}/{field.dealed || 0}
            </span>
        ),
      }, {
        title: '文书问题',
        dataIndex: 'wsCount',
        key: 'wsCount',
        width: '10%',
        render: field => (
          <span style={{color: field.dealed === field.total ? '' : 'red'}}>
              {field.total || 0}/{field.dealed || 0}
            </span>
        ),
      }, {
        title: '其它问题',
        dataIndex: 'qtCount',
        key: 'qtCount',
        width: '10%',
        render: field => (
          <span style={{color: field.dealed === field.total ? '' : 'red'}}>
            {field.total || 0}/{field.dealed || 0}
            </span>
        ),
      }, {
        title: '回复完成度',
        dataIndex: 'hfwcd',
        key: 'hfwcd',
        width: '10%',
        render: (field, record) => {
          const dealed = _.toNumber(record.gzCount.dealed || 0)
            + _.toNumber(record.jlCount.dealed || 0)
            + _.toNumber(record.wsCount.dealed || 0)
            + _.toNumber(record.qtCount.dealed || 0);
          const total = _.toNumber(record.gzCount.total || 0)
            + _.toNumber(record.jlCount.total || 0)
            + _.toNumber(record.wsCount.total || 0)
            + _.toNumber(record.qtCount.total || 0);

          return `${(dealed / total).toFixed(2) * 100}%`;
        },
      }, {
        title: '问题最后提交时间',
        dataIndex: 'latestDate',
        key: 'latestDate',
        width: '15%',
        render: (text, record) => moment(record.latestDate).format('YYYY-MM-DD  HH:mm'),
      }];

    return columns;
  };

  getXtxgColumn = () => {
    const {dispatch} = this.props;
    const columns = [
      {
        title: '序号',
        dataIndex: 'rownumber',
        key: 'rownumber',
        width: '5%',
      }, {
        title: '问题描述',
        dataIndex: 'advice',
        key: 'advice',
        render: text => (
          <Ellipsis style={{display: 'inline', width: 'auto'}} length={100} tooltip>{text}</Ellipsis>
        ),
      }, {
        title: '提交人',
        dataIndex: 'createdName',
        key: 'createdName',
        width: '8%',
      }, {
        title: '提交时间',
        dataIndex: 'createdDate',
        key: 'createdDate',
        width: '12%',
        render: (text, record) => text ? moment(text).format('YYYY-MM-DD  HH:mm:ss') : '',
      }, {
        title: '答复状态',
        dataIndex: 'dfzt',
        key: 'dfzt',
        width: '8%',
        render: (text, record) => <span>{record.dfzt === 1 ? '已答复' : '未答复'}</span>,
      }, {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: '5%',
        render: (text, record) => {
          if (record.dfzt === 0) {
            return (
              <a onClick={() => {
                dispatch({
                  type: 'wtfk/changeCkzt',
                  payload: {
                    id: record.id,
                    wtlx: record.wtlx,
                    ckzt: 1,
                  },
                });
                dispatch(routerRedux.push({
                  pathname: `/wtfk/reply/yh`,
                  query: {
                    id: record.id,
                    bmsah: record.bmsah,
                    main: 1,
                  },
                }));
              }}>答复</a>
            );
          } else {
            return (
              <a onClick={() => {
                dispatch(routerRedux.push({
                  pathname: `/wtfk/reply/yh`,
                  query: {
                    id: record.id,
                    bmsah: record.bmsah,
                    main: 1,
                  },
                }));
              }}>查看</a>
            );
          }
        },
      }];

    return columns;
  };

  SwitchTabs = (activeKey) => {
    const {dispatch} = this.props;
    switch (activeKey) {
      case '1':
        this.setState({activeTab: '1'}, () => {
          dispatch({
            type: 'wtfk/getAjxg',
          });
        });
        break;
      case '2':
        this.setState({activeTab: '2'}, () => {
          dispatch({
            type: 'wtfk/getXtxg',
          });
        });
        break;
      default:
        break;
    }
  };

  onRowClick = (record) => {
    const {dispatch} = this.props;
    if (record.bmsah) {
      dispatch(routerRedux.push({
        pathname: `/wtfk/deal/ajxg`,
        query: {
          bmsah: record.bmsah,
        },
      }))
    } else {

    }
  };

  render() {
    const {dispatch, wtfk,  ajxgLoading, xtxgLoading} = this.props;
    const {searchFields, ajxgList, list, current, AjxgCurrent, pageSize, total, AjxgTotal} = wtfk;
    let _list = [];
    if (list) {
      _list = list.map((d, idx) => {
        d.rownumber = idx + 1;
        return d;
      });
    }

    let _ajxgList = [];
    if (ajxgList) {
      _ajxgList = ajxgList.map((d, idx) => {
        d.rownumber = idx + 1;
        return d;
      });
    }

    const ajxgListProps = {
      loading: ajxgLoading,
      columns: this.getAjxgColumn(),
      dataSource: _ajxgList,
      onRowClick: this.onRowClick,
      pagination: {
        current: AjxgCurrent,
        pageSize,
        total: AjxgTotal,
      },
      onChange: (page, filtersArg, sorter)=>{
        dispatch({
          type: 'wtfk/getAjxg',
          payload: {
            page: page.current - 1 > 0 ? page.current - 1 : 0,
            size: page.pageSize,
            data: searchFields
          },
        });
      }
    };

    const xtxgListProps = {
      loading: xtxgLoading,
      columns: this.getXtxgColumn(),
      dataSource: _list,
      onRowClick: this.onRowClick,
      pagination: {
        current, pageSize, total,
      },
      onChange: (page, filtersArg, sorter)=>{
        dispatch({
          type: 'wtfk/getXtxg',
          payload: {
            page: page.current - 1 > 0 ? page.current - 1 : 0,
            size: page.pageSize,
            // sort: sorter.field ? sorter.field + ',' + (sorter.order === 'ascend' ? 'asc' : 'desc') : '',
          },
        });
      }
    };

    const tabList = [{
      key: '1',
      tab: '案件相关反馈',
    }, {
      key: '2',
      tab: '系统相关反馈',
    }];

    return (
      <PageHeaderLayout wrapperClassName={styles.default}
                        tabList={tabList}
                        tabActiveKey={this.state.activeTab || '1'}
                        onTabChange={this.SwitchTabs}>
        {
          this.state.activeTab === '1' && (
            <Card>
              <AjxgSearch dispatch={dispatch} searchFields={searchFields}/>
              <Table {...ajxgListProps} dispatch={dispatch}/>
            </Card>
          )
        }
        {
          this.state.activeTab === '2' && (
            <Card>
              <XtxgSearch dispatch={dispatch} searchFields={searchFields}/>
              <Table {...xtxgListProps} dispatch={dispatch}/>
            </Card>
          )
        }
      </PageHeaderLayout>
    );
  }
}

@connect(({wtfk, loading}) => ({
  wtfk,
  ajxgLoading: loading.effects['wtfk/getAjxg'],
  xtxgLoading: loading.effects['wtfk/getXtxg'],
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Index {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}
