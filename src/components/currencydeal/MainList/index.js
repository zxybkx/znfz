import React, {PureComponent, Fragment} from 'react';
import {connect} from 'dva';
import {Button, Card, Form, Row, Col, Input, Select, DatePicker, Modal, message} from 'antd';
import {routerRedux} from 'dva/router';
import moment from 'moment';
import _ from 'lodash';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import StandardTable from 'lib/StandardTable';
import Session from 'utils/session';
import {TASK_CONDITION, PROVENCE_CODE, PROCESS_MULTIPLE} from '../../../constant';
import Authorized from 'utils/Authorized';
import styles from './index.less';

const {AuthorizedRoute} = Authorized;

const Option = Select.Option;
const {RangePicker} = DatePicker;
const confirm = Modal.confirm;

@Form.create({
  mapPropsToFields(props) {
    const {znfz: {taskQueryCondition}} = props;
    return _.mapValues(taskQueryCondition, (v, k) => Form.createFormField({k, value: v}));
  },
})

@connect(({global, zcjd, znfz, loading}) => ({
  global,
  zcjd,
  znfz,
  loading: loading.effects['znfz/getTasks'],
}))

export default class Tasks extends PureComponent {

  state = {//定义属性
    formValues: {},
    extract: false
  };

  componentDidMount() {//生命周期
    const {form: {getFieldsValue}, dispatch, dqjd, stage} = this.props;
    const {location: {query}} = this.props;
    const startDate = this.getStartDate();
    const start = query.startTime ? query.startTime : moment(startDate).format('YYYY-MM-DD');
    const dateRange = this.getCurrentDateRange();
    const end = moment(dateRange).format('YYYY-MM-DD');
    const zt = query.zt && /\d+/.test(query.zt) ? parseInt(query.zt) : -1;
    // const ysay = query.ysay ? query.ysay : PROVENCE_CODE === '330' ? 'all' : '走私、贩卖、运输、制造毒品罪';
    const ysay = query.ysay ? query.ysay : PROVENCE_CODE === '330' ? 'all' : '走私、贩卖、运输、制造毒品罪';
    let payload;
    // if (_.isEmpty(query) && window._latestTaskQueryCondition) {
    //   console.log('window._latestTaskQueryCondition', window._latestTaskQueryCondition);
    //   payload = {...window._latestTaskQueryCondition, dqjd: dqjd, start: start};
    // } else {
    payload = {
      dqjd: dqjd,
      start,
      end,
      ajzt: {
        zt,
      },
      ysay,
      zt,
      dateRange,
    }
    // }
    this.loadData(payload);

    dispatch({
      type: 'global/getVersionConfig',
    });
  }

  componentWillUnmount() {
    clearTimeout(this.timeId);
  };

  hasNewVersionAuthority = () => {
    const {global: {versionConfig}} = this.props;
    const session = Session.get();
    let flag = false;
    if (session && !_.isEmpty(versionConfig)) {
      const openUsers = versionConfig.users.split(',');
      const sessionDept = `${session.dwbm}|*`;
      const sessionUser = `${session.dwbm}|${session.gh}`;
      if (openUsers.indexOf(sessionDept) >= 0 || openUsers.indexOf(sessionUser) >= 0) {
        flag = true;
      }
    }
    return flag;
  };

  getStartDate = () => {
    const year = moment().subtract(1, 'years').year();
    const start = moment(`${year}0101`, 'YYYYMMDD');
    return start;
  };

  getCurrentDateRange = () => {
    const end = moment();
    return end;
  };

