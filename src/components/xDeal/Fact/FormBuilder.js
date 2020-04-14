import React  from "react";
import {Form, Input, Select, InputNumber, DatePicker, Icon, Button} from "antd";
import moment from 'moment';
import _ from 'lodash';
import Time from 'components/xDeal/Time';

const FormItem = Form.Item;
const Option = Select.Option;
const {TextArea} = Input;

const FormBuilder = ({
                       type,
                       label,
                       required,
                       initialValue,
                       item,
                       toggleForm,
                       expend,
                       setFieldsValue,
                       getFieldValue,
                       names,
                       enumerate,
                       getFieldDecorator,
                       itemLayout
                     }) => {

  const labelConverter = {
    '事故发生时间': '时间',
    '交通事故发生时间':'时间',
    '犯罪时间': '时间',
    '造成公私财产直接损失金额':'财产损失',
    '嫌疑人所负责任': '所负责任',
    '嫌疑人': '嫌疑人姓名',
    '被害人': '被害人姓名'
  };

  const rebuildLabel = (k) => {
    let label = k;
    if (labelConverter[k]) {
      label = labelConverter[k];
    } else {
      label = k;
    }
    return label;
  };

  function renderEnume(type, isMultiple = false) {
    const cs = type && type.split('|')[1];
    return (
      <Select placeholder={`请选择${label}`}
              mode={isMultiple && "multiple"}
              dropdownMatchSelectWidth={true}>
        {
          enumerate[cs] && enumerate[cs].length > 0 ? enumerate[cs].map((dic, idx) => {
            return (
              <Option key={Math.random()} data={dic} value={dic.value} style={{width: '100%'}}>
                {dic.value}
              </Option>
            )
          }) : ''
        }
      </Select>
    )
  }

  function handleInput(e, path) {
    let newValue = Number(e.target.value.replace(/\-/g, ""));
    setFieldsValue && setFieldsValue({
      [path]: newValue
    })
  }

  function toggleForms() {
    toggleForm && toggleForm();
  }

  function save(val) {
    setFieldsValue && setFieldsValue({
      [label]: val.content
    })
  }

  function handleSelectInput(value) {
    if (label === '嫌疑人') {
      const currentVal = _.compact(value && value.filter(i => i.trim().length !== 0).map((item) => item.replace(/[0-9]/g, '')));
      setFieldsValue && setFieldsValue({
        [label]: currentVal
      })
    }
  }

  function createField() {
    const children = [];
    let field;
    switch (type && type.split('|')[0]) {
      case 'text':
        field = <Input type='text'/>;
        break;

      case 'enume':
        field = renderEnume(type);
        break;

      case 'multiple':
        field = renderEnume(type, true);
        break;

      case 'textarea':
        const rows = 4;
        field = <TextArea rows={rows} placeholder={label === '分析' ? '事实清楚、证据充足' : ''}/>;
        break;

      case 'select':
        if (type && type.split('|')[1]) {
          const nameArr = names && names.split('、');
          field = <Select mode="multiple" style={{width: '100%'}}>
            {nameArr && nameArr.map((name, index) => {
              return <Option value={name} key={index}>{name}</Option>
            })}
          </Select>
        } else {
          field = <Select mode="tags" style={{width: '100%'}} onBlur={(val) => handleSelectInput(val)}>
            {children}
          </Select>
        }
        break;

      // case 'date':
      //   field = <DatePicker showTime format="YYYY-MM-DD"/>;
      //   break;

      case 'money':
        field = <Input
          type="number"
          maxLength={25}
          min="0"
          onInput={(e) => handleInput(e, label)}
          style={{width: '100%'}}
          addonAfter={<span>元（人民币）</span>}
        />;
        break;

      case 'people':
        field = <Input
          type="number"
          maxLength={25}
          min="0"
          onInput={(e) => handleInput(e, label)}
          style={{width: '100%'}}
          addonAfter={<span>人</span>}
        />;
        break;

      case 'number':
        field = <InputNumber min={0}/>;
        break;

      default:
        field = <Input type='text' addonAfter={label === '价值' ? '元 (人民币)' : null}/>;
        break;
    }

    return field;
  }

  const formItemLayout = itemLayout ? itemLayout : {
    labelCol: {span: 5},
    wrapperCol: {span: 18},
  };

  let initValue = initialValue;
  if ( type && type.split('|')[0] === 'select') {
    if (type.split('|')[1]) {
      if (Array.isArray(initialValue)) {
        _.remove(initValue, o => o.length === 0);
      } else {
        if (typeof (initialValue) === 'string' && initialValue.length > 0) {
          initValue = initialValue && initialValue.split(',') || [];
        } else {
          initValue = [];
        }
      }
    } else {
      if (Array.isArray(initialValue)) {
        if (label === '财物') {
          initValue = _.flattenDeep(initialValue.map((i) => {
              return i.split('、');
            })
          );
        }
        _.remove(initValue, o => o.length === 0);
        // const empty = _.filter(initialValue,o=>o.length === 0);
        // if(empty.length === initialValue.length) {
        //   initValue = [];
        // }
      } else {
        if (typeof(initialValue) === 'string' && initialValue.length > 0) {
          initValue = [initialValue];
        } else {
          initValue = [];
        }
      }
    }
  } else if (type === 'date') {
    //initValue = initValue ? moment(initValue, 'YYYY-MM-DD') : null;
  } else if (type === 'money') {
    initValue = initValue ? parseFloat(initValue) : 0;
  } else if (type.split('|')[0] === 'multiple') {
    if (Array.isArray(initialValue)) {
      _.remove(initValue, o => o.length === 0);
    } else {
      if (typeof (initialValue) === 'string' && initialValue.length > 0) {
        initValue = initialValue && initialValue.split(',') || [];
      } else {
        initValue = [];
      }
    }
  } else {
    initValue = initValue ? initValue : '';
  }

  if (label === '时间') {

  }

  const _type = type.split('|').length > 1 ? type[1] : 'day';

  return (
    <div style={{display: label === "经审查认定的事实" || label === "分析" ? 'block' : expend ? 'block' : 'none'}}>
      {rebuildLabel(label) === '时间' ?
        <FormItem {...formItemLayout}
                  label={<span style={{color: 'black'}}>{rebuildLabel(label)}</span>}
        >
          {getFieldDecorator(label, {
            initialValue: initValue ? moment(initValue, 'YYYY-MM-DD').format('YYYY年MM月DD日') === 'Invalid date' ? '' : moment(initValue, 'YYYY-MM-DD').format('YYYY年MM月DD日') : '',
            rules: [
              {
                required: required,
                pattern: new RegExp(/\d{4}年\d{1,2}月\d{1,2}日|\d{4}年\d{1,2}月|\d{4}年/),
                message: `日期格式:2018年01月01日`,
              }
            ]
          })(
            <Time
              item={{}}
              initialValue={initValue}
              onSave={save}
              timeType="sccl"
              type={_type}
            />
          )}
        </FormItem> :
        type && type.split('|')[0] === 'multiple' ?
          <FormItem {...formItemLayout}
                    label={<span style={{color: 'black'}}>{rebuildLabel(label)}</span>}
          >
            {getFieldDecorator(label, {
              initialValue: initValue,
              getValueFromEvent: value => {
                let newVal = value;
                if (_.indexOf(value, '否') > -1) {
                  newVal = value.length > 1 && _.indexOf(value, '否') === 0 ? _.drop(value) : ['否']
                } else if (_.indexOf(value, '无') > -1) {
                  newVal = value.length > 1 && _.indexOf(value, '无') === 0 ? _.drop(value) : ['无']
                }
                return newVal
              },
              rules: [{
                required: required,
                message: label === '嫌疑人' ? `请输入${label}姓名！(不支持空格和数字)` : `请输入${label}`
              }],
            })(
              createField()
            )}
          </FormItem>
          :
          <FormItem {...formItemLayout}
                    label={<span style={{color: 'black'}}>{rebuildLabel(label)}</span>}
          >
            {getFieldDecorator(label, {
              initialValue: initValue,
              rules: label === '时间' ? [

                {required: required, message: `请输入${label}`,}
              ]
                : [{
                  required: required,
                  // pattern: new RegExp(/\[^ ]+$/),
                  message: label === '嫌疑人' ? `请输入${label}姓名！(不支持空格和数字)` : `请输入${label}`
                }],
            })(
              createField()
            )}
          </FormItem>
      }

      {/*{label === '分析' ?*/}
      {/*<div style={{marginLeft: 8, color: '#1890ff', textAlign: 'right', paddingRight: '6%'}} onClick={toggleForms}*/}
      {/*key={Math.random()}>*/}
      {/*{expend ? <a>关闭<Icon type="up"/> </a> : <a>展开<Icon type="down"/></a>}*/}
      {/*</div> : ''}*/}
    </div>
  );
};

export default FormBuilder;
