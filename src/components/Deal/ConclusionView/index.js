import React, {Component} from 'react';
import {Icon, Collapse, Form, Input, Button, Select} from 'antd';
import _ from 'lodash';
import styles from './index.less';
import Conclusion from './Conclusion';

const Panel = Collapse.Panel;
const Option = Select.Option;
const FormItem = Form.Item;
const TextArea = Input.TextArea;

class JLZSForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      conclusion: props.conclusion,
      conclusionConfigs: props.conclusionConfigs,
      mainConclusions: this.buildMainConclusion(props.conclusionConfigs),
      subConclusions: this.getSubConclusion(props.conclusionConfigs, props.conclusion.djl),
      djl: props.conclusion.djl,
      xjl: props.conclusion.xjl,
      jlVisible: false,
    }
  };

  buildMainConclusion = (configs) => {
    return _.uniq(configs.map(c => c.djl));
  };

  getSubConclusion = (configs, djl) => {
    let subConclusions = [];
    configs.map(c => {
      if (c.djl === djl && c.xjl !== '') {
        subConclusions.push(c.xjl);
      }
    });
    return subConclusions;
  };

  componentWillReceiveProps(nextProps) {
    let newState = null;
    if (!_.isEqual(this.props.conclusionConfigs, nextProps.conclusionConfigs)) {
      newState = _.assign({}, newState, {
        conclusionConfigs: nextProps.conclusionConfigs,
        mainConclusions: this.buildMainConclusion(nextProps.conclusionConfigs),
        subConclusions: this.getSubConclusion(nextProps.conclusionConfigs, nextProps.conclusion.djl),
      });
    }
    if (!_.isEqual(this.props.conclusion, nextProps.conclusion)) {
      newState = _.assign({}, newState, {
        conclusion: nextProps.conclusion,
        djl: nextProps.conclusion.djl,
        xjl: nextProps.conclusion.xjl,
      });
    }

    this.setState({...newState});

  };

  onClick = () => {
    const {validateFields, getFieldsValue} = this.props.form;
    const {stage} = this.props;

    validateFields((errors) => {
      if (errors) {
        return;
      }

      const data = {...getFieldsValue()};
      data.xjl = data.xjl ? data.xjl : '';
      let config = this.state.conclusionConfigs.find(c => c.djl === data.djl && c.xjl === data.xjl);

      const {ajxx, dispatch} = this.props;
      dispatch({
        type: `znfz/saveConclusions`,
        payload: {
          bmsah: ajxx.bmsah,
          tysah: ajxx.tysah,
          ysay: ajxx.ysay_aymc,
          djl: config.djl,
          xjl: config.xjl,
          id: config.id,
          note: data.note,
        },
      });
      this.setState({jlVisible: false});
    });
  };

  objKeySort = (obj) => {
    let newkey = Object.keys(obj).sort();
    let newObj = {};
    for (let i = 0; i < newkey.length; i++) {
      newObj[newkey[i]] = obj[newkey[i]];
    }
    return newObj;
  };

  onMainChange = (djl) => {
    let subConclusions = this.getSubConclusion(this.state.conclusionConfigs, djl);
    const xjl = subConclusions.find(d => d === this.props.conclusion.xjl);
    const {setFieldsValue} = this.props.form;
    if (setFieldsValue) {
      setFieldsValue({xjl});
    }
    this.setState({
      djl: djl,
      xjl: xjl ? xjl : '',
      subConclusions: subConclusions,
    });
  };

  onSubChange = (xjl) => {
    this.setState({
      xjl: xjl ? xjl : '',
    });
  };

  /**
   * 过滤所有审查项，指定问题处理选项
   * @param array
   * @param val
   * @returns {Array}
   */
  onFilterList = (array, val) => {
    const list = _.filter(array, function (o) {
      if (o.dealdata.document) {
        return _.indexOf(o.dealdata.document, val) >= 0;
      } else {
        return false;
      }
    });

    return list;
  };

  /**
   * 重构检察建议书、纠正违法通知、口头纠正违法通知的数据
   * @param array
   * @param target
   * @param title
   */
  onRebuildList = (array, target, title) => {
    if (array.length > 0) {
      _.forEach(array, (val, key) => {
        let list = {};
        _.set(list, 'title', title);
        _.set(list, 'label', _.split(val.keyid, '_'));
        _.set(list, 'text', val.gzmc);
        target.push(list);
      });
    } else {
      let list = {};
      _.set(list, 'title', title);
      target.push(list);
    }
  };

  getOptions = (bdpzList) => {
    const options = {};
    _.forEach(bdpzList, d => {
      options[d.keyId] = d.jsondata;
    });
    return options;
  };

  /**
   * TODO: 若SS_OPTION 保存到后台,则需要修改此处
   * @returns {XML}
   */
  render() {
    const {bdpzList, fact, ajxx, dispatch, stage, allProblem} = this.props;

    let options = this.getOptions(bdpzList);


    const listHasJCJY = this.onFilterList(allProblem, 'C');
    const listHasJZWFTZ = this.onFilterList(allProblem, 'D');
    const listHasKTJZWFTZ = this.onFilterList(allProblem, 'E');

    let listAllFliter = [];
    this.onRebuildList(listHasJCJY, listAllFliter, '检察建议');
    this.onRebuildList(listHasJZWFTZ, listAllFliter, '纠正违法通知');
    this.onRebuildList(listHasKTJZWFTZ, listAllFliter, '口头纠正违法通知');
    let finalList = _.groupBy(listAllFliter, (value) => {
      return _.result(value, 'title');
    });



    let map = new Map();
    _.mapKeys(fact, (value, key) => {
      map.set(_.result(value, 'keyid'), _.result(value, 'zzjg'));
    });
    let map_value = new Map();
    _.mapKeys(fact, (value, key) => {
      map_value.set(_.result(value, 'keyid'), _.result(value, 'value'));
    });
    let map_ss_option = new Map();
    _.mapKeys(options, (value, key) => {
      map_ss_option.set(key, _.result(value, 'dealOptions.options'));
    });
    const list = [];
    map.forEach((value, key) => {
      let label = _.words(key, /[^_]+/g);
      let text = _.result(map_ss_option.get(key), value);
      let cont = map_value.get(key);
      list.push({
        label: label,
        text: text,
        value: cont,
      });
    });
    let result = _.groupBy(list, (value) => {
      return _.result(value, 'label[1]');
    });

    const verticalStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };

    const newResult = this.objKeySort(result);

    const {conclusion, mainConclusions, subConclusions} = this.state;
    const {getFieldDecorator} = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 4},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 14},
      },
    };

    return (
      <div style={{padding: '20px 5px'}}>
        <div className={styles.checkItem}>
          <div className={styles.title}>
            <Icon type="paper-clip" className={styles.icon}/>
            <span className={styles.label}>结 论: {this.state.djl}</span>
            {
              !this.state.jlVisible &&
              <a type="primary" style={{marginLeft: '1rem', fontSize: '1.2rem'}}
                 onClick={() => this.setState({jlVisible: true})}>修改</a>
            }
            {
              this.state.jlVisible &&
              <a type="primary" style={{marginLeft: '1rem', fontSize: '1.2rem'}}
                 onClick={() => this.setState({jlVisible: false})}>取消</a>
            }
          </div>
          <p className={styles.result}>详细原因: {this.state.xjl}</p>
        </div>
        <div className={styles.checkItem} style={{display: this.state.jlVisible ? 'block' : 'none'}}>
          <Form>
            <FormItem {...formItemLayout} label='结论'>
              {getFieldDecorator(`djl`, {
                initialValue: this.state.djl,
                rules: [
                  {type: 'string', required: true, message: '请选择结论'},
                ],
              })(
                <Select onSelect={this.onMainChange} placeholder="请选择结论">
                  {
                    mainConclusions && mainConclusions.map((m, i) => {
                      return <Option style={verticalStyle} key={i} value={m}>{m}</Option>;
                    })
                  }
                </Select>,
              )}
            </FormItem>
            <FormItem {...formItemLayout} label='详细原因'>
              {getFieldDecorator(`xjl`, {
                initialValue: this.state.xjl,
                rules: [
                  {type: 'string', required: subConclusions && subConclusions.length > 0, message: '请选择详细原因'},
                ],
              })(
                <Select onSelect={this.onSubChange} placeholder="请选择详细原因">
                  {
                    subConclusions && subConclusions.map((m, i) => {
                      return <Option style={verticalStyle} key={i} value={m}>{m}</Option>;
                    })
                  }
                </Select>,
              )}
            </FormItem>
            <FormItem {...formItemLayout} label='结论意见'>
              {getFieldDecorator(`note`, {
                initialValue: conclusion.note,
                rules: [
                  {type: 'string', required: false, message: '请输入结论意见'},
                ],
              })(
                <TextArea rows={2} style={{width: '100%'}} placeholder="结论意见"/>,
              )}
            </FormItem>
            <FormItem wrapperCol={{span: 14, offset: 4}}>
              <Button type="primary" size="small" onClick={this.onClick}>保存</Button>
            </FormItem>
          </Form>
        </div>
        <Collapse bordered={false} defaultActiveKey={['主体事实', '客观行为']}>
          {
            _.map(newResult, (obj, index) => {
              let title = obj.length === 0 ? '' : obj[0].label[1];
              return (
                <Panel key={index} header={<span style={{padding: '10px 20px', display: 'inline-block'}}>{title}</span>}>
                  <Conclusion option={obj} ajxx={ajxx} dispatch={dispatch} stage={stage} type="0"/>
                </Panel>
              );
            })
          }
        </Collapse>
        <Collapse bordered={false}>
          {
            _.map(finalList, (obj, index) => {
              return (
                <Panel key={index} header={<span style={{padding: '10px 20px', display: 'inline-block'}}>{index}</span>}>
                  <Conclusion option={obj} ajxx={ajxx} dispatch={dispatch} stage={stage} type="1"/>
                </Panel>
              );
            })
          }
        </Collapse>
      </div>
    );
  }
}

export default Form.create()(JLZSForm);
