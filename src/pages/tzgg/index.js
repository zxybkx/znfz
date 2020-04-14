import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Icon, Card, Select, Input} from 'antd';
import moment from 'moment';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import StandardTable from 'lib/StandardTable';
import styles from './index.less';
import Authorized from 'utils/Authorized';

const {AuthorizedRoute} = Authorized;

const Search = Input.Search;

class Notices extends PureComponent {

  state = {
    formValues: {},
    titleType: '1',
  };

  componentDidMount() {
    const {dispatch, location: {query}} = this.props;
    const type = query.type || '1';

    if (type === '3') {
      dispatch({
        type: 'tzgg/getDxal',
        payload: {},
      }).then(() => {
        this.setState({titleType: type})
      });
    } else if (type === '4') {
      dispatch({
        type: 'tzgg/getFlfg',
        payload: {},
      }).then(() => {
        this.setState({titleType: type})
      });
    } else {
      dispatch({
        type: 'tzgg/getFile',
        payload: {
          page: 0,
          size: 10,
          title_type: type,
        },
      }).then(() => {
        this.setState({titleType: type})
      });
    }
  }

  handleStandardTableChange = (page, filtersArg, sorter) => {
    const {dispatch} = this.props;
    const {titleType} = this.state;
    if (titleType === '3') {
      dispatch({
        type: 'tzgg/getDxal',
        payload: {
          page: page.current - 1 > 0 ? page.current - 1 : 0,
          size: page.pageSize,
          sort: sorter.field ? sorter.field + ',' + (sorter.order === 'ascend' ? 'asc' : 'desc') : '',
        },
      });
    } else if (titleType === '4') {
      dispatch({
        type: 'tzgg/getFlfg',
        payload: {
          page: page.current - 1 > 0 ? page.current - 1 : 0,
          size: page.pageSize,
          sort: sorter.field ? sorter.field + ',' + (sorter.order === 'ascend' ? 'asc' : 'desc') : '',
        },
      });
    } else {
      dispatch({
        type: 'tzgg/getFile',
        payload: {
          title_type: titleType,
          page: page.current - 1 > 0 ? page.current - 1 : 0,
          size: page.pageSize,
          sort: sorter.field ? sorter.field + ',' + (sorter.order === 'ascend' ? 'asc' : 'desc') : '',
        },
      });
    }
  };

  getDataColumns = () => {
    const columns = [{
      //   title: '',
      //   width: '50px',
      //   dataIndex: 'rownumber',
      //   className: 'rownumber',
      // }, {
      title: '标题',
      width: '35%',
      dataIndex: 'title',
      key: 'title',
      // }, {
      //   title: '创建人',
      //   width: '15%',
      //   dataIndex: 'createBy',
      //   key: 'createBy',
    }, {
      title: '时间',
      width: '20%',
      dataIndex: 'create_time',
      key: 'create_time',
      render: (text, record) => record.create_time && moment(record.create_time).format('YYYY-MM-DD'),
      // }, {
      //   title: '文件类型',
      //   dataIndex: 'file_type',
      //   key: 'file_type',
    }, {
      title: '操作',
      width: '10%',
      render: (text, record) => {
        if (record.id) {
          return <a target="_blank" href={`${record.url}`}>下载</a>
        }
      },
    }];

    return columns;
  };

  getTableHeight = () => {
    const clientHeight = document.body.clientHeight;
    return clientHeight - 400;
  };

  onChange = (val) => {
    const {dispatch} = this.props;
    if (val === '3') {
      dispatch({
        type: 'tzgg/getDxal',
        payload: {},
      }).then(() => {
        this.setState({titleType: val})
      });
    } else if (val === '4') {
      dispatch({
        type: 'tzgg/getFlfg',
        payload: {},
      }).then(() => {
        this.setState({titleType: val})
      });
    } else {
      dispatch({
        type: 'tzgg/getFile',
        payload: {
          title_type: val,
        },
      }).then(() => {
        this.setState({titleType: val})
      });
    }
  };

  onTitleSearch = (value) => {
    const {dispatch} = this.props;
    const {titleType} = this.state;
    if (titleType === '3') {
      dispatch({
        type: 'tzgg/getDxal',
        payload: {
          title: value,
        },
      });
    } else if (titleType === '4') {
      dispatch({
        type: 'tzgg/getFlfg',
        payload: {
          title: value,
        },
      });
    } else {
      dispatch({
        type: 'tzgg/getFile',
        payload: {
          title_type: titleType,
          title: value,
        },
      });
    }
  };

  render() {

    const {loading} = this.props;
    const {list, pageSize, total, current} = this.props.tzgg;

    const pagination = {
      total,
      pageSize,
      current,
    };

    let _list = [];
    if (list) {
      _list = list.map((d, idx) => {
        d.rownumber = pageSize * (current - 1) + idx + 1;
        return d;
      });
    }

    const extra = (
      <div>
        <Search
          style={{width: '250px', marginRight: 20}}
          placeholder="标题查询"
          onSearch={this.onTitleSearch}
          enterButton
        />
        <Select style={{width: '180px'}}
                defaultValue={this.state.titleType}
                value={this.state.titleType}
                onChange={this.onChange}>
          <Select.Option value='1'>公告栏</Select.Option>
          <Select.Option value='2'>服务窗</Select.Option>
          <Select.Option value='3'>典型案例学习</Select.Option>
          <Select.Option value='4'>法律法规</Select.Option>
        </Select>
      </div>
    );

    return (
      <PageHeaderLayout wrapperClassName={styles.default}>
        <Card bordered={false} extra={extra}
              title={<span><Icon type='bars'/>  通知通告列表</span>}>
          <StandardTable scroll={{y: this.getTableHeight()}}
                         selected={false}
                         selectedRows={[]}
                         loading={loading}
                         data={{
                           list: _list,
                           pagination: {
                             pageSize, total, current,
                           },
                         }}
                         pagination={pagination}
                         columns={this.getDataColumns()}
                         onChange={this.handleStandardTableChange}/>

        </Card>
      </PageHeaderLayout>
    );
  }
}

@connect(({tzgg, loading}) => ({
  tzgg,
  loading: loading.effects['tzgg/getFile'],
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Notices {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}
