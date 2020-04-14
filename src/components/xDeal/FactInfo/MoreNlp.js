import React, {PureComponent} from 'react';
import {Row, Col, Icon, Form, Input, Select, Dropdown, Tooltip, Button, Modal} from 'antd';
import _ from 'lodash';
import classnames from 'classnames';
import moment from 'moment';
import Bind from 'lodash-decorators/bind';
import Debounce from 'lodash-decorators/debounce';
import OcrWrapper from 'lib/OcrWrapper';
import NlpWrapper from 'lib/NlpWrapper';
import {cursorPosition} from 'utils/utils';
import BoolNlp from '../NlpInfo/BoolNlp';
import styles from './MoreNlp.less';
import AddModal from './AddModal';
import Time from '../Time';

const {Item: FormItem} = Form;
const {TextArea} = Input;
const {Option} = Select;
const ruleRequiredStyle = {
  color: 'red',
  fontSize: '18px',
  marginRight: '2px'
};

@Form.create()
export default class MoreNlp extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      showZl: false,
      subVisible: false,
      tips:''
    };
  }

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
            if (_item.type && _item.type.split('|')[0] === 'datetime') {
              this.props.saveNLP && this.props.saveNLP(_item);
              this.props.ifSave && this.props.ifSave(true);
            }

            const value = getFieldValue(_item.path);
            if (_item.type === 'string' || _item.type === 'textarea' || _item.type === 'number') {
              _item.content = Array.isArray(value) ? value.join(',') : value;
              item.content = _item.content;
              delete _item.label;
              delete _item.order;
              this.props.saveNLP && this.props.saveNLP(_item);
              this.props.ifSave && this.props.ifSave(true);
            } else {
              if (!_.isEmpty(value)) {
                _item.content = Array.isArray(value) ? value.join(',') : value;
                item.content = _item.content;
                delete _item.label;
                delete _item.order;
                this.props.saveNLP && this.props.saveNLP(_item);
                this.props.ifSave && this.props.ifSave(true);
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
            this.props.ifSave && this.props.ifSave(true);
          }
        }
      } else {
        this.props.ifSave && this.props.ifSave(false);
      }
    });
  };

  renderItem = (data, subOfArray) => {

    data = _.cloneDeep(data);

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
        if (v.type === 'string' && !v.enume &&  v.property && v.property.indexOf('main') >= 0) {
          type = 'textarea';
        }
        if (v.type === 'string' && !v.enume && v.content && v.content.length > 25) {
          type = 'textarea';
        }
        if (v.type === 'string' && !v.enume && v.property && v.property.indexOf('multiple') >= 0) {
          type = 'textarea';
        }


        if (v.type && v.type.split('|')[0] === 'enume' || v.type && v.type.split('|')[0] === 'multiple' ||
          v.type && v.type.split('|')[0] === 'datetime' && v.type.split('|')[1] || v.type === 'money' || v.type === 'peopleNum' || v.type === 'number') {
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
    const onlyOneOthers = subOfArray && _.filter(others, v => v.type !== 'unknown' && v.path.indexOf('listname') < 0).length === 1;


    const keyProps = {};
    if (subOfArray) {
      keyProps.key = _.get(data, 'listname.path');
    }

    return (
      <div {...keyProps} className={classnames(styles.panel, subOfArray ? styles.arrayList : '')}>
        <Row>
          {
            !_.isEmpty(others) && _.map(others, v => {
              let formItem = null;
              if (v.type === 'string' && v.label === 'listname') {
                v.type = 'unknown';
              }
              switch (v.type && v.type.split('|')[0]) {
                case 'string':
                  if (v && v.property && v.property.indexOf('hide') >= 0) {
                    break;
                  }
                  formItem = this.renderString(v, onlyOneOthers);
                  break;
                case 'textarea':
                  formItem = this.renderTextArea(v, onlyOneOthers);
                  break;
                case 'enume':
                  formItem = this.renderEnume(v);
                  break;
                case 'multiple':
                  formItem = this.renderEnume(v, true);
                  break;
                case 'datetime':
                  formItem = this.renderDateTime(v);
                  break;
                case 'select':
                  formItem = this.renderSelect(v);
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
            !_.isEmpty(arrays) && _.map(arrays, (array, idx) => this.renderArray(array, idx))
          }
        </Row>
        <Row>
          {
            !_.isEmpty(bools) && this.renderBoolean(bools)
          }
        </Row>
      </div>
    )
  };

  renderString = (item, onlyOne) => {
    if (item.enume) {
      let selectItem = null;
      switch (item.enume && item.enume.split('|')[0]) {
        case 'single' :
          selectItem = this.renderGyshEnume(item);
          break;
        case 'multiple' :
          selectItem = this.renderGyshEnume(item, true);
          break;
        default:
          selectItem = this.renderGyshEnume(item);
      }
      return selectItem;
    } else {
      return (
        this.renderSimpleString(item, onlyOne)
      )
    }
  };

  /**
   *
   * @param item 待渲染的组件数据
   * @param onlyOne 是否只有一个，如果是，渲染全行
   * @returns {*}
   */
  renderSimpleString = (item, onlyOne) => {
    const {form: {getFieldDecorator, getFieldValue}} = this.props;
    const {factContent} = this.state;

    const longText = item.content && item.content.length > 18;
    const inputDisabled = item.label === '案件名称' && !!factContent && factContent.length > 0 && factContent !== 'newrdss';

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

    return (
      <Col span={longText || onlyOne ? 24 : 24}
           key={item.label}
           className={styles.formItem}>
        {!onlyOne && <div className={styles.label} title={item.label}>{item.required && item.required === 'true' &&
        <span style={ruleRequiredStyle}>*</span>}{item.label}</div>}
        <div className={styles.content}>
          {
            inputDisabled && getFieldDecorator(`${item.path}`, fieldOption)(
              <Input onBlur={() => this.save(item, undefined)}
                     disabled={inputDisabled}/>)
          }
          {
            !inputDisabled && (
              <OcrWrapper onClick={() => this.onOcrClick(item)}>
                <Tooltip placement="top"
                         visible={item.label && item.label === '时间' || item.label === '交通事故发生时间' ? false : getFieldValue(item.path) && getFieldValue(item.path).length > 25 ? true : false}
                         title={getFieldValue(item.path)}
                         trigger="click">
                  {
                    getFieldDecorator(`${item.path}`, fieldOption)(
                      <Input
                        onClick={this.onInputClick}
                        onBlur={() => this.save(item, undefined)}
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

  handleInput = (e, path) => {
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

    // const shLevel = ['一级', '二级', '三级', '四级', '五级', '六级'];
    // let levelData;
    // const onChange = (o, v) => {
    //   levelData = v;
    //   this.save(o, v)
    // };
    //
    // if (type === 'people') {
    //   return (
    //     <Col span={24}
    //          className={styles.formItem}
    //          key={item.label}>
    //       <div className={styles.label}>
    //         {item.required && item.required === 'true' && <span style={ruleRequiredStyle}>*</span>}{item.label}
    //       </div>
    //       <div className={styles.content}>
    //         <OcrWrapper onClick={() => this.onOcrClick(item)}>
    //           {
    //             getFieldDecorator(`${item.path}-level`, {
    //               initialValue: content,
    //             })(
    //               <Select
    //                 style={{width: '50%', marginLeft: 10}}
    //                 onChange={(value) => onChange(item, value)}
    //               >
    //                 {shLevel.map(o => <Option key={o}>{o}</Option>)}
    //               </Select>
    //             )
    //           }
    //           {
    //             getFieldDecorator(`${item.path}`, {
    //               initialValue: content ? type === 'number' ? content.replace(/\D/g, '') : Number(content) === 0 ? '0' : parseFloat(content) : '',
    //             })(
    //               <Input
    //                 type={content && "number"}
    //                 maxLength={25}
    //                 min="0"
    //                 onBlur={() => this.save(item, undefined)}
    //                 className={styles.numInput}
    //                 onInput={(e) => this.handleInput(e, item.path)}
    //                 addonAfter={addonAfterContent}
    //               />
    //             )
    //           }
    //         </OcrWrapper>
    //       </div>
    //     </Col>
    //   )
    // }
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
  renderTextArea = (item, onlyOne) => {
    const {form: {getFieldDecorator}, importData, dropData} = this.props;
    const {importVisible, factContent} = this.state;

    const propertyHasMain = !!item.property && item.property.indexOf('main') !== -1;

    return (
      <Col span={24}
           className={styles.formItem}
           key={item.label}>
        {((!onlyOne) || propertyHasMain) &&
        <div className={styles.label} title={item.label}>{item.required && item.required === 'true' &&
        <span style={ruleRequiredStyle}>*</span>}{item.label}</div>}
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
                               onBlur={() => this.save(item)}/>)
                }
              </NlpWrapper> :
              <OcrWrapper onClick={() => this.onOcrClick(item)}>
                {
                  getFieldDecorator(`${item.path}`, {
                    initialValue: item.content || '',
                  })(<TextArea autosize={{maxRows: 12}}
                               onClick={this.onInputClick}
                               onBlur={() => this.save(item)}/>)
                }
              </OcrWrapper>
          }
        </div>
      </Col>
    )
  };

  renderBoolean = (list) => {
    return <BoolNlp list={list} onSave={this.save}/>
  };

  renderEnume = (item, isMultiple = false) => {
    const {enumerate} = this.props;
    const {getFieldDecorator} = this.props.form;
    const cs = item.type && item.type.split('|')[1];
    let initialValues = enumerate[cs] && enumerate[cs].length > 0 ? enumerate[cs].map(item => item.probable_value) : [];
    const i = initialValues.map((i, index) => i && i.indexOf(item.content) !== -1);
    const init = i.indexOf(true) === -1 ? [item.content] : enumerate[cs][i.indexOf(true)];
    let initVal = init.value || init;

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
        </div>
      </Col>
    )
  };

  renderGyshEnume = (item, isMultiple = false) => {
    const {names, enumerate} = this.props;
    const {getFieldDecorator} = this.props.form;
    const cs = item.enume && item.enume.split('|')[1];
    let optionArr = cs.indexOf('_') > -1 ? names : enumerate[cs] && enumerate[cs].length > 0 ? enumerate[cs].map(item => item.value) : [];
    let initialValue = item.content;
    const initialValueArr = initialValue && initialValue.split(',');
    const correctArr = _.intersection(optionArr, initialValueArr);

    let otherIinitVal;
    if (!isMultiple && _.endsWith(initialValue, '其他')) {
      otherIinitVal = initialValue && initialValue.split(',');
      _.remove(otherIinitVal, o => o === '其他')
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

  renderDateTime = (item) => {
    const {form: {getFieldValue, getFieldDecorator, setFieldsValue}} = this.props;
    let content = item.content || getFieldValue(item.path);

    const type = item.type && item.type.split('|');
    const _type = type.length > 1 ? type[1] : '';

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
              <FormItem>
                {
                  getFieldDecorator(`${item.path}`, {
                    rules: [{required: item.required && item.required === 'true', message:this.state.tips ? this.state.tips : `请输入${item.label}`}],
                  })(
                    <Time
                      item={item}
                      initialValue={content}
                      onSave={(item, value,tips) => {
                        if(tips){
                          this.setState({
                            tips:tips
                          },()=>{
                            setFieldsValue({
                              [item.path]: item.content
                            });
                            this.save(item, value)
                          })
                        }else{
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
              </FormItem>
            </OcrWrapper>
          </div>
        </div>
      </Col>
    )
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
           key={item.label}>
        <div className={styles.label}>{item.required && item.required === 'true' &&
        <span style={ruleRequiredStyle}>*</span>}{item.label}</div>
        <div className={styles.content}>
          {
            dictionaries && dictionaries[item.label] && (
              getFieldDecorator(`${item.label}`, {
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
              </Select>)
            )
          }
        </div>
      </Col>
    )
  };

  renderArray = (item, index) => {
    const {ysay} = this.props;
    const {label} = item;
    // delete item.label;
    // delete item.type;
    // delete item.order;

    if (!_.isEmpty(item)) {
      const listnamePath = _.get(item, '0.listname.path');
      const type = ysay === '故意伤害罪' ? _.get(item, '0.属性.enume') : _.get(item, '0.属性.type');
      return (
        <div className={styles.formItem} key={`${listnamePath}-${index}`}>
          <div className={styles.label}>{item.required && item.required === 'true' &&
          <span style={ruleRequiredStyle}>*</span>}{label}</div>
          <div className={styles.content}>
            <SubComponent addNLP={this.props.addNLP}
                          data={item}
                          enumerate={this.props.enumerate}
                          listnamePath={listnamePath}
                          type={type}
                          renderItem={this.renderItem}/>
          </div>
        </div>
      );
    }
    return null;
  };


  /**
   * 渲染数组子元素的删除按钮
   * @param v
   * @param sublabel
   * @param delvalue
   * @returns {*}
   */
  renderDeleteTrigger = (v) => {
    return (
      <div className={styles.deleteTrigger} key={`${v.path}-delete-trigger`}>
        <Button icon='close' size='small'
                shape='circle' type='ghost'
                style={{border: 'none'}}
                onClick={() => {
                  this.props.deleteNLP && this.props.deleteNLP(v.path);
                }}/>
      </div>
    )
  };

  render() {
    const {data} = this.props;
    let sub = _.omitBy(data, v => v.property && v.property.indexOf('main') >= 0);

    return (
      <div className={styles.default}>
        {this.renderItem(sub)}
      </div>
    );
  }
}

class SubComponent extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      showModal: false,
      label: '',
      sxType: ''
    }
  }

  add = (path) => {
    const {type} = this.props;
    const label = _.split(path, '_')[3];
    if (type && type.split('|')[1]) {
      this.setState({
        showModal: true,
        sxType: type.split('|')[1],
        label
      })
    } else {
      this.props.addNLP && this.props.addNLP(path)
    }
    // const cyr = _.split(path, '参与人');
    // const bhr = _.split(path, '被害人');
    // if (cyr.length > 1) {
    //   this.setState({
    //     showModal: true,
    //     label: '参与人'
    //   })
    // } else if (bhr.length > 1) {
    //   this.setState({
    //     showModal: true,
    //     label: '被害人'
    //   })
    // } else {
    //   this.props.addNLP && this.props.addNLP(path)
    // }

  };

  hideModelHandler = () => {
    this.setState({
      showModal: false
    })
  };

  render() {
    const {data, listnamePath, renderItem} = this.props;
    const {showModal, sxType, label} = this.state;
    const _data = _.cloneDeep(data);
    delete _data.label;
    delete _data.type;
    delete _data.order;

    return (
      <div className={styles.subComponent}>
        <div className={styles.subOperation}>
          <a className={styles.toggleTrigger}
             onClick={() => this.setState({visible: !this.state.visible})}>
            <Icon type={this.state.visible ? 'down' : 'right'}/></a>
          <a className={styles.addTrigger}
             onClick={() => this.add(listnamePath)}>
            <Icon type='plus'/> 新增</a>
        </div>
        <div className={classnames(styles.subContent, this.state.visible ? '' : styles.hidden)}>
          {
            _.map(_data, (d) => {
                return ( renderItem(d, true))
              }
            )
          }
        </div>
        <AddModal showModal={showModal}
                  hideModelHandler={this.hideModelHandler}
                  addNLP={this.props.addNLP}
                  enumerate={this.props.enumerate}
                  listnamePath={listnamePath}
                  label={label}
                  sxType={sxType}/>
      </div>
    )
  }
}
