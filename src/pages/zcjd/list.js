import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Card, Icon} from 'antd';
import {routerRedux} from 'dva/router';
import moment from 'moment';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import StandardTable from 'lib/StandardTable';
import {PROCESS_MULTIPLE} from '../../constant';
import Authorized from 'utils/Authorized';
import styles from './index.less';

const {AuthorizedRoute} = Authorized;

class Lists extends PureComponent {

  state = {
    stage: 'ZJ',
    list: [],
    page: {
      pageSize: 10,
      total: 0,
      current: 1
    }
  };

  componentDidMount() {
    const {dispatch} = this.props;

    let payload = {
      stage: 'ZJ',
    };

    dispatch({
      type: 'znfz/getAjList',
      payload,
    }).then(({data, success, page}) => {
      if (data && success) {
        this.setState({
          list: data && data.content || [],
          page: {
            pageSize: data.size,
            total: data.totalElements,
            current: data.number + 1
          }
        })
      }
    });
  }

  handleStandardTableChange = (page, filtersArg, sorter) => {
    const {dispatch} = this.props;
    const {stage} = this.state;
    dispatch({
      type: 'znfz/getAjList',
      payload: {
        stage,
        page: page.current - 1 > 0 ? page.current - 1 : 0,
        size: page.pageSize,
        sort: sorter.field ? sorter.field + ',' + (sorter.order === 'ascend' ? 'asc' : 'desc') : '',
      },
    }).then(({data, success, page}) => {
      if (data && success) {
        this.setState({
          list: data && data.content || [],
          page: {
            pageSize: data.size,
            total: data.totalElements,
            current: data.number + 1
          }
        })
      }
    });
  };

  getDataColumns = () => {
    const {dispatch} = this.props;

    const columns = [{
      title: [],
      width: '50px',
      dataIndex: 'rownumber',
      className: 'rownumber',
    }, {
      title: '移送案由',
      dataIndex: 'ysay',
      key: 'ysay',
      width: '15%',
    }, {
      title: '案件名称',
      dataIndex: 'ajmc',
      key: 'ajmc',
      render: (text, record) => {
        if (!record.id) return;

        return (
          <p>
            <a onClick={() => {
              const time = record.bxt_bjsj ? moment(record.bxt_bjsj).isAfter('2019-04-20T00:00:00') : true;
              const currencyPath = `/currencydeal/${record.bmsah}/case`;
              const choosePath = `/zcjd/deal/${record.bmsah}`;
              const path = record.ysay === '盗窃罪' || time ? currencyPath : choosePath;
              dispatch(
                routerRedux.push({
                  pathname: path,
                  query: {
                    stage: 'ZJ',
                    bmsah: record.bmsah,
                    tysah: record.tysah,
                    ysay: record.ysay,
                  },
                }),
              );
            }}>{record.ajmc}</a>
          </p>
        )
      },
    }, {
      title: '部门受案号',
      dataIndex: 'bmsah',
      key: 'bmsah',
      sorter: true,
      width: '20%',
    }, {
      title: '受理时间',
      dataIndex: 'sasj',
      key: 'sasj',
      width: '15%',
      render: (text, record) => record.sasj && moment(record.sasj).format('YYYY-MM-DD HH:mm'),
    }, {
      title: '  ',
      key: 'operation',
      width: '10%',
      render: (text, record) => {
        if (!record.id) return;

        return (
          <p>
            <a onClick={() => {
              const time = record.bxt_bjsj ? moment(record.bxt_bjsj).isAfter('2019-04-20T00:00:00') : true;
              const currencyPath = `/currencydeal/${record.bmsah}/case`;
              const choosePath = `/zcjd/deal/${record.bmsah}`;
              const path = record.ysay === '盗窃罪' || time ? currencyPath : choosePath;
              dispatch(
                routerRedux.push({
                  pathname: path,
                  query: {
                    stage: 'ZJ',
                    bmsah: record.bmsah,
                    tysah: record.tysah,
                    ysay: record.ysay,
                  },
                }),
              );
            }}>{record.status === 0 ? '办理' : '查看'}</a>
          </p>
        )
      },
    }];

    return columns;
  };

  getTableHeight = () => {
    const clientHeight = document.body.clientHeight;
    return clientHeight - 340;
  };

  render() {

    const {loading} = this.props;
    const {pageSize, total, current} = this.state.page;
    const {list} = this.state;
    let _list = [];
    if (list) {
      _list = list.map((d, idx) => {
        d.id = d.bmsah;
        d.rownumber = pageSize * (current - 1) + idx + 1;
        return d;
      });
    }

    return (
      <PageHeaderLayout
        wrapperClassName={styles.default}
      >
        <Card className={styles.content} title={<span><Icon type='clock' style={{color: 'red'}}/> 超期预警案件列表</span>}>
          <StandardTable scroll={{y: this.getTableHeight()}}
                         selected={false}
                         loading={loading}
                         selectedRows={[]}
                         data={{
                           list: _list,
                           pagination: {
                             pageSize, total, current,
                             showTotal: (total, range) => `当前: ${range[0]}-${range[1]} 共 ${total} 条`,
                           },
                         }}
                         onChange={this.handleStandardTableChange}
                         columns={this.getDataColumns()}/>
        </Card>
      </PageHeaderLayout>
    );
  }
}

@connect(({znfz, loading}) => ({
  znfz,
  loading: loading.effects['znfz/getAjList'],
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Lists {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}

