import React, {PureComponent} from 'react';
import {Row, Col, Icon, Form, Input, Select, Dropdown, Tooltip, Button} from 'antd';
import _ from 'lodash';
import classnames from 'classnames';
import moment from 'moment';
import Bind from 'lodash-decorators/bind';
import Debounce from 'lodash-decorators/debounce';
import OcrWrapper from 'lib/OcrWrapper';
import NlpWrapper from 'lib/NlpWrapper';
import {cursorPosition} from 'utils/utils';
import BoolNlp from './BoolNlp';
import styles from './FormComponent.less';
import Time from 'components/xDeal/Time';

const {Item: FormItem} = Form;
const {TextArea} = Input;
const {Option} = Select;
const {Button: DropdownButton} = Dropdown;

const ruleRequiredStyle = {
  color: 'red',
  fontSize: '19px',
  marginRight: '2px'
};

@Form.create({
  onFieldsChange: (props, fields) => {
    const {data, renameTab, getNLP} = props;
    const listname = _.find(data, (v, k) => k === 'listname');
    _.forEach(fields, (field, path) => {
      const {name, value} = field;

      if (listname) {
        const current = _.get(data, listname.content);
        if (current && current.path === path) {
          if (!_.isEmpty(name) && !_.isEmpty(value)) {
            let indexs = name.match(/\d+/g);
            if (!_.isEmpty(indexs)) {
              renameTab && renameTab(indexs.pop(), value);
            }
          }
        }
      }

      const item = _.find(data, (v, k) => v.path === path);

      if (_.has(item, 'nlp_property')) {
        const property = _.get(item, 'nlp_property');
        if (!_.isEmpty(property)) {
          const {api, params} = property;
          const key = _.findKey(data, (v, k) => v.path === path);
          getNLP && getNLP(name, key, value, {
            ...params,
            path: name,
            content: value,
          });
        }
      }

      //todo filename调整
      // if (key === '供述摘录' || key === '案情摘要') {
      //   getNLP && getNLP(name, key, value, {
      //     filename: '犯罪情节',//key === '供述摘录' ? '犯罪情节' : '侦查机关认定的犯罪情节',
      //     path: name,
      //     content: value,
      //   });
      // }

      //
      // item.content = value;
      // delete item.label;
      // saveNLP && saveNLP(item);
    });
  }
})
export default class FormComponent extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      subVisible: false,
      data: props.data,
      type: props.type,
      importVisible: false,
      factContent: false,
      listPath: '',
      onlyBool: true,
      tips: ''
    }
  }

  componentDidMount() {
    this.setState({
      ...this.getInitState(this.props.data),
    })
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.data, nextProps.data)) {
      this.props.ifSave && this.props.ifSave(true, nextProps.data);
      this.setState({
        data: nextProps.data,
        type: nextProps.type,
        ...this.getInitState(nextProps.data),
      })
    } else {
      this.setState({
        ...this.getInitState(nextProps.data),
      })
    }
  }

  /**
   * 获取界面控制参数初始化参数
   * @param data
   * @returns {}
   */
  getInitState = (data) => {
    const initFactContent = _.get(data, '侦查机关认定的事实.content');

    const importVisible = !!(initFactContent && initFactContent.length > 0 && initFactContent !== 'newrdss');
    const newState = {
      importVisible,
    };

    const listPath = _.get(data, 'listname.path');
    if (listPath && listPath !== this.state.listPath) {
      _.set(newState, 'factContent', initFactContent);
      _.set(newState, 'listPath', listPath);
    }

    return newState;
  };

  renderDateTime = (item, currentXyr) => {
    const {form: {getFieldValue, getFieldDecorator, setFieldsValue}, xyrJbxx, docNlp} = this.props;
    let content = item.content || getFieldValue(item.path);
    const type = item.type && item.type.split('|');
    const _type = type.length > 1 ? type[1] : '';

    const suffix = ((docNlp && (docNlp.title === '起诉意见书' || docNlp.title === '提请批准逮捕书')) && (item && item.label === '出生日期')) ? currentXyr ? currentXyr[item.label] === item.content ?
      <Tooltip title={currentXyr[item.label]}><Icon type="check-circle" theme="filled"
                                                                        style={{color: '#52c41a'}}/></Tooltip> :
      <Tooltip title={currentXyr[item.label]}><Icon type="exclamation-circle" theme="filled"
                                                                        style={{color: '#F9AC14'}}/></Tooltip> :
      <Tooltip title={'案卡中没有该嫌疑人信息'}><Icon type="close-circle" theme="filled"
                                           style={{color: '#f4222d'}}/></Tooltip> : <span/>;

    return (
      <Col span={24}
           key={item.label}
           className={styles.formItem}>
        <div className={styles.label}
             title={item.label}>{item.required && item.required === 'true' &&
        <span style={ruleRequiredStyle}>*</span>}{item.label}</div>
        <div className={styles.content}>
          <div className={styles.dateTime}>
            <OcrWrapper onClick={() => this.onOcrClick(item)}>
              {
                getFieldDecorator(`${item.path}`, {
                  rules: [{
                    required: item.required && item.required === 'true',
                    message: this.state.tips ? this.state.tips : `请输入${item.label}`
                  }],
                })(
                  <Time
                    item={item}
                    initialValue={content}
                    suffix={suffix}
                    onSave={(item, value, tips) => {
                      if (tips) {
                        this.setState({
                          tips: tips
                        }, () => {
                          setFieldsValue({
                            [item.path]: item.content
                          });
                          this.save(item, value)
                        })
                      } else {
                        setFieldsValue({
                          [item.path]: item.content
                        });
                        this.save(item, value)
                      }
                    }}
                    type={_type}
                  />
                )
              }
            </OcrWrapper>
          </div>
        </div>
      </Col>
    );
  };

  render() {
    const {data, type, subVisible} = this.state;

    let main = _.pickBy(data, v => v.property && v.property.indexOf('main') >= 0);
    let sub = _.omitBy(data, v => v.property && v.property.indexOf('main') >= 0);

    const hasMain = !_.isEmpty(main);

    return (
      <div className={styles.default} key={type}>
        <div className={styles.ruleCheck}>
          {
            hasMain && (
              <div className={styles.main}>
                {
                  this.renderItem(main)
                }
                <div className={styles.trigger}>
                  <a onClick={() => {
                    this.setState({subVisible: !subVisible})
                  }}>
                    更多<Icon type={subVisible ? 'down' : 'right'}/>
                  </a>
                </div>
                {
                  !_.isEmpty(sub) && (
                    <div className={classnames(styles.sub, subVisible ? styles.visible : '')}>
                      {
                        this.renderItem(sub)
                      }
                    </div>
                  )
                }
              </div>
            )
          }
          {
            !hasMain && !_.isEmpty(sub) && this.renderItem(sub)
          }
        </div>
      </div>
    )
  }

  renderItem = (data, subOfArray) => {

    data = _.cloneDeep(data);

    _.map(data, (v, index) => {
      if (!v.type || v.type !== 'bool') {
        this.setState({onlyBool: false})
      }
    });

    const typeConverter = {
      'int': 'string',
      'datetime': 'datetime|day',
      'period': 'string',
      'people': 'peopleNum',
      'float': 'string',
      'chepai': 'string',
      'weight': 'string',
      'zuiming': 'string',
    };

    const labelConverter = {
      '犯罪嫌疑人供述': '供述摘录',
      '证人证言': '证言摘录',
      '被害人陈述': '陈述摘录',
      '其它言辞证据': '陈述摘录',
    };

    const rebuildType = (v) => {
      if (Array.isArray(v)) {
        return 'ARRAY';
      } else {
        let type = v.type;
        if (_.has(typeConverter, type)) {
          type = _.get(typeConverter, type);
        }
        if (v.type === 'string' && !v.enume && v.property && v.property.indexOf('main') >= 0) {
          type = 'textarea';
        }
        if (v.type === 'string' && !v.enume && v.content && v.content.length > 25) {
          type = 'textarea';
        }
        if (v.type === 'string' && !v.enume && v.property && v.property.indexOf('multiple') >= 0) {
          type = 'textarea';
        }

        if (v.type && v.type.split('|')[0] === 'enume' || v.type && v.type.split('|')[0] === 'multiple' ||
          v.type && v.type.split('|')[0] === 'datetime' && v.type.split('|')[1] || v.type === 'number' || v.type === 'peopleNum' || v.type === 'money') {
          type = v.type;
        }
        return type;
      }

    };

    const rebuildOrder = (v) => {
      return v.type === 'select' ? 0 : 1;
    };

    const rebuildLabel = (k, v) => {
      let label = k;
      if (v && v.property && v.property.indexOf('change-label') >= 0) {
        const {docType} = this.props;
        label = labelConverter[docType];
      }
      if (_.isEmpty(label)) {
        label = k;
      }
      return label;
    };

    let dataWithLabel = _.map(data, (v, k) => ({
      ...v,
      label: rebuildLabel(k, v),
      type: rebuildType(v),
      order: rebuildOrder(v),
    })); //convert to array

    dataWithLabel = _.orderBy(dataWithLabel, 'order');

    const bools = _.pickBy(dataWithLabel, (v, k) => v.type === 'bool');
    const others = _.pickBy(dataWithLabel, (v, k) => !v.type || (v.type && v.type !== 'bool' && v.type !== 'ARRAY'));
    const arrays = _.pickBy(dataWithLabel, (v, k) => v.type === 'ARRAY');

    const onlyOneOthers = subOfArray && _.filter(others, v => v.type !== 'unknown').length === 1;


    const keyProps = {};
    if (subOfArray) {
      keyProps.key = _.get(data, 'listname.path');
    }

    let currentXyr;
    const idCard = _.find(others, item => item.label === '身份证号码');
    if (idCard) {
      currentXyr = _.find(this.props.xyrJbxx, item => item['身份证号码'] === idCard.content);
    }

    return (
      <div {...keyProps} className={classnames(styles.panel, subOfArray ? styles.arrayList : '')}>
        <Row>
          {
            !_.isEmpty(others) && _.map(others, v => {
              let formItem = null;

              switch (v.type && v.type.split('|')[0]) {
                case 'string':
                  formItem = this.renderString(v, onlyOneOthers, currentXyr);
                  break;
                case 'textarea':
                  formItem = this.renderTextArea(v, onlyOneOthers, currentXyr);
                  break;
                case 'select':
                  formItem = this.renderSelect(v);
                  break;
                case 'datetime':
                  formItem = this.renderDateTime(v, currentXyr);
                  break;
                case 'enume':
                  formItem = this.renderEnume(v, false, currentXyr);
                  break;
                case 'multiple':
                  formItem = this.renderEnume(v, true, currentXyr);
                  break;
                case 'number':
                  formItem = this.renderNum(v, 'number');
                  break;
                case 'money':
                  formItem = this.renderNum(v, 'money');
                  break;
                case 'peopleNum':
                  formItem = this.renderNum(v, 'people');
                  break;
                case 'unknown':
                  if (subOfArray && v.label === 'listname') {
                    formItem = this.renderDeleteTrigger(v);
                  }
                  break;
                default:
                  formItem = this.renderString(v);
                  break;
              }
              return formItem;
            })
          }
        </Row>
        <Row>
          {
            !_.isEmpty(bools) && this.renderBoolean(bools)
          }
        </Row>
        <Row>
          {
            !_.isEmpty(arrays) && _.map(arrays, (array, idx) => this.renderArray(array, idx))
          }
        </Row>

      </div>
    )
  };

  /**
   * 渲染数组子元素的删除按钮
   * @param v
   * @returns {*}
   */
  renderDeleteTrigger = (v) => {
    return (
      <div className={styles.deleteTrigger} key={`${v.path}-delete-trigger`}>
        <Button icon='close' size='small'
                shape='circle' type='ghost'
                style={{border: 'none'}}
                onClick={() => {
                  this.props.deleteNLP && this.props.deleteNLP(v && v.path);
                }}/>
      </div>
    )
  };

  handleInput = (e, path) => {
    // let newValue = Number(e.target.value.replace(/\-/g, ""));
    let newValue = e.target.value.replace(/\D/g, '');
    this.props.form.setFieldsValue({
      [path]: newValue
    })
  };

  /**
   * 数字输入框
   * @param item
   * @returns {XML}
   */
  renderNum = (item, type) => {
    const {getFieldDecorator, getFieldValue} = this.props.form;
    let content = item.content || getFieldValue(item.path);
    let addonAfterContent;
    switch (type) {
      case 'people':
        addonAfterContent = <span>人</span>;
        break;
      case 'money':
        addonAfterContent = <span>元（人民币）</span>;
        break;
      default:
        addonAfterContent = null
    }

    return (
      <Col span={24}
           className={styles.formItem}
           key={item.label}>
        <div className={styles.label}>{item.required && item.required === 'true' &&
        <span style={ruleRequiredStyle}>*</span>}{item.label}</div>
        <div className={styles.content}>
          <OcrWrapper onClick={() => this.onOcrClick(item)}>
            {
              getFieldDecorator(`${item.path}`, {
                initialValue: content ? type === 'number' ? content.replace(/\D/g, '') : Number(content) === 0 ? '0' : parseFloat(content) : '',
              })(
                <Input
                  type={content && "number"}
                  maxLength={25}
                  min="0"
                  onBlur={() => this.save(item, undefined)}
                  style={{width: '100%'}}
                  onInput={(e) => this.handleInput(e, item.path)}
                  addonAfter={addonAfterContent}
                />
              )
            }
          </OcrWrapper>
        </div>
      </Col>
    )
  };

  /**
   *
   * @param item 待渲染的组件数据
   * @param onlyOne 是否只有一个，如果是，渲染全行
   * @returns {*}
   */

  renderString = (item, onlyOne, currentXyr) => {
    if (item.enume) {
      let selectItem = null;
      switch (item.enume && item.enume.split('|')[0]) {
        case 'single':
          selectItem = this.renderGyshEnume(item, false, currentXyr);
          break;
        case 'multiple':
          selectItem = this.renderGyshEnume(item, true, currentXyr);
          break;
        default:
          selectItem = this.renderGyshEnume(item, false, currentXyr);
      }
      return selectItem;
    } else {
      return (
        this.renderSimpleString(item, onlyOne, currentXyr)
      )
    }
  };
  renderSimpleString = (item, onlyOne, currentXyr) => {
    const {form: {getFieldDecorator, getFieldValue}, docNlp} = this.props;
    const {factContent} = this.state;
    const labelTitle = item.label;

    const inputDisabled = item.label === '案件名称' && !!factContent && factContent.length > 0 && factContent !== 'newrdss';
    const akLabel = ['犯罪嫌疑人姓名', '户籍所在地', '住址', '身份证号码'];

    let content = item.content;
    if (item.type === 'datetime') {
      if (!_.isEmpty(content)) {
        content = moment(content, 'YYYY-MM-DD').format('YYYY-MM-DD');
      }
    }

    const fieldOption = {
      initialValue: content,
      rules: item.type === 'datetime' ? [
        {pattern: new RegExp(/\d{4}-\d{1,2}-\d{1,2}/), message: '时间格式示例:2018-01-01'},
      ] : [],
    };

    const suffix = ((docNlp && (docNlp.title === '起诉意见书' || docNlp.title === '提请批准逮捕书')) && _.indexOf(akLabel, labelTitle) > -1) ? currentXyr ? currentXyr[item.label] === item.content ?
      <Tooltip title={currentXyr && currentXyr[labelTitle]}><Icon type="check-circle" theme="filled"
                                                                  style={{color: '#52c41a'}}/></Tooltip> :
      <Tooltip title={currentXyr && currentXyr[labelTitle]}><Icon type="exclamation-circle" theme="filled"
                                                                  style={{color: '#F9AC14'}}/></Tooltip> :
      <Tooltip title={'案卡中没有该嫌疑人信息'}><Icon type="close-circle" theme="filled"
                                             style={{color: '#f4222d'}}/></Tooltip> :
      <span/>;

    return (
      <Col span={24}
           key={item.path}
           className={styles.formItem}>
        {!onlyOne &&
        <div className={styles.label} title={labelTitle}>{item.required && item.required === 'true' &&
        <span style={ruleRequiredStyle}>*</span>}{labelTitle}</div>}
        <div className={styles.content}>
          {
            inputDisabled && getFieldDecorator(`${item.path}`, fieldOption)(
              <Input onBlur={() => this.save(item)}
                     disabled={inputDisabled}/>
            )
          }
          {
            !inputDisabled && (
              <OcrWrapper onClick={() => this.onOcrClick(item)}>
                <Tooltip placement="top"
                         visible={item.type && getFieldValue(item.path) && getFieldValue(item.path).length > 25 ? true : false}
                         title={getFieldValue(item.path)}
                         trigger="click">
                  {
                    getFieldDecorator(`${item.path}`, fieldOption)(<Input onClick={this.onInputClick}
                                                                          onBlur={() => this.save(item)}
                                                                          suffix={suffix}
                                                                          disabled={inputDisabled}/>)
                  }
                </Tooltip>
              </OcrWrapper>
            )
          }

        </div>
      </Col>
    )
  };

  renderEnume = (item, isMultiple, currentXyr) => {
    const {enumerate, xyrJbxx, docNlp} = this.props;
    const {getFieldDecorator} = this.props.form;
    const cs = item.type && item.type.split('|')[1];
    let initialValues = enumerate[cs] && enumerate[cs].length > 0 ? enumerate[cs].map(item => item.probable_value) : [];
    const i = initialValues.map((i, index) => i && i.indexOf(item.content) !== -1);
    const init = i.indexOf(true) === -1 ? [item.content] : enumerate[cs][i.indexOf(true)];
    let initVal = init.value || init;
    let otherIinitVal;
    if (!isMultiple && _.endsWith(initVal[0], '其他')) {
      otherIinitVal = initVal[0] && initVal[0].split(',');
      _.remove(otherIinitVal, o => o === '其他')
    }
    const _initialValue = _.isArray(initVal) ? _.join(initVal) : initVal;
    const akLabel = [ '文化程度', '性别'];

    return (
      <Col span={24}
           className={styles.formItem}
           key={item.label}>
        <div className={styles.label}>{item.required && item.required === 'true' &&
        <span style={ruleRequiredStyle}>*</span>}{item.label}</div>
        <div className={styles.content}>
          {
            getFieldDecorator(`${item.path}`, {
              initialValue: isMultiple ? _.isArray(initVal) ? initVal[0] && initVal[0].split(',') || [] : initVal && initVal.split(',') : _.endsWith(initVal[0], '其他') ? '其他' : initVal,
              getValueFromEvent: value => {
                let newVal = value;
                if (isMultiple) {
                  if (_.indexOf(value, '否') > -1) {
                    newVal = value.length > 1 && _.indexOf(value, '否') === 0 ? _.drop(value) : ['否']
                  } else if (_.indexOf(value, '无') > -1) {
                    newVal = value.length > 1 && _.indexOf(value, '无') === 0 ? _.drop(value) : ['无']
                  }
                }
                return newVal
              }
            })(<Select placeholder={`请选择${item.label}`}
                       style={{width: isMultiple ? '90%' : '50%', marginLeft: 10}}
                       mode={isMultiple && "multiple"}
                       onChange={(value, option) => {
                         let newValue = value;
                         if (_.indexOf(value, '否') > -1) {
                           newValue = value.length > 1 && _.indexOf(value, '否') === 0 ? _.drop(value) : ['否']
                         } else if (_.indexOf(value, '无') > -1) {
                           newValue = value.length > 1 && _.indexOf(value, '无') === 0 ? _.drop(value) : ['无']
                         }
                         this.save(item, newValue)
                       }}
                       dropdownMatchSelectWidth={true}>
              {
                enumerate[cs] && enumerate[cs].length > 0 ? enumerate[cs].map((dic, idx) => {
                  return (
                    <Option key={idx} data={dic} value={dic.value} style={{width: '100%'}}>
                      <Tooltip placement='left' title={dic.value}>
                        {dic.value}
                      </Tooltip>
                    </Option>
                  )
                }) : ''
              }
            </Select>)
          }
          {
            ((docNlp && (docNlp.title === '起诉意见书' || docNlp.title === '提请批准逮捕书')) && _.indexOf(akLabel, item.label) > -1) ? currentXyr ? currentXyr[item.label] === _initialValue ?
              <Tooltip title={currentXyr && currentXyr[item.label]}><Icon type="check-circle" theme="filled"
                                                                          style={{color: '#52c41a'}}/></Tooltip> :
              <Tooltip title={currentXyr && currentXyr[item.label]}><Icon type="exclamation-circle" theme="filled"
                                                                          style={{color: '#F9AC14'}}/></Tooltip> :
              <Tooltip title={'案卡中没有该嫌疑人信息'}><Icon type="close-circle" theme="filled"
                                                     style={{color: '#f4222d'}}/></Tooltip> :null

          }
          {
            isMultiple === false && (_.endsWith(initVal[0], '其他') || _.endsWith(initVal, '其他')) ?
              getFieldDecorator(`${item.path}-other`, {
                initialValue: otherIinitVal ? otherIinitVal : []
              })(
                <Select
                  mode="tags"
                  tokenSeparators={[',']}
                  style={{width: '50%', marginLeft: 10, marginTop: 3}}
                  onChange={(value, option) => {
                    const _value = _.cloneDeep(value);
                    _value.push('其他');
                    this.save(item, _value)
                  }}
                >
                  <Option key={1}/>
                </Select>
              ) : ''
          }
        </div>
      </Col>
    )
  };

  renderGyshEnume = (item, isMultiple, currentXyr) => {
    const {names, enumerate, facts, docNlp} = this.props;
    const {getFieldDecorator} = this.props.form;
    const cs = item.enume && item.enume.split('|')[1];
    let optionArr = cs && cs === 'TYYW_GG_XYRJBXX' ? names : enumerate[cs] && enumerate[cs].length > 0 ? enumerate[cs].map(item => item.value) : [];
    let initialValue = item.content;
    const initialValueArr = initialValue && initialValue.split(',');
    let correctArr = [];
    const akLabel = ['文化程度', '性别'];

    if (cs && cs !== 'TYYW_GG_XYRJBXX' && !isMultiple) {
      const currentEnume = _.find(enumerate[cs], item => {
        return (_.indexOf(item.probable_value, initialValue) > -1)
      });
      correctArr = currentEnume ? [currentEnume.value] : []
    } else {
      correctArr = _.intersection(optionArr, initialValueArr);
    }

    let otherIinitVal;
    if (!isMultiple && _.endsWith(initialValue, '其他')) {
      otherIinitVal = initialValue && initialValue.split(',');
      _.remove(otherIinitVal, o => o === '其他')
    }

    const getTooltip = (data) => (
      <div className={styles.tooltip}>
        {
          _.map(data, (v, k) => {
            if (k === '案情摘要') {
              return (<p key={k}><span>{k}</span> : <span>{v}</span></p>)
            }
          })
        }
      </div>
    );
    if (cs && cs === 'list-by-bmsah') {
      const relateFact = _.filter(facts, o => {
        if (o.mergekey === initialValue) {
          return o
        }
      });
      const initial = relateFact.length > 0 ? relateFact[0].mergekey + '：' + relateFact[0].aqjxdata['案情摘要'] : '';

      return (
        <Col span={24}
             className={styles.formItem}
             key={item.label}>
          <div className={styles.label}>{item.required && item.required === 'true' &&
          <span style={ruleRequiredStyle}>*</span>}{item.label}</div>
          <div className={styles.content}>
            {
              getFieldDecorator(`${item.path}`, {
                initialValue: initial
              })(
                <Select placeholder={`请选择${item.label}`}
                        style={{width: '240px', marginLeft: 10}}
                        onChange={(value) => {
                          this.save(item, value)
                        }}
                        dropdownMatchSelectWidth={true}
                >
                  {
                    facts && facts.map((obj, index) => {
                      return (
                        <Option key={index} value={obj.mergekey}>
                          <Tooltip placement='left' title={getTooltip(obj.aqjxdata)} tooltip>
                            {obj.mergekey}：{`${obj.aqjxdata['案情摘要']}`}
                          </Tooltip>
                        </Option>
                      )
                    })
                  }
                </Select>
              )
            }
          </div>
        </Col>
      )
    }

    return (
      <Col span={24}
           className={styles.formItem}
           key={item.label}>
        <div className={styles.label}>{item.required && item.required === 'true' &&
        <span style={ruleRequiredStyle}>*</span>}{item.label}</div>
        <div className={styles.content}>
          {
            getFieldDecorator(`${item.path}`, {
              initialValue: _.endsWith(initialValue, '其他') ? '其他' : correctArr,
              getValueFromEvent: value => {
                let newVal = value;
                if (isMultiple) {
                  if (_.indexOf(value, '否') > -1) {
                    newVal = value.length > 1 && _.indexOf(value, '否') === 0 ? _.drop(value) : ['否']
                  } else if (_.indexOf(value, '无') > -1) {
                    newVal = value.length > 1 && _.indexOf(value, '无') === 0 ? _.drop(value) : ['无']
                  }
                }
                return newVal
              }
            })(<Select placeholder={`请选择${item.label}`}
                       style={{width: '50%', marginLeft: 10}}
                       mode={isMultiple && "multiple"}
                       onChange={(value) => {
                         let newValue = value;
                         if (_.indexOf(value, '否') > -1) {
                           newValue = value.length > 1 && _.indexOf(value, '否') === 0 ? _.drop(value) : ['否']
                         } else if (_.indexOf(value, '无') > -1) {
                           newValue = value.length > 1 && _.indexOf(value, '无') === 0 ? _.drop(value) : ['无']
                         }
                         this.save(item, newValue)
                       }}
                       dropdownMatchSelectWidth={true}>
              {
                optionArr && optionArr.length > 0 ? optionArr.map((dic, idx) => {
                  return (
                    <Option key={idx} data={dic} value={dic} style={{width: '100%'}}>
                      <Tooltip placement='left' title={dic}>
                        {dic}
                      </Tooltip>
                    </Option>
                  )
                }) : ''
              }
            </Select>)
          }
          {
            ((docNlp && (docNlp.title === '起诉意见书' || docNlp.title === '提请批准逮捕书')) && _.indexOf(akLabel, item.label) > -1) ? currentXyr ? currentXyr[item.label] === _.join(correctArr, ',') ?
              <Tooltip title={currentXyr && currentXyr[item.label]}><Icon type="check-circle" theme="filled"
                                                                          style={{color: '#52c41a'}}/></Tooltip> :
              <Tooltip title={currentXyr && currentXyr[item.label]}><Icon type="exclamation-circle" theme="filled"
                                                                          style={{color: '#F9AC14'}}/></Tooltip> :
              <Tooltip title={'案卡中没有该嫌疑人信息'}><Icon type="close-circle" theme="filled"
                                                     style={{color: '#f4222d'}}/></Tooltip> : null
          }
          {
            isMultiple === false && (_.endsWith(correctArr[0], '其他') || _.endsWith(correctArr, '其他')) ?
              getFieldDecorator(`${item.path}-other`, {
                initialValue: otherIinitVal ? otherIinitVal : []
              })(
                <Select
                  mode="tags"
                  tokenSeparators={[',']}
                  style={{width: '50%', marginLeft: 10, marginTop: 3}}
                  onChange={(value, option) => {
                    const _value = _.cloneDeep(value);
                    _value.push('其他');
                    this.save(item, _value)
                  }}
                >
                  <Option key={1}/>
                </Select>
              ) : ''
          }
        </div>
      </Col>
    )

  };

  /**
   *
   * @param item 待渲染的组件数据
   * @param onlyOne 是否只有一个，如果是，渲染全行
   * @returns {*}
   */
  renderTextArea = (item, onlyOne, currentXyr) => {
    const {form: {getFieldDecorator}, importData, dropData, xyrJbxx, docNlp} = this.props;
    const {importVisible, factContent} = this.state;
    const labelTitle = item.label;
    const leftLadelTitle = labelTitle.substring(0, 6);
    const rightLabelTitle = labelTitle.substring(6);
    const newLine = <div>
      <div>{leftLadelTitle}</div>
      <div>{rightLabelTitle}</div>
    </div>;

    const propertyHasMain = !!item.property && item.property.indexOf('main') !== -1;

    const akLabel = ['犯罪嫌疑人姓名', '户籍所在地', '住址', '身份证号码'];

    return (
      <Col span={24}
           className={styles.formItem}
           key={item.path}>
        {((!onlyOne) || propertyHasMain) &&
        <div className={styles.label} title={labelTitle}>{item.required && item.required === 'true' &&
        <span style={ruleRequiredStyle}>*</span>}{labelTitle.length > 7 ? newLine : labelTitle}</div>}
        <div className={styles.content}>
          {
            importData && propertyHasMain ?
              <NlpWrapper
                onOcrClick={() => this.onOcrClick(item)}
                onDropdownClick={this.onDropdownClick}
                onMenuClick={this.onMenuClick}
                importVisible={importVisible ? true : factContent.length > 0 && factContent !== 'newrdss'}
                dropData={dropData}
              >
                {
                  getFieldDecorator(`${item.path}`, {
                    initialValue: item.content || '',
                  })(<TextArea autosize={{minRows: 3, maxRows: 12}}
                               onClick={this.onInputClick}
                               style={{width: '95%'}}
                               onBlur={() => this.save(item)}/>)
                }
                {
                  ((docNlp && (docNlp.title === '起诉意见书' || docNlp.title === '提请批准逮捕书')) && _.indexOf(akLabel, labelTitle) > -1) ? currentXyr ? currentXyr[item.label] === item.content ?
                    <Tooltip title={currentXyr && currentXyr[labelTitle]}><Icon type="check-circle" theme="filled"
                                                                                      style={{color: '#52c41a'}}/></Tooltip> :
                    <Tooltip title={currentXyr && currentXyr[labelTitle]}><Icon type="exclamation-circle"
                                                                                      theme="filled"
                                                                                      style={{color: '#F9AC14'}}/></Tooltip> :
                    <Tooltip title={'案卡中没有该嫌疑人信息'}><Icon type="close-circle" theme="filled"
                                                         style={{color: '#f4222d'}}/></Tooltip> : null
                }
              </NlpWrapper> :
              <OcrWrapper onClick={() => this.onOcrClick(item)}>
                {
                  getFieldDecorator(`${item.path}`, {
                    initialValue: item.content || '',
                  })(<TextArea autosize={{maxRows: 12}}
                               onClick={this.onInputClick}
                               style={{width: '95%'}}
                               onBlur={() => this.save(item)}/>)
                }
                {
                  ((docNlp && (docNlp.title === '起诉意见书' || docNlp.title === '提请批准逮捕书')) && _.indexOf(akLabel, labelTitle) > -1) ? currentXyr ? currentXyr[item.label] === item.content ?
                    <Tooltip title={currentXyr && currentXyr[labelTitle]}><Icon type="check-circle" theme="filled"
                                                                                      style={{color: '#52c41a'}}/></Tooltip> :
                    <Tooltip title={currentXyr && currentXyr[labelTitle]}><Icon type="exclamation-circle"
                                                                                      theme="filled"
                                                                                      style={{color: '#F9AC14'}}/></Tooltip> :
                    <Tooltip title={'案卡中没有该嫌疑人信息'}><Icon type="close-circle" theme="filled"
                                                         style={{color: '#f4222d'}}/></Tooltip> : null
                }
              </OcrWrapper>
          }
        </div>
      </Col>
    )
  };

  renderBoolean = (list) => {
    const {onlyBool} = this.state;
    return <BoolNlp list={list} onlyBool={onlyBool} onSave={this.save}/>
  };

  renderSelect = (item) => {
    const {dictionaries = [], form: {getFieldDecorator, setFieldsValue}, data} = this.props;
    if (!item || !dictionaries || _.isEmpty(dictionaries)) {
      return null;
    }

    if (!dictionaries[item.label]) {
      return null;
    }

    const getTooltip = (data) => (
      <div className={styles.tooltip}>
        {
          _.map(data, (v, k) => {
            if (k === '案情摘要') {
              return (<p key={k}><span>{k}</span> : <span>{v}</span></p>)
            }
          })
        }
      </div>
    );

    const onChange = (d, value, label, option, multiple) => {
      if (label === '侦查机关认定的事实') {
        this.setState({
          factContent: value,
        });
      }

      const listKey = _.get(data, 'listname.content');

      if (!_.isEmpty(listKey)) {
        const mainItem = _.get(data, listKey);
        const {path} = mainItem;

        if (multiple && _.isEmpty(option)) {
          setFieldsValue(_.set({}, path, []));
          return;
        }

        const {data: dic} = multiple ? option[0].props : option.props;

        if (!_.isEmpty(dic)) {
          if (label === '侦查机关认定的事实') {
            setFieldsValue(_.set({}, path, value));
            this.save(mainItem, value);
          }
        } else {
          setFieldsValue(_.set({}, path, ''));
          this.save(mainItem, '');

        }
      }

      this.save(d, value);
    };

    const multiple = item.property && item.property.indexOf('multi') >= 0;
    let content = item.content;
    if (multiple) {
      content = _.isEmpty(content) ? undefined : (content.indexOf(',') >= 0 ? content.split(',') : [content]);
    } else {
      content = _.isEmpty(content) ? undefined : content;
    }

    return (
      <Col span={24}
           className={styles.formItem}
           key={item.path}>
        <div className={styles.label}>{item.required && item.required === 'true' &&
        <span style={ruleRequiredStyle}>*</span>}{item.label}</div>
        <div className={styles.content}>
          {
            dictionaries && dictionaries[item.label] && (
              getFieldDecorator(`${item.path}`, {
                initialValue: content,
              })(<Select mode={multiple ? 'multiple' : 'single'}
                         placeholder={`请选择${item.label}`}
                         onChange={(value, option) => onChange(item, value, item.label, option, multiple)}
                         dropdownMatchSelectWidth={true}>
                {
                  dictionaries[item.label].map((dic, idx) => {
                    return (
                      <Option key={idx} data={dic} value={dic.mergekey} style={{width: '100%'}}>
                        <Tooltip placement='left' title={getTooltip(dic.aqjxdata)}
                                 tooltip>{`${dic.mergekey}`}</Tooltip>
                      </Option>
                    )
                  })
                }
                {
                  !multiple && <Option value='newrdss'>新案情</Option>
                }
              </Select>)
            )
          }
        </div>
      </Col>
    )
  };

  renderArray = (item, index) => {
    const {label} = item;
    delete item.label;
    delete item.type;
    delete item.order;

    if (!_.isEmpty(item)) {
      const listnamePath = _.get(item, '0.listname.path');
      return (
        <div className={styles.formItem} key={`${listnamePath}-${index}`}>
          <div className={styles.label}>{item.required && item.required === 'true' &&
          <span style={ruleRequiredStyle}>*</span>}{label}</div>
          <div className={styles.content}>
            <SubComponent addNLP={this.props.addNLP}
                          data={item}
                          listnamePath={listnamePath}
                          renderItem={this.renderItem}/>
          </div>
        </div>
      );
    }
    return null;
  };

  @Bind()
  @Debounce(600)
  onInputClick = (e) => {
    const position = cursorPosition.get(e.target);
    window._currentCursorTarget = e.target;
    window._currentCursorPosition = position;
  };

  @Bind()
  @Debounce(600)
  onOcrClick = (item) => {
    if (!item) {
      return;
    }
    const {saveNLP} = this.props;
    const {path} = item;
    const {getFieldValue, setFieldsValue} = this.props.form;
    window.ocrListener = (value) => {
      const values = {};
      if (window._currentCursorTarget && window._currentCursorPosition) {
        try {
          cursorPosition.add(window._currentCursorTarget, window._currentCursorPosition, value);
        } catch (e) {
          const values = {};
          values[path] = (getFieldValue(path) || '') + value;
          setFieldsValue && setFieldsValue(values);
          const position = cursorPosition.get(window._currentCursorTarget);
          window._currentCursorPosition = position;
        }
        try {
          cursorPosition.fireKeyEvent(window._currentCursorTarget, 'keydown', 13);
        } catch (e) {
        }
        const values = {};
        values[path] = window._currentCursorTarget.value;
        setFieldsValue && setFieldsValue(values);
        const position = cursorPosition.get(window._currentCursorTarget);
        window._currentCursorPosition = position;
      } else {
        const values = {};
        values[path] = (getFieldValue(path) || '') + value;
        setFieldsValue && setFieldsValue(values);
      }
      item.content = values[path];
      const _item = _.cloneDeep(item);
      delete _item.label;

      if (item.type && item.type.split('|')[0] === 'datetime') {
        item.content = getFieldValue(path);
        this.save(item, undefined);
      }
      saveNLP && saveNLP(_item);
    }
  };


  save = (item, value) => {
    const _item = _.cloneDeep(item);
    this.props.form.validateFields([`${item.path}`], (err, fieldsValue) => {
      if (!err) {
        const {form: {getFieldValue}} = this.props;
        if (value === undefined) {
          if (_item && _item.path) {
            if (item.type && item.type.split('|')[0] === 'datetime') {
              this.props.saveNLP && this.props.saveNLP(_item);
              this.props.ifSave && this.props.ifSave(true, this.state.data);
            }
            const value = getFieldValue(_item.path);
            if (_item.type === 'string' || _item.type === 'textarea' || _item.type === 'number') {
              _item.content = Array.isArray(value) ? value.join(',') : value;
              item.content = _item.content;
              delete _item.label;
              delete _item.order;
              this.props.saveNLP && this.props.saveNLP(_item);
              this.props.ifSave && this.props.ifSave(true, this.state.data);
            } else {
              if (!_.isEmpty(value)) {
                _item.content = Array.isArray(value) ? value.join(',') : value;
                item.content = _item.content;
                delete _item.label;
                delete _item.order;
                this.props.saveNLP && this.props.saveNLP(_item);
                this.props.ifSave && this.props.ifSave(true, this.state.data);
              }
            }
          }
        } else {
          if (_item && _item.path) {
            if (_.isBoolean(value)) {
              value = value ? '是' : '否';
            }
            _item.content = Array.isArray(value) ? value.join(',') : value;
            item.content = _item.content;
            delete _item.label;
            delete _item.order;
            this.props.saveNLP && this.props.saveNLP(_item);
            this.props.ifSave && this.props.ifSave(true, this.state.data);
          }
        }
      } else {
        this.props.ifSave && this.props.ifSave(false, this.state.data);
      }
    });
  };

  onDropdownClick = () => {
    const {form: {getFieldsValue}} = this.props;
    const fieldsValue = getFieldsValue();
    const mergekey = _.values(_.find(fieldsValue, (v, k) => k.indexOf('侦查机关认定的事实') > 0)).join('');
    this.props.onDropdownClick(mergekey);
  };

  onMenuClick = (keyPath) => {
    this.props.onMenuClick(keyPath);


    const {form: {getFieldsValue, setFieldsValue}, dropData} = this.props;
    const path = [];
    let gszlPath = '';
    _.map(getFieldsValue(), (v, k) => {
      if (k.indexOf('侦查机关认定的事实') > 0 || k.indexOf('案件名称') > 0) {
        path.push(k);
      }
      if (k.indexOf('案情摘要') > 0) {
        gszlPath = k;
      }
    });

    let newImportData = {};
    if (_.indexOf(keyPath, '认定事实') === -1) {
      newImportData = _.find(dropData, function (o) {
        return o.cs === keyPath[0] && o.mergekey === keyPath[1];
      });
    } else {
      newImportData = _.find(dropData, function (o) {
        return o.mergekey === keyPath[0] && !o.owner;
      });
    }
    ;

    const fact = newImportData.nlpdata && _.get(newImportData.nlpdata, '案件名称') && _.get(newImportData.nlpdata, '案件名称').content;

    let obj = {};
    fact && path.forEach(item => {
      obj[item] = fact
    });
    setFieldsValue(obj);
    let gszlObj = {};
    gszlObj[gszlPath] = newImportData.nlpdata && _.get(newImportData.nlpdata, '供述摘录') ? _.get(newImportData.nlpdata, '供述摘录').content : _.get(newImportData.nlpdata, '案情摘要').content;
    setFieldsValue(gszlObj);
  };
}

class SubComponent extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      visible: true,
    }
  }

  render() {
    const {data, listnamePath, renderItem} = this.props;

    return (
      <div className={styles.subComponent}>
        <div className={styles.subOperation}>
          <a className={styles.toggleTrigger}
             onClick={() => this.setState({visible: !this.state.visible})}>
            <Icon type={this.state.visible ? 'down' : 'right'}/></a>
          <a className={styles.addTrigger}
             onClick={() => {
               this.props.addNLP && this.props.addNLP(listnamePath);
             }}><Icon type='plus'/> 新增</a>
        </div>
        <div className={classnames(styles.subContent, this.state.visible ? '' : styles.hidden)}>
          {
            _.map(data, d => renderItem(d, true))
          }
        </div>
      </div>
    )
  }
}
