import React, {PureComponent, Fragment} from 'react';
import {Form, Tooltip, Icon, Modal, Select, Button, Switch, Input, message} from 'antd';
import TJTable from './Table';
import _ from 'lodash';
import ConclusionSelect from './ConclusionSelect';
import FrameModal from 'lib/Frame/FrameModal';
import moment from 'moment';
import {PROVENCE_SHORT_CODE} from '../../../constant';
import styles from './index.less';
import hammer from './Icon/hammer.png';
import Time from 'components/xDeal/Time';

const FormItem = Form.Item;
const Option = Select.Option;

@Form.create()
export default class ScyjTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      people: [],
      lxjydata: [],
      conclusion: [],
      djl: [],
      xjl: [],
      currentBgr: '',
      lxjgPlaceholder: '',
      nextStepDisable: false,
    }
  }

  componentDidMount() {
    this.getConclusionData();
    const {dispatch, match, znfz,ysay, stage} = this.props;
    const {params: {id}} = match;
    dispatch({//通版
    type: 'znfz/tbflg',
    payload: {
      bmsah: id,
     },
    });
  }


  getConclusion(people) {
    const {dispatch, match, ysay, stage} = this.props;
    const {validateFields} = this.props.form;

    const {params: {id}} = match;
    validateFields((errors, values) => {
      const payload = [];
      people.map((value) => {
        const itemData = {};
        const jsondata = {};
        _.set(itemData, 'ysay', ysay);
        _.set(itemData, 'bmsah', id);
        _.set(itemData, 'mergekey', value);
        _.map(values, (v, k) => {
          if (_.startsWith(k, value)) {
            const key = _.split(k, '-');
            if (key[1] !== 'jldata' && key[1] !== 'xjldata') {
              if (typeof(v) === 'boolean') {
                if (v) {
                  _.set(jsondata, key[1], '是');
                } else {
                  _.set(jsondata, key[1], '否');
                }
              } else {
                _.set(jsondata, key[1], v);
              }
            }
          }
        });
        _.set(itemData, 'jsondata', jsondata);
        _.set(itemData, 'stage', stage);
        payload.push(itemData);
      });

      dispatch({
        type: 'znfz/getNewConclusion',
        payload: payload
       }).then((result) => {
        if (result && result.success) {
          const conclusionData = _.cloneDeepWith(this.state.conclusion);
          result.data && result.data.map((item) => {
            const index = _.findIndex(conclusionData, (o) => {
              return o.mergekey === item.mergekey
            });
            if (index >= 0) {
              conclusionData[index] = item;
            } else {
              conclusionData.push(item);
            }
          });
          this.setState({
            conclusion: conclusionData
          })
        }
      })


    })
  };


  getConclusionData = () => {
    const {dispatch, match, znfz, ysay, stage} = this.props;
    const {params: {id}} = match;
    const specialGz = ['持枪支、管制刀具或者其他凶器伤害他人', '因实施其他违法活动而故意伤害他人身体', '伤害他人身体要害部位', '事先有预谋', '雇佣他人实施伤害行为', '报复伤害他人', '造成两处以上重伤或轻伤', '手段特别残忍', '犯罪嫌疑人具有防卫情节', '犯罪嫌疑人具有紧急避险情节', '因民间矛盾引发', '被害人有过错或者激化矛盾对引发犯罪有责任', '被害人残疾等级'];
    const filterArr = [];
    dispatch({
      type: 'znfz/getConclusionRules',
      payload: {
        bmsah: id,
        dwbm: PROVENCE_SHORT_CODE,
        ysay: ysay,
        stage: stage
      }
    }).then((rules) => {
      if (rules && rules.success && rules.data) {
        dispatch({
          type: 'znfz/getConclusionData',
          payload: {
            bmsah: id,
            ysay: ysay,
            stage: stage,
            dwbm: PROVENCE_SHORT_CODE,
          }
        }).then(({success, data, message}) => {
          if(_.isEmpty(data)) {
            this.setState({
              nextStepDisable: true
            })
          } else {
            this.setState({
              nextStepDisable: false
            })
          }
          if (_.startsWith(message, '请返回')) {
            Modal.warning({
              title: message,
              okText: '确定'
            })
          }
          rules.data.forEach((item) => {
            item.jsondata && _.set(item.jsondata, 'value', {});
            _.map(data, (v, k) => {
              const filterData = _.find(v, o => {
                if (o && o.name) {
                  return o.name === item.gzmc
                }
              });
              if (filterData && filterData.type === 'bool') {
                if (filterData.value === '是') {
                  filterData && _.set(item.jsondata.value, `${k.replace(/\./g, "·")}`, true);
                } else {
                  filterData && _.set(item.jsondata.value, `${k.replace(/\./g, "·")}`, false);
                }
              } else {
                filterData && _.set(item.jsondata.value, `${k.replace(/\./g, "·")}`, filterData.value);
              }

              ysay === '故意伤害罪' && _.map(specialGz,(i) => {
                if(item.gzmc === i && (item.jsondata.value[k] === false || _.isEmpty(item.jsondata.value))) {
                  filterArr.push(item);
                }
              });
            });
          });

          const finalData = _.xor(rules.data, filterArr);

          const people = [];
          data && _.map(data, (v, k) => {
            people.push(k.replace(/\./g, "·"));
          });
          dispatch({
            type: 'znfz/getConclusionOptions',
            payload: {
              dwbm: PROVENCE_SHORT_CODE,
              ysay: ysay,
              stage: stage
            }
          }).then((options) => {
            if (options && options.success && options.data) {
              const djlOptions = _.keys(options.data);
              if (stage === 'ZJ' || stage === 'GS' ) {
                const conclusionCell = {};
                _.set(conclusionCell, 'yjfl', '结论');
                _.set(conclusionCell, 'data', {
                  djl: djlOptions
                });
                finalData.push(conclusionCell);

                this.setState({
                  data: finalData,
                })
              } else {
                // const qsyj = _.find(finalData, o => o.gzmc === '起诉意见');
                // _.set(qsyj, 'jlData', {djl: djlOptions});
                // const suggest = _.filter(finalData, o => {
                //   if (o) {
                //     // return o.jsondata.name !== '量刑建议'
                //   }
                // });
                // const lxjyData = _.filter(finalData, o => {
                //   if (o) {
                //     // return o.jsondata.name === '量刑建议'
                //   }
                // });

                this.setState({
                  lxjydata: lxjyData,
                  data: suggest,
                })
              }
              this.setState({
                people,
                djl: djlOptions,
                xjl: options.data
              });
              this.getConclusion(people);
            }
          });
        });
      }
    });
  };


  save = (val, currentType, path) => {
    const {setFieldsValue} = this.props.form;
    setFieldsValue && setFieldsValue({
      [path]: val.content
    })
  };


  renderDynamicCell = (row, object) => {
    const {data} = this.state;
    const {fzss} = this.props;
    const {getFieldDecorator} = this.props.form;
    const {jsondata: {name, type, defaultValue}} = row;
    const options = defaultValue ? defaultValue : [];
    let initialValue = row.jsondata.value[object];
    if (type === 'cishu') {
      initialValue = _.orderBy(initialValue, v => _.toNumber(v.replace(/[^0-9]/ig, '')))
    }
    if (name && name === '具有法定从宽处罚情节') {
      const xszr = _.get(_.find(data, o => o.gzmc === '犯罪嫌疑人的刑事责任能力').jsondata.value, object);
      const zs = _.get(_.find(data, o => o.gzmc === '犯罪嫌疑人系75周岁以上的人').jsondata.value, object);
      const tb = _.get(_.find(data, o => o.gzmc === '坦白或自首').jsondata.value, object);
      const lg = _.get(_.find(data, o => o.gzmc === '立功').jsondata.value, object);
      const zf = _.get(_.find(data, o => o.gzmc === '共同犯罪') && 
      _.find(data, o => o.gzmc === '共同犯罪').jsondata.value, object);

      initialValue = !xszr || zs || tb !== '否' || lg || !zf
    }

    if (name && name === '起诉意见') {
      const {conclusion, xjl} = this.state;
      const initialValue = _.find(conclusion, o => o.mergekey === object);
      const {jlData} = row;
      const xjlProps = {
        getFieldDecorator,
        object,
        initialValue: initialValue && initialValue.jsondata && initialValue.jsondata.xjl ? initialValue.jsondata.xjl : '',
        djl: initialValue && initialValue.jsondata && initialValue.jsondata.djl ? initialValue.jsondata.djl : '',
        xjlOptions: xjl,
        detailInitialValue: initialValue && initialValue.jsondata && initialValue.jsondata.detail ? initialValue.jsondata.detail : '',
      };

      return (
        <Fragment>
          <FormItem key={name}>
            {getFieldDecorator(`${object}-jldata`, {
              initialValue: initialValue && 
              initialValue.jsondata && initialValue.jsondata.djl ? initialValue.jsondata.djl : ''
            })(
              <Select
                style={{width: '200px'}}
                onChange={(value) => {
                  this.onDJLChange(value, object)
                }}
              >
                {
                  jlData.djl && jlData.djl.map((o) => {
                    return (
                      <Option key={o}>
                        <Tooltip placement='left' title={o} tooltip>{o}</Tooltip>
                      </Option>
                    )
                  })
                }
              </Select>
            )}
          </FormItem>
          <FormItem style={{marginLeft: 55}} key={`${name}-xjl`}>
            <ConclusionSelect {...xjlProps}/>
          </FormItem>
        </Fragment>
      )
    }

    if (name && name === '量刑结果') {
      const {znfz: {ajxx}} = this.props;
      const lx = require('../../../common/tools.json').lx;
      const params = {
        bmsah: ajxx.bmsah,
        tysah: ajxx.tysah,
        ysay: ajxx.ysay_aymc,
        bgr: object
      };
      const before = (
        <FrameModal title="量刑辅助"
                    src={`/lxfz/${lx[ajxx.ysay_aymc]}`}
                    params={params}
                    onClose={() => {
                      (!ajxx.ajzt || (ajxx.ajzt && ajxx.ajzt.zt !== 9)) && this.onCloseLX()
                    }}
                    icon="api">
          <Tooltip placement="top" 
          title='处理量刑结果' 
          className={this.props.znfz.tbflg.tbflag === 'T'?styles.generalEdit:''}>
            <Button onClick={() => {
              this.setState({currentBgr: object});
              (!ajxx.ajzt || (ajxx.ajzt && ajxx.ajzt.zt !== 9)) 
            }}
                    size={'small'}
                    shape="circle"
            >
              <img src={hammer} style={{width: '25px', height: '25px'}}/>
            </Button>
          </Tooltip>
        </FrameModal>);

      return (
        <Fragment>
          <FormItem className={styles.input} key={name}>
            {getFieldDecorator(`${object}-${name}`, {
              initialValue: initialValue
            })(
              <Input style={{width: '100%', marginTop: 3}}
                //onBlur={() => this.onChange(name, object)}
                     addonBefore={before}
                     placeholder={this.state.lxjgPlaceholder}
              />
            )}
          </FormItem>
        </Fragment>
      )
    }

    if (name && name === '犯罪嫌疑人的刑事责任能力') {
      const xszrInitialvalue = initialValue === '犯罪嫌疑人具有完全刑事责任能力' ? '完全' : initialValue === '犯罪嫌疑人具有限制刑事责任能力' ? '限制' : '无';
      return (
        <FormItem key={name}>
          {getFieldDecorator(`${object}-${name}`, {
            initialValue: xszrInitialvalue
          })(
            <Select style={{width: 200}}
                    onChange={(value) => this.onChange(name, object, value)}
            >
              <Option value="完全">完全</Option>
              <Option value="限制">限制</Option>
              <Option value="无">无</Option>
            </Select>
          )}
        </FormItem>
      );
    }

    // bool - switch, cishu - 下拉选择框, 其他 - 字符串
    switch (type) {
      case 'bool':
        return (
          <FormItem key={name}>
            {getFieldDecorator(`${object}-${name}`, {
              initialValue: initialValue,
              valuePropName: 'checked'
            })(
              <Switch checkedChildren="是"
                      unCheckedChildren="否"
                      onChange={(checked) => this.onChange(name, object, checked)}
              />
            )}
          </FormItem>
        );
        break;
      case 'cishu':
        return (
          <FormItem key={name}>
            {getFieldDecorator(`${object}-${name}`, {
              initialValue: initialValue
            })(
              <Select mode="multiple"
                      disabled
                      style={{width: '80%'}}
                      onChange={(value) => this.onChange(name, object, value)}
              >
                {
                  fzss && fzss.map((o) => {
                    const aqzy = o.content && _.get(o.content, '经审查认定的事实');
                    if (o && o.title) {
                      return (
                        <Option key={o.title}>
                          <Tooltip placement='top' title={aqzy} tooltip>
                            {o.title}
                          </Tooltip>
                        </Option>
                      )
                    }
                  })
                }
              </Select>
            )}
          </FormItem>
        );
        break;
      case 'select':
        return (
          <FormItem key={name}>
            {getFieldDecorator(`${object}-${name}`, {
              initialValue: initialValue
            })(
              <Select style={{width: 200}}
                      onChange={(value) => this.onChange(name, object, value)}
              >
                {
                  options && options.map(o => <Option key={o}>{o}</Option>)
                }
              </Select>
            )}
          </FormItem>
        );
        break;
      case 'datetime':
        // if (!_.isEmpty(initialValue)) {
        //   //initialValue = moment(initialValue, 'YYYY-MM-DD').format('YYYY年MM月DD日');
        // }
        return (
          <FormItem key={name}>
            {getFieldDecorator(`${object}-${name}`, {
              initialValue: initialValue,
              rules: [{required: true, message: '请输入出生日期'}]
            })(
              <Time
                item={{}}
                initialValue={initialValue}
                onSave={(val) => this.save(val, undefined, `${object}-${name}`)}
                type={'day'}
              />
            )}
          </FormItem>
        );
        break;
      case 'enum' :
        return (
          <FormItem key={name}>
            {getFieldDecorator(`${object}-${name}`, {
              initialValue: initialValue
            })(
              <Select
                mode="tags"
                style={{width: 200}}
                onChange={(value) => this.onChange(name, object, value)}
              />
            )}
          </FormItem>
        );
        break;
      default:
        return (
          <FormItem key={name}>
            {getFieldDecorator(`${object}-${name}`, {
              initialValue: initialValue,
              rules: [{required: true, message: `请输入${name}`}]
            })(
              <Input style={{width: '60%'}}
                     onBlur={() => this.onChange(name, object)}
              />
            )}
          </FormItem>
        );
    }
  };


  renderConclusionCell = (data, object) => {
    const {getFieldDecorator} = this.props.form;
    const {conclusion, xjl} = this.state;

    const initialValue = _.find(conclusion, o => o.mergekey === object);
    const xjlProps = {
      getFieldDecorator,
      object,
      initialValue: initialValue && initialValue.jsondata && initialValue.jsondata.xjl ? initialValue.jsondata.xjl : '',
      djl: initialValue && initialValue.jsondata && initialValue.jsondata.djl ? initialValue.jsondata.djl : '',
      xjlOptions: xjl
    };
    return (
      <Fragment>
        <FormItem key={'djl'}>
          {getFieldDecorator(`${object}-jldata`, {
            initialValue: initialValue && initialValue.jsondata && initialValue.jsondata.djl ? initialValue.jsondata.djl : ''
          })(
            <Select
              style={{width: '200px'}}
              onChange={(value) => {
                this.onDJLChange(value, object)
              }}
            >
              {
                data.djl && data.djl.map((o) => {
                  return (
                    <Option key={o}>
                      <Tooltip placement='left' title={o} tooltip>{o}</Tooltip>
                    </Option>
                  )
                })
              }
            </Select>
          )}
        </FormItem>
        <FormItem style={{marginLeft: 55}} key={'xjl'}>
          <ConclusionSelect {...xjlProps}/>
        </FormItem>
      </Fragment>

    );
  };


  renderCell = () => {//审查结论-审查意见
    const {stage} = this.props;
    const columns = [{
      title: '',
      colSpan: 2,
      width: '',
      dataIndex: 'yjfl',
      render: (value, row, index) => {
        const obj = {
          children: value,
          props: {},
        };
        if (value === '结论') {
          obj.props.colSpan = 1;
        } else {
          const start = _.findIndex(this.state.data, function (o) {
            return o.yjfl === row.yjfl;
          });
          const end = _.findLastIndex(this.state.data, function (o) {
            return o.yjfl === row.yjfl;
          });

          if (index === start) {
            obj.props.rowSpan = end - start + 1;
          }
          if (index > start && index <= end) {
            obj.props.rowSpan = 0;
          }
        }
        return obj;
      }
    }, {
      title: '规则',
      dataIndex: 'gz',
      colSpan: 0,
      width: 340,
      render: (value, row) => {
        const ruleRequiredStyle = {
          color: 'red',
          fontSize: '19px',
        };
        const obj = {
          children: <div style={{textAlign: 'left', width: '100%'}}>
            {row && row.jsondata &&
             (row.jsondata.name !== '量刑结果' &&
              (row.jsondata.type === 'string' || row.jsondata.type === 'datetime')) ?
              <span style={ruleRequiredStyle}>*</span> : null}
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

    _.uniq(this.state.people && this.state.people).map((o) => {
      const columnsItem = {};
      _.set(columnsItem, 'title', o);
      _.set(columnsItem, 'dataIndex', o);
      _.set(columnsItem, 'width', 320);
      _.set(columnsItem, 'render', (value, row) => {
        if (stage === 'ZJ' || stage === 'GS' ) {
          if (row.yjfl === '结论') {
            return this.renderConclusionCell(row.data, o);
          } else {
            return this.renderDynamicCell(row, o);
          }
        } 
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


  onCloseLX = () => {
    const {dispatch, match} = this.props;
    const {params: {id}} = match;
    const {currentBgr} = this.state;
    const {setFieldsValue} = this.props.form;
    dispatch({
      type: 'znfz/getLxtjjg',
      payload: {
        bmsah: id,
        mergekey: currentBgr
      }
    }).then(({data, success}) => {
      if (data && success) {
        if (data.lxqj) {
          setFieldsValue({
            [`${currentBgr}-量刑结果`]: data.lxqj
          });
        } else {
          message.warning('请保存量刑结果');
        }
      }
    })
  };


  onChange = (field, name, value) => {
    const {znfz: {ajxx}, dispatch, match, ysay, znfz, stage} = this.props;
    const {validateFieldsAndScroll, setFieldsValue, getFieldValue} = this.props.form;
    const {params: {id}} = match;

    const xszr = getFieldValue(`${name}-犯罪嫌疑人的刑事责任能力`);
    const zs = getFieldValue(`${name}-犯罪嫌疑人系75周岁以上的人`);
    const tb = getFieldValue(`${name}-坦白或自首`);
    const lg = getFieldValue(`${name}-立功`);
    const zf = getFieldValue(`${name}-共同犯罪`);

    if (field !== '量刑结果' && (!ajxx.ajzt || (ajxx.ajzt && ajxx.ajzt.zt !== 9))) {
      setFieldsValue({
        [`${name}-量刑结果`]: ''
      });
      this.setState({
        lxjgPlaceholder: '审查意见发生变化，请重新确认量刑'
      })
    }


    switch (field) {
      case '犯罪嫌疑人的刑事责任能力':
        if (!value) {
          setFieldsValue({
            [`${name}-具有法定从宽处罚情节`]: true
          });
        } else {
          setFieldsValue({
            [`${name}-具有法定从宽处罚情节`]: zs || tb !== '否' || lg || !zf
          });
        }
        break;
      case '犯罪嫌疑人系75周岁以上的人':
        if (value) {
          setFieldsValue({
            [`${name}-具有法定从宽处罚情节`]: true
          });
        } else {
          setFieldsValue({
            [`${name}-具有法定从宽处罚情节`]: !xszr || tb !== '否' || lg || !zf
          });
        }
        break;
      case '坦白或自首':
        if (value !== '否') {
          setFieldsValue({
            [`${name}-具有法定从宽处罚情节`]: true
          });
        } else {
          setFieldsValue({
            [`${name}-具有法定从宽处罚情节`]: !xszr || zs || lg || !zf
          });
        }
        break;
      case '立功':
        if (value) {
          setFieldsValue({
            [`${name}-具有法定从宽处罚情节`]: true
          });
        } else {
          setFieldsValue({
            [`${name}-具有法定从宽处罚情节`]: !xszr || tb !== '否' || zs || !zf
          });
        }
        break;
      case '共同犯罪':
        if (!value) {
          setFieldsValue({
            [`${name}-具有法定从宽处罚情节`]: true
          });
        } else {
          setFieldsValue({
            [`${name}-具有法定从宽处罚情节`]: !xszr || tb !== '否' || zs || lg
          });
        }
        break;
      default:
        break;
    }

    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return
      }
      const payload = [];
      const itemData = {};
      const jsondata = {};
      _.set(itemData, 'ysay', ysay);
      _.set(itemData, 'bmsah', id);
      _.set(itemData, 'mergekey', name);
      _.set(itemData, 'tysah', znfz.ajxx.tysah);
      _.set(itemData, 'stage', stage);
      _.map(values, (v, k) => {
        if (_.startsWith(k, name)) {
          const key = _.split(k, '-');
          if (key[1] !== 'jldata' && key[1] !== 'xjldata') {
            if (typeof(v) === 'boolean') {
              if (v) {
                _.set(jsondata, key[1], '是');
              } else {
                _.set(jsondata, key[1], '否');
              }
            } else {
              _.set(jsondata, key[1], v);
            }
          }
        }
      });
      if (value !== undefined) {
        if (typeof(value) === 'boolean') {
          if (value) {
            _.set(jsondata, field, '是');
            _.set(itemData, 'jsondata', jsondata);
          } else {
            _.set(jsondata, field, '否');
            _.set(itemData, 'jsondata', jsondata);
          }
        } else {
          _.set(jsondata, field, value);
          _.set(itemData, 'jsondata', jsondata);
        }
      } else {
        _.set(itemData, 'jsondata', jsondata);
      }

      payload.push(itemData);

      dispatch({
        type: 'znfz/getConclusionByRules',
        payload: payload
      }).then((result) => {
        if (result.success && result.data) {
          const conclusionData = _.cloneDeepWith(this.state.conclusion);
          result.data && result.data.map((item) => {
            _.remove(conclusionData, (o) => {
              return o.mergekey === item.mergekey
            });
            conclusionData.push(item);
          });
          setFieldsValue({
            [`${name}-jldata`]: result.data && result.data[0].jsondata && result.data[0].jsondata.djl,
            [`${name}-xjldata`]: result.data && result.data[0].jsondata && result.data[0].jsondata.xjl,
          });
          this.setState({
            conclusion: conclusionData
          })
        }
      });
    });
  };


  onDJLChange = (value, people) => {
    const {xjl} = this.state;
    const {znfz: {ajxx}} = this.props;
    const {setFieldsValue} = this.props.form;
    const conclusionData = _.cloneDeepWith(this.state.conclusion);

    if (!ajxx.ajzt || (ajxx.ajzt && ajxx.ajzt.zt !== 9)) {
      setFieldsValue({[`${people}-量刑结果`]: ''});
      this.setState({
        lxjgPlaceholder: '审查意见发生变化，请重新确认量刑'
      });
    }

    _.remove(conclusionData, (o) => {
      return o.mergekey === people
    });
    const item = {};
    _.set(item, 'jsondata', {
      djl: value,
      xjl: _.get(xjl, value)[0]
    });
    _.set(item, 'mergekey', people);
    conclusionData.push(item);
    this.setState({
      conclusion: conclusionData
    }, () => {
      setFieldsValue({[`${people}-xjldata`]: _.get(xjl, value)[0]});
    });

  };

 
  dealData = () => {
    const {match, znfz,ysay,stage} = this.props;
    const {params: {id}} = match;
    const {validateFields} = this.props.form;
    const {people, lxjydata} = this.state;
    const payload = [];
    validateFields((errors, values) => {
      people.map((value) => {
        const itemData = {};
        let lxjydata = [];
        const jsondata = {};
        const znfz_setjl = {};
        _.set(itemData, 'ysay', ysay);
        _.set(itemData, 'bmsah', id);
        _.set(itemData, 'tysah', znfz.ajxx.tysah);
        _.set(itemData, 'mergekey', value);
        _.set(itemData, 'stage', stage);
        _.set(znfz_setjl, 'ysay', ysay);
        _.set(znfz_setjl, 'bmsah', id);
        _.set(znfz_setjl, 'tysah', znfz.ajxx.tysah);
        _.set(znfz_setjl, 'mergekey', value);
        _.set(znfz_setjl, 'stage', stage);
        // if (stage === 'GS') {
        //   const lxjyData = lxjydata[0].jsondata.value[value];
        //   lxjyData ? _.set(jsondata, '量刑建议', lxjyData) : '';
        // }
     
        const wholeJl = values['全案结论'];
        _.map(values, (v, k) => {
          if (_.startsWith(k, value)) {
            const key = _.split(k, '-');
            if (key[1] !== 'jldata' && key[1] !== 'xjldata' && key[1] !== 'xjlDetail') {
              if (typeof(v) === 'boolean') {
                if (v) {
                  _.set(jsondata, key[1], '是');
                } else {
                  _.set(jsondata, key[1], '否');
                }
              } else {
                _.set(jsondata, key[1], v);
              }
            } else if (key[1] === 'jldata') {
              wholeJl ? _.set(znfz_setjl, 'djl', wholeJl) : _.set(znfz_setjl, 'djl', v);
            } else if (key[1] === 'xjldata') {
              wholeJl ? '' : _.set(znfz_setjl, 'xjl', v);
            } else {
              wholeJl ? '' : _.set(znfz_setjl, 'detail', v)
            }
          }
        });

        const xsrzValue = jsondata['犯罪嫌疑人的刑事责任能力'];
        const xsrzSaveData = xsrzValue === '完全' ? '犯罪嫌疑人具有完全刑事责任能力' : xsrzValue === '限制' ? '犯罪嫌疑人具有限制刑事责任能力' : '犯罪嫌疑人无刑事责任能力';
        xsrzSaveData ? _.set(jsondata, '犯罪嫌疑人的刑事责任能力', xsrzSaveData) : '';

        _.set(itemData, 'jsondata', jsondata);
        _.set(itemData, 'znfz_setjl', znfz_setjl);

        payload.push(itemData);
      });
    });
    return payload;
  };


  dealSycxData = () => {
    const {match, znfz,ysay,stage} = this.props;
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


  onNextStepSave = (lxjg, toNextStep) => {
    const {dispatch, match, znfz, ysay, stage} = this.props;
    const {params: {id}} = match;
    const payload = this.dealData();
    dispatch({
      type: 'znfz/saveNewConclusion',
      payload: payload
    }).then((result) => {
      message.success('保存成功');
      dispatch({
        type: 'znfz/sendStepList',
        payload: {
          bmsah: id,
          jllc: ['审查意见', '文书制作']
        }
      });
      this.props.onChangeState && this.props.onChangeState('文书制作', ['审查意见', '文书制作'])
    }).catch((error) => {
      message.warning('保存失败');
    })
  };


  onSave = (lxjg, toNextStep = true) => {
    const {dispatch, znfz} = this.props;
    const payload = this.dealData();
    const {validateFieldsAndScroll} = this.props.form;
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return
      }
      dispatch({
        type: 'znfz/judgeAge',
        payload: payload
      }).then(({success, data}) => {
        let text = [];
        if (success && data && data.length > 0) {
          _.forEach(data, o => {
            if (!o.success) {
              const modalContent = <p>
                {o.suspect}：
                {
                  o.message && o.message.map((i, idx) => {
                    return (
                      <span key={idx} style={{color: 'blue'}}>
                    {i}
                        {idx + 1 === o.message.length ? '' : <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>}
                  </span>
                    )
                  })
                }
              </p>;
              text.push(modalContent);
            }
          });
        }

        if (text.length > 0) {
          Modal.warning({
            title: '如下选项存在冲突，请重新选择：',
            okText: '确定',
            content: text,
            width: 500,
            onOk(){
            }
          })
        } else {
          this.onNextStepSave(lxjg, toNextStep)
        }
      });
    });
  };


  renderTableFooter = () => {
    const {znfz: {ajxx}, stage} = this.props;
    const {getFieldDecorator} = this.props.form;
    const {conclusion, nextStepDisable} = this.state;
    const jlDatas = [];
    conclusion.map(o => {
      const qsyjData = o && o.jsondata && o.jsondata.djl;
      jlDatas.push(qsyjData);
    });

    const footArray = ['同意公安机关撤回', '拆案', '并案', '改变管辖', '退查后未重报'];
    const ZJfootArray = ['拆案', '并案', '改变管辖'];

    let footValue;
    jlDatas.map(o => {
      footArray.map(i => {
        if (o === i) {
          footValue = o
        }
      })
    });
    return (
      <div>
        {/* <span className={styles.text}>其他审结情况</span>
        <Fragment>
          {getFieldDecorator(`全案结论`, {
            initialValue: footValue ? footValue : ''
          })(
            stage === 'ZJ' ?
              <Select className={styles.jlInput}>
                {ZJfootArray.map(o => <Option key={o}>{o}</Option>)}
              </Select> :
              <Select className={styles.jlInput}>
                {footArray.map(o => <Option key={o}>{o}</Option>)}
              </Select>
          )}
        </Fragment> */}
        <Button icon={'save'}
                type={'primary'}
                disabled={(ajxx.ajzt && ajxx.ajzt.zt === 9) || nextStepDisable}
                onClick={() => this.onSave()}
        >下一步</Button>
      </div>
    )
  };

  render() {
    const columns = this.renderCell();
    return (
      <div>
        <TJTable columns={columns}
                 list={this.state.data}
                 title="审查意见"
                 footer={this.renderTableFooter}
                 scroll={{x: (columns.length - 2) * 320 + 500, y: 600}}
        />
      </div>
    )
  }
}
