import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Link, routerRedux} from 'dva/router';
import {Card, Button, Icon} from 'antd';
import moment from 'moment';
import Ellipsis from 'lib/Ellipsis';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import Table from '../components/WtTable';
import AjxxInfo from '../components/AjxxInfo';
import styles from './ajxg.less';
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

class Ajxg extends React.PureComponent {

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
        type: 'znfz/getAjxx',
        payload: {
          bmsah: query.bmsah,
        },
      });

      dispatch({
        type: 'wtfk/getStaticsByBmsah',
        payload: {
          bmsah: query.bmsah,
        },
      });

      if (query.wtlx) {
        dispatch({
          type: 'wtfk/getYhfkByBmsah',
          payload: {
            bmsah: query.bmsah,
            wtlx: query.wtlx,
          },
        });
      } else {
        dispatch({
          type: 'wtfk/getXtwtByBmsah',
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
      }, {
        title: '规则类别',
        dataIndex: 'yjfl',
        key: 'yjfl',
        width: '10%',
      }, {
        title: '规则名称',
        dataIndex: 'gzmc',
        key: 'gzmc',
      }, {
        title: '甄别结果',
        dataIndex: 'zbjg',
        key: 'zbjg',
        width: '10%',
        render: (text, record) => <div>{zbjg[text]}</div>,
      }, {
        title: '明细类别',
        dataIndex: 'cwlx',
        key: 'cwlx',
        width: '10%',
        render: (text, record) => <div>{cwlx[text]}</div>,
      }, {
        title: '改进建议',
        dataIndex: 'wtms',
        key: 'wtms',
        width: '10%',
        render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={100}
                                            tooltip>{text}</Ellipsis>,
      }, {
        title: '提交人',
        dataIndex: 'createdName',
        key: 'createdName',
        width: '8%',
      },
      {
        title: '提交时间',
        dataIndex: 'createdDate',
        key: 'createdDate',
        width: '12%',
        render: (text, record) => text === null ? '' : moment(text).format('YYYY-MM-DD  HH:mm:ss'),
      }, {
        title: '答复状态',
        dataIndex: 'dfzt',
        key: 'dfzt',
        width: '10%',
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
                  pathname: `/wtfk/reply/xt`,
                  query: {
                    id: record.id,
                    bmsah: record.bmsah,
                  },
                }));
              }}>答复</a>
            );
          } else {
            return (
              <a onClick={() => {
                dispatch(routerRedux.push({
                  pathname: `/wtfk/reply/xt`,
                  query: {
                    id: record.id,
                    bmsah: record.bmsah,
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
        title: '问题类别',
        dataIndex: 'wtlx',
        key: 'wtlx',
        width: '15%',
      }, {
        title: '问题描述',
        dataIndex: 'advice',
        key: 'advice',
        render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={100}
                                            tooltip>{text}</Ellipsis>,
      }, {
        title: '提交人',
        dataIndex: 'createdName',
        key: 'createdName',
        width: '8%',
      },
      {
        title: '提交时间',
        dataIndex: 'createdDate',
        key: 'createdDate',
        width: '12%',
        render: (text, record) => text === null ? '' : moment(text).format('YYYY-MM-DD  HH:mm:ss'),
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
      }, {
        title: '问题类别',
        dataIndex: 'wtlx',
        key: 'wtlx',
        width: '10%',
      }, {
        title: '问题描述',
        dataIndex: 'advice',
        key: 'advice',
        render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={100}
                                            tooltip>{text}</Ellipsis>,
      }, {
        title: '提交人',
        dataIndex: 'createdName',
        key: 'createdName',
        width: '8%',
      },
      {
        title: '提交时间',
        dataIndex: 'createdDate',
        key: 'createdDate',
        width: '12%',
        render: (text, record) => text === null ? '' : moment(text).format('YYYY-MM-DD  HH:mm:ss'),
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
    const {dispatch, location: {query}} = this.props;

    this.setState({activeTab: activeKey}, () => {
      if (activeKey === '规则问题') {
        dispatch({
          type: 'wtfk/getXtwtByBmsah',
          payload: {
            bmsah: query.bmsah,
          },
        });
      } else {
        dispatch({
          type: 'wtfk/getYhfkByBmsah',
          payload: {
            bmsah: query.bmsah,
            wtlx: activeKey,
          },
        });
      }
    });
  };

  goBack = () => {
    const {dispatch} = this.props;
    dispatch(routerRedux.push({
      pathname: `/wtfk/deal`,
      query: {
        activeTab: '1',
      },
    }));
  };

  render() {
    const {dispatch, wtfk, xtwtLoading, yhfkLoading, znfz: {ajxx}} = this.props;
    const {statics, list, pageSize, current} = wtfk;

    let _list = [];
    if (list) {
      _list = list.map((d, idx) => {
        d.rownumber = pageSize * (current - 1) + idx + 1;
        return d;
      });
    }

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

    const actions = <Button className={styles.return} type='ghost'
                            onClick={() => {
                              this.goBack();
                            }} icon='rollback'>返回</Button>;

    return (
      <PageHeaderLayout wrapperClassName={styles.default}
                        tabList={tabList}
                        tabActiveKey={this.state.activeTab || '1'}
                        onTabChange={this.SwitchTabs}
                        tabBarExtraContent={actions}>
        <Card>
          <AjxxInfo ajxx={ajxx}/>
          {this.state.activeTab === '规则问题' && <Table {...xtwtListProps} dispatch={dispatch}/>}
          {this.state.activeTab === '结论问题' && <Table {...jlDataListProps} dispatch={dispatch}/>}
          {this.state.activeTab === '文书问题' && <Table {...wsDataListProps} dispatch={dispatch}/>}
          {this.state.activeTab === '其它问题' && <Table {...qtDataListProps} dispatch={dispatch}/>}
        </Card>
      </PageHeaderLayout>
    );
  }
}

@connect(({znfz, wtfk, loading}) => ({
  znfz,
  wtfk,
  xtwtLoading: loading.effects['wtfk/getXtwtByBmsah'],
  yhfkLoading: loading.effects['wtfk/getYhfkByBmsah'],
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Ajxg {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}