  onSelectChange = (query) => {
    const {formValues} = this.state;
    const {dqjd,form} = this.props;
    const _formValues = {...formValues, ...query};

    this.loadData({
      dqjd: dqjd,
      ..._formValues,
      // ...form.getFieldsValue(),
      ajzt: {
        zt: _formValues.zt,
      },
    });
  };
  //抽取事件--展开
  onextract = () => {
    this.setState({
      visible: true
    })
  }
  renderSearchForm() {
    const { getFieldDecorator } = this.props.form;
    const { location: { query } } = this.props;
    let taskCondition = _.cloneDeep(TASK_CONDITION);
    const hasNewVersionAuthority = this.hasNewVersionAuthority();
    if (!hasNewVersionAuthority) {
      taskCondition = _.filter(taskCondition, v => v.ysay );
    }
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 8, xl: 8 }}>
          <Col xl={4} lg={4} md={4} sm={24} className={styles.titleitem}>
            <div style={{width:'69%',lineHeight:'30px',fontSize:'16px'}}>办理阶段:</div>
            {getFieldDecorator('zt', {
              initialValue: query.zt && /\d+/.test(query.zt) ? parseInt(query.zt) : 1,
            })(
              <Select onChange={(value) => this.onSelectChange({ zt: value })}>
                <Option value={-1}>全部</Option>
                <Option value={1}>未结</Option>
                <Option value={9}>已结</Option>
              </Select>,
            )}
          </Col>

          <Col xl={4} lg={4} md={4} sm={24} className={styles.titleitem}>
            <span style={{width:'69%',lineHeight:'30px',fontSize:'16px'}}>移送案由:</span>
            {getFieldDecorator('ysay', {
              // initialValue: query.ysay ? query.ysay : PROVENCE_CODE === '320' ? '交通肇事罪' : '走私、贩卖、运输、制造毒品罪',
              initialValue: query.ysay ? query.ysay : PROVENCE_CODE === '330' ? '交通肇事罪' : '走私、贩卖、运输、制造毒品罪',
            })(
              <Select onChange={(value) => this.onSelectChange({ ysay: value })}>
                <Option value="all">全部</Option>
                {
                  taskCondition.map((obj, key) => {
                    return <Option key={key} value={obj.ysay}>{obj.ysay}</Option>
                  })
                }
              </Select>
            )}
          </Col>
          <Col xl={8} lg={8} md={8} sm={24} className={styles.titleitem}>
            <span style={{width:'89%',lineHeight:'30px',fontSize:'16px'}} >部门受案号/案件名称:</span>
            {getFieldDecorator('ajmc')(
              <Input />,
            )}
          </Col>
          <Col xl={5} lg={5} md={5} sm={24} className={styles.titleitem}>
            <span style={{width:'47%',lineHeight:'30px',fontSize:'16px'}}>提交时间:</span>
            {getFieldDecorator('startDate', {
              initialValue: this.getStartDate(),
            })(
              <DatePicker format='YYYY-MM-DD' />,
            )}
          </Col>
          <Col xl={3} lg={3} md={3} sm={24} className={styles.titleitem}>
            {getFieldDecorator('dateRange', {
              initialValue: this.getCurrentDateRange(),
            })(
              <DatePicker format='YYYY-MM-DD' />,
            )}
          </Col>
        </Row>
        <Row type="flex" justify="left" style={{marginTop:'10px'}} className={styles.titler}>
          <Col md={5} sm={24} className={styles.rdesc}>
            <Button
              type="danger"
              className={styles.cqbtn}
              onClick={this.onextract}>抽取</Button>
            <Button type="primary" htmlType="submit"
                    style={{borderTopLeftRadius:'4px',borderBottomLeftRadius:'4px'}}>查询</Button>
            <span className={styles.submitButtons}>
              <Button type="default" onClick={this.handleFormReset}
                      style={{borderTopRightRadius:'4px',
                        borderBottomRightRadius:'4px',
                        borderLeft:'none',
                        borderColor:'#4976F7',
                        color:'#4976F7'}}>重置</Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }
  //重置

  handleFormReset = () => {
    const {form} = this.props;

    form.resetFields();
    const startDate = this.getStartDate();
    const start = moment(startDate).format('YYYY-MM-DD');
    const dateRange = this.getCurrentDateRange();
    const end = moment(dateRange).format('YYYY-MM-DD');
    this.props.location.query.zt=-1;
    this.props.location.query.ysay='all';
    this.setState({
      formValues: {
        ...form.getFieldsValue(), start, end,
      },
    }, () => {
      this.onSelectChange({});
    });

  };
  //搜索
  handleSearch = (e) => {
    e.preventDefault();
    const { form, dqjd } = this.props;
    form.validateFields((err, fieldsValue) => {
      // if (err) return;
      const startDate = fieldsValue.startDate || this.getStartDate();
      const start = moment(startDate).format('YYYY-MM-DD');
      const dateRange = fieldsValue.dateRange || this.getCurrentDateRange();
      const end = moment(dateRange).format('YYYY-MM-DD');
      form.resetFields();
      const values = {
        start,
        end,
        ...fieldsValue,
        ajzt: {
          zt: fieldsValue.zt,
        },
      };
      setTimeout(() => {
        this.loadData({
          dqjd: dqjd,
          ...values,
        })
      }, 100);

    });
  };

  handleStandardTableChange = (page, filtersArg, sorter) => {
    const { formValues } = this.state;
    const { dqjd } = this.props;
    this.loadData({
      ...formValues,
      ajzt: {
        zt: formValues.zt,
      },
      dqjd: dqjd,
      page: page.current - 1 > 0 ? page.current - 1 : 0,
      size: page.pageSize,
      sort: sorter.field ? sorter.field + ',' + (sorter.order === 'ascend' ? 'asc' : 'desc') : '',
    });
  };

  loadData = (payload) => {
    clearTimeout(this.timeId);
    const { dispatch } = this.props;
    //const dispatch = this.props.dispatch
    dispatch({
      type: 'znfz/getTasks',
      payload: {
        ...payload,
        hasNewVersionAuthority: this.hasNewVersionAuthority(),
      },
    }).then(() => {
      this.setState({
        formValues: payload,
      });
      this.timeId = setTimeout(() => this.loadData(payload), 600000);
    })
  };

  reStartTask = (record, target) => {
    const { dispatch, stage } = this.props;
    const bmsah = _.replace(record.bmsah, '起诉', '审判');
    dispatch({
      type: 'znfz/restarttask',
      payload: {
        bmsah: record.bmsah,
        target: target
      }
    }).then(() => {
      this.reloadTask();
    });
  };


  getInfo = (title) => {
    Modal.info({
      title: title,
      okText: '确定',
      onOk() {
      },
    })
  };


  showModal = (record, title, parameter) => {
    confirm({
      title: title,
      content: (
        <p style={{ fontSize: 15 }}>请于10分钟后刷新重试</p>
      ),
      onCancel: () => {
      },
      onOk: () => {
        this.reStartTask(record, parameter)
      }
    })
  };


  getCaseDetail = (record) => {
    const { dispatch, pathname, stage } = this.props;
    const bmsah = _.replace(record.bmsah, '起诉', '审判');
    const deal = PROCESS_MULTIPLE.indexOf(record.ysay) >= 0 ? 'xdeal' : 'deal';
    const time = record.bxt_bjsj ? moment(record.bxt_bjsj).isAfter('2019-04-20T00:00:00') : true;
    const spPath = `/spjd/spdeal/${bmsah}`;
    const currencyPath = `/currencydeal/${record.bmsah}/case`;
    const choosePath = `/${pathname}/${deal}/${record.bmsah}`;
    const path = stage === 'SP' ? spPath :
      record.ysay === '盗窃罪' || time ? currencyPath : choosePath;

    dispatch(
      routerRedux.push({
        pathname: path,
        query: {
          stage: stage,
          bmsah: stage === 'SP' ? bmsah : record.bmsah,
          tysah: record.tysah,
          ysay: record.ysay,
        },
      }),
    );
  };


  judgeState = (record) => {
    const { stage } = this.props;
    if (stage === 'SP') {
      if (record.spjd_cq === null) {
        this.showModal(record, '抽取未开始，点击确定后重新抽取', 'spjd_cq')
      } else if (record.spjd_cq === '-1') {
        this.getInfo('正在抽取，请稍后再试')
      } else if (record.spjd_cq === '2') {
        this.showModal(record, '缺少起诉书，请联系案管确认是否已上传该文书。如已上传请点击确定重新触发', 'spjd_cq')
      } else if (record.spjd_cq === '3') {
        this.showModal(record, '缺少刑事判决书，请联系案管确认是否已上传该文书。如已上传请点击确定重新触发', 'spjd_cq')
      } else if (record.spjd_cq === '4') {
        this.showModal(record, '缺少起诉书和刑事判决书，请联系案管确认是否已上传该文书。如已上传请点击确定重新触发', 'spjd_cq')
      } else {
        this.getCaseDetail(record)
      }
    } else {
      if (record.cq === '0' || record.cq === null) {
        this.showModal(record, '抽取未开始，点击确定后重新抽取', 'cq')
      } else if (record.cq === '-1') {
        this.getInfo('正在抽取，请稍后再试')
      } else if (record.sb === '0') {
        this.showModal(record, '识别未开始，点击确定后重新开始', 'sb')
      } else if (record.sb === '255') {
        this.showModal(record, '缺少提请批准逮捕书 ，请联系案管确认是否已上传该文书。如已上传请点击确定重新触发', 'cq')
      } else if (record.sb === '254') {
        this.showModal(record, '缺少起诉意见书 ，请联系案管确认是否已上传该文书。如已上传请点击确定重新触发', 'cq')
      } else if (record.sb === '2') {
        this.showModal(record, '识别异常 ，点击确定后重新解析', 'sb')
      } else if (record.sb === '-1') {
        this.getInfo('正在解析，请稍后再试')
      } else if (record.zt === '0') {
        this.showModal(record, '审查项比对失败 ，点击确定后重跑规则', 'zt')
      } else if (record.zt === '-1') {
        this.getInfo('正在重跑规则，请稍后再试')
      } else {
        this.getCaseDetail(record)
      }
    }
  };

  getDataColumns = () => {
    const { stage } = this.props;
    const columns = [{
      title: '序号',
      width: '50px',
      dataIndex: 'rownumber',
      className: 'rownumber',
    }, {
      title: '移送案由',
      dataIndex: 'ysay',
      key: 'ysay',
      width: '12%',
    }, {
      title: '案件名称',
      dataIndex: 'ajmc',
      key: 'ajmc',
      render: (text, record) => {
        return (
          <p>
            <span className={styles.bg} onClick={() => {
              this.judgeState(record);
            }}>{record.ajmc}</span>
          </p>
        )
      },
    }, {
      title: '部门受案号',
      dataIndex: 'bmsah',
      key: 'bmsah',
      sorter: true,
      width: '25%',
    }, {
      title: '受理时间',
      dataIndex: 'sasj',
      key: 'sasj',
      width: '15%',
      render: (text, record) => record.sasj && moment(record.sasj).format('YYYY-MM-DD HH:mm'),
    }, {
      title: '统一系统办理阶段',
      dataIndex: 'bajd',
      key: 'bajd',
      width: '15%',
    }, {
      title: '操作',
      key: 'operation',
      width: '8%',
      render: (text, record) => {
        if (!record.id) return;
        let txt = '';
        if (stage === 'SP') {
          if (record.spjd_cq === null) {
            txt = '抽取未开始'
          } else if (record.spjd_cq === '-1') {
            txt = '重新抽取中...'
          } else if (record.spjd_cq === '2') {
            txt = '缺少起诉书'
          } else if (record.spjd_cq === '3') {
            txt = '缺少刑事判决书'
          } else if (record.spjd_cq === '4') {
            txt = '缺少起诉书和刑事判决书'
          } else if (record.bxt_spjd_bjsj === null) {
            txt = '办理'
          } else {
            txt = '查看'
          }
        } else {
          if (record.cq === '0' || record.cq === null) {
            txt = '抽取未开始'
          } else if (record.cq === '-1') {
            txt = '重新抽取中...'
          } else if (record.sb === '0') {
            txt = '识别未开始'
          } else if (record.sb === '255') {
            txt = '缺少提请批准逮捕书'
          } else if (record.sb === '254') {
            txt = '缺少起诉意见书'
          } else if (record.sb === '2') {
            txt = '识别异常'
          } else if (record.sb === '-1') {
            txt = '重新解析中...'
          } else if (record.zt === '0') {
            txt = '审查项比对失败'
          } else if (record.zt === '-1') {
            txt = '重跑规则中...'
          } else if (record.status === 0) {
            txt = '办理'
          } else {
            txt = '查看'
          }
        }

        return (
          <p>
            <a onClick={() => {
              this.judgeState(record);
            }}>{txt}</a>
          </p>
        )
      },
    }];

    return columns;
  };

  handleTabChange = (key) => {
    switch (key) {
      case 'ZJ':
        this.setState({ dqjd: 'ZJ' }, () => {
          this.reloadTask();
        });
        break;
      case 'SP':
        this.setState({ dqjd: 'SP' }, () => {
          this.reloadTask();
        });
        break;
      default:
        break;
    }
  };

  reloadTask = () => {
    const { formValues } = this.state;

    this.loadData({
      // dqjd: dqjd,
      ...formValues,
      ajzt: {
        zt: formValues.zt,
      },
    })
  };

  getTableHeight = () => {
    const clientHeight = document.body.clientHeight;
    return clientHeight - 340;
  };

  //抽取事件
  onAjcqClick = () => {
    const { dispatch, form: {  validateFields } } = this.props;
    validateFields((err, fields) => {
      if(err) return;
      this.setState({
        extract: true
      }, () => {
        dispatch({
          type: 'znfz/ajcq',
          payload: {
            bmsah: fields['cqbmsah']
          }
        }).then(({ success, msg }) => {
          this.setState({
            extract: false
          });
          if (success) {
            message.success(msg)
          } else {
            message.error(msg)
          }
        })
      });
    })
  };
  handleCancel = () => {
    this.setState({ visible: false });
  };

  render() {
    const { loading, tabList, stage } = this.props;
    const { extract } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { list, pageSize, total, current } = this.props.znfz;
    let _list = [];
    if (list) {
      _list = list.map((d, idx) => {
        d.id = d.bmsah;
        d.rownumber = pageSize * (current - 1) + idx + 1;
        return d;
      });
    }
    const { visible } = this.state;
    const extra = (
      <Modal
        title="抽取案件"
        style={{ top: 300 }}
        onCancel={this.handleCancel}
        destroyOnClose
        footer={
          [<Button key="cq"
                   style={{ width: '94px', marginRight: '8px', borderRadius: '4px' }}
                   type="danger"
                   loading={loading}
                   onClick={this.onAjcqClick}>
            {extract ? '抽取中' : '抽取'}
          </Button>,
            <Button key="cancel"
                    style={{ width: '94px', marginRight: '8px', borderRadius: '4px' }}
                    type="primary"
                    loading={loading}
                    onClick={this.handleCancel}>
              返回
            </Button>]
        }
        visible={visible}>
        <Fragment>
          {
            stage === 'ZJ' || stage === 'GS' ?
              <Fragment >
                <Form.Item label="部门受案号：" style={{ display: 'flex', margin: '0 0 0 40px' }}>
                  {getFieldDecorator('cqbmsah',{
                    rules: [{required: true, message: '请输入部门受案号'}]
                  })(
                    <Input style={{ width: 220, display: 'inline-block', borderRadius: '4px' }} placeholder="部门受案号" />
                  )}
                </Form.Item>
              </Fragment>
              : ''}
        </Fragment>

      </Modal>
    )

    return (
      <PageHeaderLayout
        wrapperClassName={styles.default}
        showBreadcrumb={false}
        tabList={tabList}
        tabActiveKey={this.props.dqjd}
        onTabChange={this.handleTabChange}
        tabBarExtraContent={extra}
      >
        <Card className={styles.content}>
          <div className={'tableListOperator'}>
            {this.renderSearchForm()}
          </div>
          <StandardTable scroll={{y: this.getTableHeight()}}
                         selected={false}
                         selectedRows={[]}
                         loading={loading}
                         data={{
                           list: _list,
                           pagination: {
                             pageSize, total, current,
                             showTotal: (total, range) => `当前: ${range[0]}-${range[1]} 共 ${total} 条`,
                           },
                         }}
                         columns={this.getDataColumns()}
                         onChange={this.handleStandardTableChange}/>
          {/* <StandardTable scroll={{ y: this.getTableHeight() }}
            selected={false}
            selectedRows={[]}
            loading={loading}
            data={{
              list: _list,
              pagination: {
                pageSize, total, current,

              },
            }}
            columns={this.getDataColumns()}
            onChange={this.handleStandardTableChange} /> */}
        </Card>
      </PageHeaderLayout>
    );
  }
}
