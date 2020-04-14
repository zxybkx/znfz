import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Link, routerRedux} from 'dva/router';
import {Card, Icon} from 'antd';
import moment from 'moment';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import Ellipsis from 'lib/Ellipsis';
import Table from '../components/WtTable';
import styles from './index.less';
import Authorized from 'utils/Authorized';

const {AuthorizedRoute} = Authorized;

const cwlx = {
  A: '规则问题',
  B: '识别问题',
  C: '其它问题',
};

const zbjg = {
  A: '正确',
  B: '错误',
};

class Mine extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      activeTab: '规则问题',
    }
  }

  componentDidMount() {
    const {dispatch, location: {query}} = this.props;

    this.setState({activeTab: query.wtlx || '规则问题'}, () => {
      dispatch({
        type: 'wtfk/getMyStatics',
      });

      if (query.wtlx) {
        dispatch({
          type: 'wtfk/getMyYhfk',
          payload: {
            bmsah: query.bmsah,
            wtlx: query.wtlx,
          },
        });
      } else {
        dispatch({
          type: 'wtfk/getMyXtwt',
          payload: {
            bmsah: query.bmsah,
          },
        });
      }
    });
  }

  getXtwtColumns = () => {

    const {dispatch} = this.props;

    const xtwtColumns = [
      {
        title: '序号',
        dataIndex: 'rownumber',
        key: 'rownumber',
        width: '5%',
      },{
        title: '单位',
        dataIndex: 'cbdw_mc',
        key: 'cbdw_mc',
        width: '12%',
      }, {
        title: '承办人',
        dataIndex: 'cbr',
        key: 'cbr',
        width: '8%',
      }, {
        title: '案件名称',
        dataIndex: 'ajmc',
        key: 'ajmc',
        width: '15%',
      }, {
        title: '问题描述',
        dataIndex: 'wtms',
        key: 'wtms',
        render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={100}
                                            tooltip>{text}</Ellipsis>,
      },
      {
        title: '提交时间',
        dataIndex: 'createdDate',
        key: 'createdDate',
        width: '15%',
        render: (text, record) => text ? moment(text).format('YYYY-MM-DD  HH:mm:ss') : '',
      }, {
        title: '答复时间',
        dataIndex: 'dfsj',
        key: 'dfsj',
        width: '15%',
        render: (text, record) => record.dfs && record.dfs.length > 0 ? moment(record.dfs[0].createdDate).format('YYYY-MM-DD  HH:mm:ss') : '未答复',
      }, {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: '5%',
        render: (text, record) => {
          if (record.dfzt === 1) {
            return (
              <a onClick={() => {
                dispatch({
                  type: 'wtfk/changeCkzt',
                  payload: {
                    id: record.id,
                    wtlx: record.wtlx,
                    ckzt: 3,
                  },
                });
                dispatch(routerRedux.push({
                  pathname: `/wtfk/reply/xt`,
                  query: {
                    id: record.id,
                    bmsah: record.bmsah,
                    view: 1,
                    mine: 1,
                  },
                }));
              }}>查看</a>
            );
          } else {
            return (
              <a onClick={() => {
                dispatch(routerRedux.push({
                  pathname: `/wtfk/reply/xt`,
                  query: {
                    id: record.id,
                    bmsah: record.bmsah,
                    view: 1,
                    mine: 1,
                  },
                }));
              }}>查看</a>
            );
          }
        },
      },
    ];

    return xtwtColumns;
  };

  getYHFKColumns = () => {
    const {dispatch} = this.props;
    const yhfkColumns = [
      {
        title: '序号',
        dataIndex: 'rownumber',
        key: 'rownumber',
        width: '5%',
      },{
        title: '单位',
        dataIndex: 'cbdw_mc',
        key: 'cbdw_mc',
        width: '12%',
      }, {
        title: '承办人',
        dataIndex: 'cbr',
        key: 'cbr',
        width: '8%',
      }, {
        title: '案件名称',
        dataIndex: 'ajmc',
        key: 'ajmc',
        width: '15%',
      }, {
        title: '问题描述',
        dataIndex: 'advice',
        key: 'advice',
        render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={100}
                                            tooltip>{text}</Ellipsis>,
      },
      {
        title: '提交时间',
        dataIndex: 'createdDate',
        key: 'createdDate',
        width: '15%',
        render: (text, record) => text ? moment(text).format('YYYY-MM-DD  HH:mm:ss') : '',
      }, {
        title: '答复时间',
        dataIndex: 'dfsj',
        key: 'dfsj',
        width: '15%',
        render: (text, record) => record.dfs && record.dfs.length > 0 ? moment(record.dfs[0].createdDate).format('YYYY-MM-DD  HH:mm:ss') : '未答复',
      }, {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: '5%',
        render: (text, record) => {
          if (record.dfzt === 1) {
            return (
              <a onClick={() => {
                dispatch({
                  type: 'wtfk/changeCkzt',
                  payload: {
                    id: record.id,
                    wtlx: record.wtlx,
                    ckzt: 3,
                  },
                });
                dispatch(routerRedux.push({
                  pathname: `/wtfk/reply/yh`,
                  query: {
                    id: record.id,
                    bmsah: record.bmsah,
                    view: 1,
                    mine: 1,
                  },
                }));
              }}>查看</a>
            );
          } else {
            return (
              <a onClick={() => {
                dispatch(routerRedux.push({
                  pathname: `/wtfk/reply/yh`,
                  query: {
                    id: record.id,
                    bmsah: record.bmsah,
                    view: 1,
                    mine: 1,
                  },
                }));
              }}>查看</a>
            );
          }
        },
      },
    ];

    return yhfkColumns;
  };

  getYHFKColumnsSimple = () => {
    const {dispatch} = this.props;
    const yhfkColumns = [
      {
        title: '序号',
        dataIndex: 'rownumber',
        key: 'rownumber',
        width: '5%',
      },{
        title: '单位',
        dataIndex: 'cbdw_mc',
        key: 'cbdw_mc',
        width: '12%',
      }, {
        title: '承办人',
        dataIndex: 'cbr',
        key: 'cbr',
        width: '8%',
      }, {
        title: '问题描述',
        dataIndex: 'advice',
        key: 'advice',
        render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={100}
                                            tooltip>{text}</Ellipsis>,
      },
      {
        title: '提交时间',
        dataIndex: 'createdDate',
        key: 'createdDate',
        width: '15%',
        render: (text, record) => text ? moment(text).format('YYYY-MM-DD  HH:mm:ss') : '',
      }, {
        title: '答复时间',
        dataIndex: 'dfsj',
        key: 'dfsj',
        width: '15%',
        render: (text, record) => record.dfs && record.dfs.length > 0 ? moment(record.dfs[0].createdDate).format('YYYY-MM-DD  HH:mm:ss') : '未答复',
      }, {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: '5%',
        render: (text, record) => {
          if (record.dfzt === 1) {
            return (
              <a onClick={() => {
                dispatch({
                  type: 'wtfk/changeCkzt',
                  payload: {
                    id: record.id,
                    wtlx: record.wtlx,
                    ckzt: 3,
                  },
                });
                dispatch(routerRedux.push({
                  pathname: `/wtfk/reply/yh`,
                  query: {
                    id: record.id,
                    bmsah: record.bmsah,
                    view: 1,
                    mine: 1,
                  },
                }));
              }}>查看</a>
            );
          } else {
            return (
              <a onClick={() => {
                dispatch(routerRedux.push({
                  pathname: `/wtfk/reply/yh`,
                  query: {
                    id: record.id,
                    bmsah: record.bmsah,
                    view: 1,
                    mine: 1,
                  },
                }));
              }}>查看</a>
            );
          }
        },
      },
    ];

    return yhfkColumns;
  };

  SwitchTabs = (activeKey) => {
    const {dispatch} = this.props;
    this.setState({activeTab: activeKey}, () => {
      if (activeKey === '规则问题') {
        dispatch({
          type: 'wtfk/getMyXtwt',
          payload: {},
        });
      } else {
        dispatch({
          type: 'wtfk/getMyYhfk',
          payload: {
            wtlx: activeKey,
          },
        });
      }
    });
  };

  onChange = (pagination, filters, sorter) => {
    const {dispatch, location: {query}} = this.props;
    if(this.state.activeTab === '规则问题') {
      dispatch({
        type: 'wtfk/getMyXtwt',
        payload: {
          bmsah: query.bmsah,
          page: pagination.current - 1,
          size: pagination.pageSize
        },
      });
    }else {
      dispatch({
        type: 'wtfk/getMyYhfk',
        payload: {
          wtlx: this.state.activeTab,
          page: pagination.current - 1,
          size: pagination.pageSize
        },
      });
    }
  };


  render() {
    const {dispatch, wtfk, xtwtLoading, yhfkLoading} = this.props;
    const {statics, list, total, pageSize, current} = wtfk;

    let _list = [];
    if (list) {
      _list = list.map((d, idx) => {
        d.rownumber = pageSize * (current - 1) + idx + 1;
        return d;
      });
    }

    const pagination = {
      total,pageSize,current
    };

    const xtwtListProps = {loading: xtwtLoading, dataSource: _list, columns: this.getXtwtColumns()};
    const wsDataListProps = {loading: yhfkLoading, dataSource: _list, columns: this.getYHFKColumns()};
    const jlDataListProps = {loading: yhfkLoading, dataSource: _list, columns: this.getYHFKColumns()};
    const qtDataListProps = {loading: yhfkLoading, dataSource: _list, columns: this.getYHFKColumnsSimple()};

    const tabList = [{
      key: '规则问题',
      tab: <span><Icon type="folder"/>规则问题({`${statics.gzCount.dealed || 0}/${statics.gzCount.total || 0}`})</span>,
    }, {
      key: '结论问题',
      tab: <span><Icon type="solution"/>结论问题({`${statics.jlCount.dealed || 0}/${statics.jlCount.total || 0}`})</span>,
    }, {
      key: '文书问题',
      tab: <span><Icon type="book"/>文书问题({`${statics.wsCount.dealed || 0}/${statics.wsCount.total || 0}`})</span>,
    }, {
      key: '其它问题',
      tab: <span><Icon type="schedule"/>其它问题({`${statics.qtCount.dealed || 0}/${statics.qtCount.total || 0}`})</span>,
    }];

    return (
      <PageHeaderLayout wrapperClassName={styles.default}
                        tabList={tabList}
                        tabActiveKey={this.state.activeTab || '1'}
                        onTabChange={this.SwitchTabs}>
        <Card>
          {this.state.activeTab === '规则问题' && <Table {...xtwtListProps} dispatch={dispatch} pagination={pagination} onChange={this.onChange}/>}
          {this.state.activeTab === '结论问题' && <Table {...jlDataListProps} dispatch={dispatch} pagination={pagination} onChange={this.onChange}/>}
          {this.state.activeTab === '文书问题' && <Table {...wsDataListProps} dispatch={dispatch} pagination={pagination} onChange={this.onChange}/>}
          {this.state.activeTab === '其它问题' && <Table {...qtDataListProps} dispatch={dispatch} pagination={pagination} onChange={this.onChange}/>}
        </Card>
      </PageHeaderLayout>
    );
  }
}

@connect(({wtfk, loading}) => ({
  wtfk,
  xtwtLoading: loading.effects['wtfk/getMyXtwt'],
  yhfkLoading: loading.effects['wtfk/getMyYhfk'],
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Mine {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}
