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
import BoolNlp from '../NlpInfo/BoolNlp';
import styles from './MoreNlp.less';
import AddModal from './AddModal';
import Time from '../Time';

const {TextArea} = Input;
const {Option} = Select;

@Form.create()
export default class MoreNlp extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,

      showZl: false,
      subVisible: false
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
    let {path, label} = item;
    path = path || label;
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

      if(item.type && item.type.split('|')[0] === 'datetime'){
        item.content = getFieldValue(path);
        this.save(item,undefined);
      }
      saveNLP && saveNLP(_item);
    }
  };


  save = (item, value, sublabel, subIndex) => {    //,,嫌疑人||被害人，索引
    const _item = _.cloneDeep(item);
    this.props.form.validateFields((err, fieldsValue) => {
      if (!err) {
        const {form: {getFieldValue}} = this.props;
        if (value === undefined) {
          if (_item && _item.label) {
            if (_item.type && _item.type.split('|')[0] === 'datetime') {
              this.props.saveNLP && this.props.saveNLP(item.label, _item, sublabel, subIndex);
              this.props.ifSave && this.props.ifSave(true);
            }
            const value = getFieldValue(sublabel ? sublabel + '_' + _item.label + '_' + subIndex : _item.label);
            if (_item.type === 'string' || _item.type === 'textarea'|| _item.type === 'number') {
              _item.content = Array.isArray(value) ? value.join(',') : value;
              item.content = _item.content;
              delete _item.label;
              delete _item.order;
              this.props.saveNLP && this.props.saveNLP(item.label, _item, sublabel, subIndex);
              this.props.ifSave && this.props.ifSave(true);
            } else {
              if (!_.isEmpty(value)) {
                _item.content = Array.isArray(value) ? value.join(',') : value;
                item.content = _item.content;
                delete _item.label;
                delete _item.order;
                this.props.saveNLP && this.props.saveNLP(item.label, _item, sublabel, subIndex);
                this.props.ifSave && this.props.ifSave(true);
              }
            }
          }
        } else {
          if (_item && _item.label) {
            if (_.isBoolean(value)) {
              value = value ? '是' : '否';
            }
            _item.content = Array.isArray(value) ? value.join(',') : value;
            item.content = _item.content;
            delete _item.label;
            delete _item.order;
            this.props.saveNLP && this.props.saveNLP(item.label, _item, sublabel, subIndex);
            this.props.ifSave && this.props.ifSave(true);
          }
        }
      } else {
        this.props.ifSave && this.props.ifSave(false);
      }
    });

  };

  renderItem = (data, subOfArray, sublabel, subIndex) => {

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
        if (v.type === 'string' && v.property && v.property.indexOf('main') >= 0) {
          type = 'textarea';
        }
        if (v.type === 'string' && v.content && v.content.length > 10) {
          type = 'textarea';
        }
        if (v.type === 'string' && v.property && v.property.indexOf('multiple') >= 0) {
          type = 'textarea';
        }

        if (v.type && v.type.split('|')[0] === 'enume' || v.type && v.type.split('|')[0] === 'multiple' ||
          v.type && v.type.split('|')[0] === 'datetime' && v.type.split('|')[1] || v.type === 'money' || v.type === 'peopleNum'|| v.type === 'number') {
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

    return (
      <div {...keyProps} className={classnames(styles.panel, subOfArray ? styles.arrayList : '')}>
        <Row>
          {
            !_.isEmpty(others) && _.map(others, v => {
              let formItem = null;
              switch (v.type && v.type.split('|')[0]) {
                case 'string':
                  formItem = this.renderString(v, onlyOneOthers, sublabel, subIndex);
                  break;
                case 'textarea':
                  formItem = this.renderTextArea(v, onlyOneOthers);
                  break;
                case 'select':
                  formItem = this.renderSelect(v);
                  break;
                case 'datetime':
                  formItem = this.renderDateTime(v);
                  break;
                case 'enume':
                  formItem = this.renderEnume(v, onlyOneOthers, sublabel, subIndex);
                  break;
                case 'multiple':
                  formItem = this.renderEnume(v, onlyOneOthers, sublabel, subIndex, true);
                  break;
                case 'money':
                  formItem = this.renderNum(v, sublabel, subIndex,'money');
                  break;
                case 'number':
                  formItem = this.renderNum(v, sublabel, subIndex,'number');
                  break;
                case 'peopleNum':
                  formItem = this.renderNum(v, sublabel, subIndex, 'people');
                  break;
                case 'unknown':
                  if (subOfArray && v.label === 'listname') {
                    formItem = this.renderDeleteTrigger(v, sublabel, data, subIndex);
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
            !_.isEmpty(arrays) && _.map(arrays, (array, idx) => this.renderArray(array, idx, sublabel))
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

  handleInput = (e, path) => {
    let newValue = e.target.value.replace(/\D/g, '');
    this.props.form.setFieldsValue({
      [path]: newValue
    })
  };

  /**
   * 数字输入框
   * @param item
   * @param sublabel
   * @param subIndex
   * @returns {XML}
   */
  renderNum = (item, sublabel, subIndex, type) => {
    const {getFieldDecorator, getFieldValue} = this.props.form;
    let content = item.content || getFieldValue(item.path);
    let addonAfterContent;
    switch (type) {
      case 'people':
        addonAfterContent = <span>人</span>;
        break;
      case 'money':
        addonAfterContent = <span>元（人民币）</span>
        break;
      default:
        addonAfterContent = null
    }

    const path = sublabel ? sublabel + '_' + item.label + '_' + subIndex : item.label;
    item.path = path;

    return (
      <Col span={24}
           className={styles.formItem}
           key={item.label}>
        <div className={styles.label}>{item.label}</div>
        <div className={styles.content}>
          <OcrWrapper onClick={() => this.onOcrClick(item)}>
            {
              getFieldDecorator(`${path}`, {
                initialValue: content ? type === 'number' ? content.replace(/\D/g, '') : Number(content) === 0 ? '0' : parseFloat(content) : '',
              })(
                <Input
                  type={content&&"number"}
                  min="0"
                  maxLength={25}
                  onClick={this.onInputClick}
                  onBlur={() => this.save(item, undefined, sublabel, subIndex)}
                  style={{width: '100%'}}
                  onInput={(e) => this.handleInput(e, path)}
                  addonAfter={addonAfterContent}
                />
              )
            }
          </OcrWrapper>
        </div>
      </Col>
    )
  }

  /**
   *
   * @param item 待渲染的组件数据
   * @param onlyOne 是否只有一个，如果是，渲染全行
   * @returns {*}
   */
  renderString = (item, onlyOne, sublabel, subIndex) => {
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

    const path = sublabel ? sublabel + '_' + item.label + '_' + subIndex : item.label;
    item.path = path;

    return (
      <Col span={longText || onlyOne ? 24 : 24}
           key={path}
           className={styles.formItem}>
        {!onlyOne && <div className={styles.label} title={item.label}>{item.label}</div>}
        <div className={styles.content}>
          {
            inputDisabled && getFieldDecorator(`${path}`, fieldOption)(
              <Input onBlur={() => this.save(item, undefined, sublabel, subIndex)}
                     disabled={inputDisabled}/>)
          }
          {
            !inputDisabled && (
              <OcrWrapper onClick={() => this.onOcrClick(item)}>
                <Tooltip placement="top"
                         visible={item.type && getFieldValue(path) && getFieldValue(path).length > 10 ? true : false}
                         title={getFieldValue(path)}
                         trigger="click">
                  {
                    getFieldDecorator(`${path}`, fieldOption)(
                      <Input
                        onClick={this.onInputClick}
                        onBlur={() => this.save(item, undefined, sublabel, subIndex)}
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

  renderDateTime = (item) => {
    const {form: {getFieldValue,getFieldDecorator}} = this.props;
    let content = item.content || getFieldValue(item.path);

    const type = item.type && item.type.split('|');
    const _type = type.length > 1 ? type[1] : '';

    return (
      <Col span={24}
           key={item.label}
           className={styles.formItem}>
        <div className={styles.label} title={item.label}>{item.label}</div>
        <div className={styles.content}>
          <div className={styles.dateTime}>
            <OcrWrapper onClick={() => this.onOcrClick(item)}>
              {
                getFieldDecorator(`${item.path}`, {})(
                  <Time
                    item={item}
                    initialValue={content}
                    onSave={this.save}
                    type={_type}
                  />
                )
              }
            </OcrWrapper>
          </div>
        </div>
      </Col>
    )
  };

  renderEnume = (item, onlyOne, sublabel, subIndex, isMultiple = false) => {
    const {enumerate} = this.props;
    const {getFieldDecorator} = this.props.form;
    const cs = item.type && item.type.split('|')[1];

    let initialValues = enumerate[cs] && enumerate[cs].length > 0 ? enumerate[cs].map(item => item.probable_value) : [];
    const i = initialValues.map((i, index) => i && i.indexOf(item.content) !== -1);
    const init = i.indexOf(true) === -1 ? [item.content] : enumerate[cs][i.indexOf(true)];

    const path = sublabel ? sublabel + '_' + item.label + '_' + subIndex : item.label;
    item.path = path;
    let initVal = init.value || init;

    return (
      <Col span={24}
           className={styles.formItem}
           key={item.label}>
        <div className={styles.label}>{item.label}</div>
        <div className={styles.content}>
          {
            getFieldDecorator(`${path}`, {
              initialValue: isMultiple ? _.isArray(initVal) ? initVal[0] && initVal[0].split(',')|| []: initVal && initVal.split(',') : initVal,
              getValueFromEvent: value => {
                return isMultiple && _.indexOf(value, '否') > -1 ? value.length > 1 && _.indexOf(value, '否') === 0 ? _.drop(value) : ['否'] : value;
              }
            })(<Select placeholder={`请选择${item.label}`}
                       style={{width: '66%'}}
                       mode={isMultiple && "multiple"}
                       onChange={(value, option) => {
                         let newValue = _.indexOf(value, '否') > -1 ? value.length > 1 && _.indexOf(value, '否') === 0 ? _.drop(value) : ['否'] : value;
                         this.save(item, newValue, sublabel, subIndex)
                       }}
                       dropdownMatchSelectWidth={true}>
              {
                enumerate[cs] && enumerate[cs].length > 0 ? enumerate[cs].map((dic, idx) => {
                  return (
                    <Option key={idx} data={dic} value={dic.value} style={{width: '100%'}}>
                      {dic.value}
                    </Option>
                  )
                }) : ''
              }
            </Select>)
          }


        </div>
      </Col>
    )
  }

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
        {((!onlyOne) || propertyHasMain) && <div className={styles.label} title={item.label}>{item.label}</div>}
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
                  getFieldDecorator(`${item.label}`, {
                    initialValue: item.content || '',
                  })(<TextArea autosize={{minRows: 3, maxRows: 12}}
                               onClick={this.onInputClick}
                               onBlur={() => this.save(item)}/>)
                }
              </NlpWrapper> :
              <OcrWrapper onClick={() => this.onOcrClick(item)}>
                {
                  getFieldDecorator(`${item.label}`, {
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
           key={item.label}>
        <div className={styles.label}>{item.label}</div>
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
    // delete item.label;
    // delete item.type;
    // delete item.order;

    if (!_.isEmpty(item)) {
      const listnamePath = _.get(item, '0.listname.path');
      return (
        <div className={styles.formItem} key={`${listnamePath}-${index}`}>
          <div className={styles.label}>{label}</div>
          <div className={styles.content}>
            <SubComponent addNLP={this.props.addNLP}
                          data={item}
                          enumerate={this.props.enumerate}
                          listnamePath={listnamePath}
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
  renderDeleteTrigger = (v, sublabel, delvalue, subIndex) => {
    return (
      <div className={styles.deleteTrigger} key={`${v.path}-delete-trigger`}>
        <Button icon='close' size='small'
                shape='circle' type='ghost'
                style={{border: 'none'}}
                onClick={() => {
                  this.props.deleteNLP && this.props.deleteNLP(sublabel, delvalue, subIndex);
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
      label: ''
    }
  }

  add = (path, listnamePath) => {
    const cyr = _.split(path, '嫌疑人');
    const bhr = _.split(path, '被害人');
    const xyr = _.split(path, '嫌疑人');

    if (cyr.length > 1) {
      this.setState({
        showModal: true,
        label: '嫌疑人'
      })
    } else if (bhr.length > 1) {
      this.setState({
        showModal: true,
        label: '被害人'
      })
    } else if (xyr.length > 1) {
      this.setState({
        showModal: true,
        label: '嫌疑人'
      })
    } else {
      this.props.addNLP && this.props.addNLP(path)
    }

  };

  hideModelHandler = () => {
    this.setState({
      showModal: false
    })
  };

  render() {
    const {data, listnamePath, renderItem} = this.props;
    const {showModal, label} = this.state;
    const _data = _.cloneDeep(data);
    delete _data.label;
    delete _data.type;
    delete _data.order;
    const mainLabel = data.label;

    return (
      <div className={styles.subComponent}>
        <div className={styles.subOperation}>
          <a className={styles.toggleTrigger}
             onClick={() => this.setState({visible: !this.state.visible})}>
            <Icon type={this.state.visible ? 'down' : 'right'}/></a>
          <a className={styles.addTrigger}
             onClick={() => {
               this.add(data.label, listnamePath);
             }}><Icon type='plus'/> 新增</a>
        </div>
        <div className={classnames(styles.subContent, this.state.visible ? '' : styles.hidden)}>
          {
            _.map(_data, (d, k) => {
                return ( renderItem(d, true, mainLabel, k))
              }
            )
          }
        </div>
        <AddModal showModal={showModal}
                  hideModelHandler={this.hideModelHandler}
                  addNLP={this.props.addNLP}
                  enumerate={this.props.enumerate}
                  listnamePath={listnamePath}
                  label={label}/>
      </div>
    )
  }
}
