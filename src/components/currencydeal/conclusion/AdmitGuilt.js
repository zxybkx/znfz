/**
 * 认罪认罚
 */
import React, {PureComponent, Fragment} from 'react';
import {Form, Tooltip, Icon, Modal, Select, Button, Switch, Input, message} from 'antd';
import TJTable from './Table';
import _ from 'lodash';
import {PROVENCE_SHORT_CODE} from '../../../constant';
import RzrfSelect from './RzrfSelect';
import NewFrameModal from 'lib/Frame/NewFrameModal';
import Reason from'./RzrfSelect/Reason';

const FormItem = Form.Item;

@Form.create()
export default class RzrfTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      rzrfData: [],
      people: [],
      isOldData: false,
    }
  }

  componentDidMount = () => {
    this.getRzrfData();
  };

  getRzrfData = () => {
    const {dispatch, match, znfz, stage, ysay} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: 'znfz/getRzrfConclusionRules',
      payload: {
        dwbm: PROVENCE_SHORT_CODE,
        ysay: ysay,
        stage: stage
      }
    }).then((rules) => {
      if (rules && rules.success && rules.data) {
        dispatch({
          type: 'znfz/getRzrfConclusionData',
          payload: {
            bmsah: id,
            ysay: ysay,
            stage: stage,
            dwbm: PROVENCE_SHORT_CODE,
          }
        }).then(({success, data}) => {
          if (success && data) {
            rules.data.forEach((item) => {
              item.jsondata && _.set(item.jsondata, 'value', {});
              _.map(data, (v, k) => {
                const filterData = _.find(v, o => o.name === item.gzmc);

                if (filterData && filterData.type == 'bool') {
                  if (filterData.value === '是') {
                    filterData && _.set(item.jsondata.value, k, true);
                  } else {
                    filterData && _.set(item.jsondata.value, k, false);
                  }
                } else if (filterData && filterData.value) {
                  filterData && _.set(item.jsondata.value, k, filterData.value);
                }
              });
            });
            const people = [];
            data && _.map(data, (v, k) => {
              people.push(k);
            });


            const xyrRzrfValue = _.find(rules.data, o => {
              if (o && o.jsondata && o.jsondata.name === '犯罪嫌疑人认罪认罚') {
                return o
              }
            });

            _.map(xyrRzrfValue && xyrRzrfValue.jsondata.value, (o, k) => {
              if (o.rzrf) {
                this.setState({
                  isOldData: false
                })
              } else {
                this.setState({
                  isOldData: true
                })
              }
            });

            this.setState({
              rzrfData: rules.data,
              people: people,
            })
          }
        });
      }
    });
  };


  renderDynamicCell = (row, object) => {
    const {getFieldDecorator, getFieldsValue} = this.props.form;
    const {jsondata: {name, type, value}} = row;
    const {match, znfz: {ajxx, docTree}, stage} = this.props;
    const {isOldData} = this.state;
    const {params: {id}} = match;
    let initialValue = row.jsondata.value[object];
    const values = getFieldsValue();

    if (name === '犯罪嫌疑人认罪认罚') {
      if (isOldData) {
        return (
          <FormItem>
            {getFieldDecorator(`${object}-${name}`, {
              initialValue: initialValue,
              valuePropName: 'checked'
            })(
              <Switch checkedChildren="是"
              defaultChecked
                      unCheckedChildren="否"
                //onChange={(checked) => this.onChange(checked)}
              />
            )}
          </FormItem>
        )
      } else {
        const reasonProps = {
          getFieldDecorator,
          object,
          name,
          initialValue,
          isTrue: values[`${object}-${name}`],
        };
        return (
          <Reason {...reasonProps}/>
        );
      }
    }

    if (name === '未就附带民事诉讼赔偿等事项达成调解或者和解协议') {
      const rzrfProps = {
        getFieldDecorator,
        object,
        name,
        initialValue,
        onRzrfChange: this.onRzrfChange,
        isTrue: values[`${object}-${name}`],
      };
      return (
        <RzrfSelect {...rzrfProps}/>
      )
    }

    if (type === 'bool') {
      return (
        <FormItem>
          {getFieldDecorator(`${object}-${name}`, {
            initialValue: initialValue,
            valuePropName: 'checked'
          })(
            <Switch checkedChildren="是"
                    unCheckedChildren="否"
                    onChange={(checked) => {
                      this.onRzrfChange(name, object, checked)
                    }}
            />
          )}
        </FormItem>
      );
    } else {
      const context = process.env.NODE_ENV === 'production' ? '/cm' : '';
      const base = stage === 'ZJ' ? 'zcjd' : 'gsjd';
      const itemData = {};
      _.set(itemData, 'wsmbmc', row.gzmc);
      _.set(itemData, 'bgr', object);
      _.set(itemData, 'stage', stage);
      _.set(itemData, 'docTree', docTree);
      _.set(itemData, 'ajxx', ajxx);
      _.set(itemData, 'rightSource', `${context}/currencydeal/${ajxx.bmsah}/document`);

      return (
        <FormItem>
          {getFieldDecorator(`${object}-${name}`, {
            initialValue: initialValue,
          })(
            <NewFrameModal title="文书制作"
                           src={`${context}/currencydeal/${id}/document`}
                           params={itemData}
                           icon="form">
              <a>{initialValue}</a>
            </NewFrameModal>
          )}
        </FormItem>
      )
    }
  };


  onRzrfChange = (field, name, value) => {
    const {dispatch, match, ysay, znfz, stage} = this.props;
    const {params: {id}} = match;
    const {validateFields} = this.props.form;
    validateFields((errors, values) => {
      const payload = [];
      const itemData = {};
      const rzrfJsondata = {};
      _.set(itemData, 'ysay', ysay);
      _.set(itemData, 'bmsah', id);
      _.set(itemData, 'mergekey', name);
      _.set(itemData, 'tysah', znfz.ajxx.tysah);
      _.set(itemData, 'stage', stage);
      _.map(values, (v, k) => {
        if (_.startsWith(k, name)) {
          const key = _.split(k, '-');
          const specialLabel = ['未就附带民事诉讼赔偿等事项达成调解或者和解协议', '未就附带民事诉讼赔偿等事项达成调解或者和解协议选项', '犯罪嫌疑人认罪认罚', '未适用认罪认罚原因'];
          if (!_.includes(specialLabel, key[1])) {
            if (typeof(v) === 'boolean') {
              if (v) {
                _.set(rzrfJsondata, key[1], '是')
              } else {
                _.set(rzrfJsondata, key[1], '否')
              }
            } else {
              _.set(rzrfJsondata, key[1], v)
            }
          } else if (key[1] === '未就附带民事诉讼赔偿等事项达成调解或者和解协议') {
            _.set(rzrfJsondata, '未就附带民事诉讼赔偿等事项达成调解或者和解协议', values[`${name}-未就附带民事诉讼赔偿等事项达成调解或者和解协议`] ? {
              sfwpc: '是',
              qqsfhl: values[`${name}-未就附带民事诉讼赔偿等事项达成调解或者和解协议选项`] && values[`${name}-未就附带民事诉讼赔偿等事项达成调解或者和解协议选项`]
            } : {sfwpc: '否'});
          } else if (key[1] === '犯罪嫌疑人认罪认罚') {
            _.set(rzrfJsondata, '犯罪嫌疑人认罪认罚', values[`${name}-犯罪嫌疑人认罪认罚`] ? {
              rzrf: '是'
            } : {
              rzrf: '否',
              wsyyy: ''
            })
          }
        }
      });

      //onChange延迟替换
      if (value !== undefined) {
        if (field !== '未就附带民事诉讼赔偿等事项达成调解或者和解协议' && field !== '犯罪嫌疑人认罪认罚') {
          if (typeof(value) === 'boolean') {
            if (value) {
              _.set(rzrfJsondata, field, '是');
              _.set(itemData, 'rzrfJsondata', rzrfJsondata);
            } else {
              _.set(rzrfJsondata, field, '否');
              _.set(itemData, 'rzrfJsondata', rzrfJsondata);
            }
          } else {
            _.set(rzrfJsondata, field, value);
            _.set(itemData, 'rzrfJsondata', rzrfJsondata)
          }
        } else if (field === '未就附带民事诉讼赔偿等事项达成调解或者和解协议') {
          if (value) {
            const info1 = {
              sfwpc: '是',
              qqsfhl: ''
            };
            _.set(rzrfJsondata, field, info1);
            _.set(itemData, 'rzrfJsondata', rzrfJsondata);
          } else {
            const info2 = {sfwpc: '否'};
            _.set(rzrfJsondata, field, info2);
            _.set(itemData, 'rzrfJsondata', rzrfJsondata);
          }
        } else if (field === '犯罪嫌疑人认罪认罚') {
          if (value) {
            const info1 = {
              rzrf: '是',
            };
            _.set(rzrfJsondata, field, info1);
            _.set(itemData, 'rzrfJsondata', rzrfJsondata);
          } else {
            const info2 = {sfwpc: '否', wsyyy: ''};
            _.set(rzrfJsondata, field, info2);
            _.set(itemData, 'rzrfJsondata', rzrfJsondata);
          }
        }
      }

      payload.push(itemData);
      dispatch({
        type: `znfz/getRzrfConclusionByRules`,
        payload: payload
      }).then(({success, data}) => {
        const rzrfValue = data && data.rzrf_jsondata.rzrfsJsondata['未就附带民事诉讼赔偿等事项达成调解或者和解协议'];
        const rzrfDefaultValue = rzrfValue && rzrfValue.qqsfhl;
        this.props.form.setFields({
          [`${name}-未就附带民事诉讼赔偿等事项达成调解或者和解协议选项`]: {value: rzrfDefaultValue},
        });
      });
    });
  };


  renderCell = () => {
    const {rzrfData} = this.state;
    const columns = [{
      title: '',
      colSpan: 2,
      width: 160,
      dataIndex: 'yjfl',
      render: (value, row, index) => {  //dataIndex, 那一行， 索引
        const obj = {
          children: value,
          props: {},
        };
        const start = _.findIndex(rzrfData, function (o) {
          return o.yjfl === row.yjfl;
        });
        const end = _.findLastIndex(rzrfData, function (o) {
          return o.yjfl === row.yjfl;
        });

        if (index === start) {
          obj.props.rowSpan = end - start + 1;
        }
        if (index > start && index <= end) {
          obj.props.rowSpan = 0;
        }
        return obj;
      },
    }, {
      title: '规则',
      dataIndex: 'gz',
      colSpan: 0,
      width: 340,
      render: (value, row) => {
        const obj = {
          children: <div style={{textAlign: 'left', width: '100%'}}>
            {row && row.jsondata && row.jsondata.name}
            {row && row.jsondata && row.jsondata.type !== 'bool' ?
              <Tooltip title="请点击单元格填写内容">
                <Icon type="info-circle-o" style={{marginLeft: '5px'}}/>
              </Tooltip> : null
            }
          </div>,
          props: {},
        };
        return obj;
      }
    }];

    _.uniq(this.state.people).map((o) => {
      const columnsItem = {};
      _.set(columnsItem, 'title', o);
      _.set(columnsItem, 'dataIndex', o);
      _.set(columnsItem, 'width', 320);
      _.set(columnsItem, 'render', (value, row) => {
        return this.renderDynamicCell(row, o);
      });
      columns.push(columnsItem);
    });

    for (let i = 0; i < 5 - this.state.people.length; i++) {
      const columnsItem = {};
      _.set(columnsItem, 'title', '');
      _.set(columnsItem, 'dataIndex', `${i}`);
      _.set(columnsItem, 'width', 320);
      columns.push(columnsItem);
    }
    return columns;
  };


  getFormValue = (name) => {
    const {validateFields} = this.props.form;
    let rzrfJsondata = {};
    validateFields((errors, values) => {
      _.map(values, (v, k) => {
        if (_.startsWith(k, name)) {
          const key = _.split(k, '-');
          const specialLabel = ['未就附带民事诉讼赔偿等事项达成调解或者和解协议', '未就附带民事诉讼赔偿等事项达成调解或者和解协议选项', '犯罪嫌疑人认罪认罚', '未适用认罪认罚原因'];
          if (!_.includes(specialLabel, key[1])) {
            if (typeof(v) === 'boolean') {
              if (v) {
                _.set(rzrfJsondata, key[1], '是')
              } else {
                _.set(rzrfJsondata, key[1], '否')
              }
            } else {
              _.set(rzrfJsondata, key[1], v)
            }
          } else if (key[1] === '未就附带民事诉讼赔偿等事项达成调解或者和解协议') {
            _.set(rzrfJsondata, '未就附带民事诉讼赔偿等事项达成调解或者和解协议', values[`${name}-未就附带民事诉讼赔偿等事项达成调解或者和解协议`] ? {
              sfwpc: '是',
              qqsfhl: values[`${name}-未就附带民事诉讼赔偿等事项达成调解或者和解协议选项`] && values[`${name}-未就附带民事诉讼赔偿等事项达成调解或者和解协议选项`]
            } : {sfwpc: '否'});
          } else if (key[1] === '犯罪嫌疑人认罪认罚') {
            _.set(rzrfJsondata, '犯罪嫌疑人认罪认罚', values[`${name}-犯罪嫌疑人认罪认罚`] ? {rzrf: '是'} : {
              rzrf: '否',
              wsyyy: values[`${name}-未适用认罪认罚原因`] && values[`${name}-未适用认罪认罚原因`]
            })
          }
        }
      });
    });
    return rzrfJsondata;
  };


  dealSycxData = () => {
    const {match, znfz, ysay, stage} = this.props;
    const {people} = this.state;
    const {params: {id}} = match;
    const payload = [];
    people.map((name, i) => {
      const itemData = {};
      _.set(itemData, 'ysay', ysay);
      _.set(itemData, 'stage', stage);
      _.set(itemData, 'bmsah', id);
      _.set(itemData, 'tysah', znfz.ajxx.tysah);
      _.set(itemData, 'mergekey', name);
      payload.push(itemData);
    });
    return payload;
  };


  saveRzrfData() {
    const {dispatch, match, znfz, ysay, stage} = this.props;
    const {params: {id}} = match;
    const {validateFields} = this.props.form;
    const payload = [];
    const rzrfJsondata = {};
    _.uniq(this.state.people).map((o) => {
      const itemData = {};
      _.set(itemData, 'ysay', ysay);
      _.set(itemData, 'stage', stage);
      _.set(itemData, 'bmsah', id);
      _.set(itemData, 'tysah', znfz.ajxx.tysah);
      _.set(itemData, 'mergekey', o);
      _.set(itemData, 'rzrfJsondata', this.getFormValue(o));
      payload.push(itemData);
    });

    validateFields((errors, values) => {
      if (errors) {
        return
      }

      dispatch({
        type: 'znfz/saveRzrfConclusion',
        payload: payload
      }).then((result) => {
        message.success('保存成功');
        dispatch({
          type: 'znfz/deleteStepList',
          payload: payload
        }).then(({success}) => {
          const payload = this.dealSycxData();
          dispatch({
            type: 'znfz/getSycxs',
            payload: payload
          }).then((response) => {
            if (response) {
              const {success, data} = response;
              if (data && success) {
                const json = data.sycx_jsondata;
                if (json) {
                  dispatch({
                    type: 'znfz/sendStepList',
                    payload: {
                      bmsah: id,
                      jllc: ['审查意见', '认罪认罚']
                    }
                  });
                  this.props.onChangeState && this.props.onChangeState('适用程序', ['审查意见', '认罪认罚', '适用程序']);
                } else {
                  dispatch({
                    type: 'znfz/sendStepList',
                    payload: {
                      bmsah: id,
                      jllc: ['审查意见', '认罪认罚', '文书制作']
                    }
                  });
                  this.props.onChangeState && this.props.onChangeState('文书制作', ['审查意见', '认罪认罚', '文书制作']);
                }
              }
            }
          })
        })
      }).catch((error) => {
        message.warning('保存失败');
      })
    });

  };


  renderTableFooter = () => {
    const {znfz: {ajxx}} = this.props;
    return (
      <Button icon={'save'}
              type={'primary'}
              disabled={ajxx.ajzt && ajxx.ajzt.zt === 9}
              onClick={() => this.saveRzrfData()}
      >下一步</Button>
    )
  };

  render() {
    const rzrfColumns = this.renderCell();
    return (
      <div>
        <TJTable columns={rzrfColumns}
                 list={this.state.rzrfData}
                 title='认罪认罚'
                 footer={this.renderTableFooter}
                 scroll={{x: (rzrfColumns.length - 2) * 320 + 500, y: 600}}
        />
      </div>
    );
  }
}
