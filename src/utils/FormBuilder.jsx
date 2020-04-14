import React  from "react";
import {Input, Select, InputNumber, DatePicker, Radio, Checkbox} from "antd";
import moment from 'moment';
import _ from 'lodash';
import styles from './FormBuilder.less';
import Time from 'components/xDeal/Time';

const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const {TextArea} = Input;

const FormBuilder = ({
                       fieldConfig,
                       fieldData,
                       getFieldDecorator,
                       setFieldsValue,
                       onChange
                     }) => {

  const onChangeHandler = (object) => {
    if (onChange) {
      onChange(object);
    }
  };

  function save(val) {
    setFieldsValue && setFieldsValue({
      [fieldConfig.label]: val.content
    })
  }

  function dealOption(catalog) {
    const sourceArr = ["全部责任", "主要责任", "同等责任", "次要责任", "无责任"];
    return sourceArr.indexOf(catalog)
  }

  function createField() {
    const verticalStyle = {
      marginLeft: 0,
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };


    const dateStyle = {
      width: '200px',
    };

    let options = [];
    for (let key in fieldConfig.options) {
      options.push({
        "value": key,
        "label": fieldConfig.options[key]
      });
    }

    if (fieldConfig.name === "responsibility") {
      options.sort((item1, item2) => dealOption(item1.value) - dealOption(item2.value));
    }

    let field;
    const type = fieldConfig.type.toLowerCase();
    const vertical = fieldConfig.align === 'vertical';
    switch (type) {
      case 'text':
        field = <Input onChange={onChangeHandler} type='text'/>;
        break;

      case 'textarea':
        const rows = fieldConfig.row || 4;
        field = <TextArea onChange={onChangeHandler} rows={rows}/>;
        break;

      case 'select':
        field = <Select placeholder={`请选择${fieldConfig.label}`}>
          {options.map((opt, index) => <Option key={index} value={opt.value}>{opt.label}</Option>)}
        </Select>;
        break;

      case 'date':
        //field = <DatePicker format="YYYY-MM-DD" style={dateStyle}/>;
        break;

      case 'date-range':
        field = <RangePicker format="YYYY-MM-DD"/>;
        break;

      case 'numeric':
        field = <InputNumber onChange={onChangeHandler} min={1}/>;
        break;

      case 'radio-audit':
        field = <RadioGroup onChange={onChangeHandler}>
          <RadioButton value="yes">同意</RadioButton>
          <RadioButton value="no">不同意</RadioButton>
        </RadioGroup>;
        break;

      case 'radiogroup':
        if (fieldConfig.label && fieldConfig.label === '对人大代表、政协委员采取强制措施是否履行法定程序') {
          field = <RadioGroup onChange={onChangeHandler}>
            {options.map((opt, index) => <Radio style={vertical ? verticalStyle : {}} key={index}
                                                value={opt.value}>{opt.label}</Radio>)}
          </RadioGroup>;
        } else {
          field = <RadioGroup onChange={onChangeHandler}>
            {options.map((opt, index) => <Radio style={vertical ? verticalStyle : {}} key={index} value={opt.value}
                                                defaultChecked={index === 0}>{opt.label}</Radio>)}
          </RadioGroup>;
        }
        break;

      case 'checkboxgroup':
        field = <CheckboxGroup onChange={onChangeHandler}>
          {options.map((opt, index) => <Checkbox style={vertical ? verticalStyle : {}} key={index}
                                                 value={opt.value}>{opt.label}</Checkbox>)}
        </CheckboxGroup>;
        break;

      case 'number':
        if (fieldConfig.label && (fieldConfig.label === '死亡人数' || fieldConfig.label === '重伤人数')) {
          field = <InputNumber onChange={onChangeHandler} min={0} precision={0}/>;
        } else {
          field = <InputNumber onChange={onChangeHandler} min={0}/>;
        }
        break;

      default:
        field = <Input onChange={onChangeHandler} type='text'/>;
        break;
    }

    return field;
  }

  let type = {};
  if (/.*range.*/.test(fieldConfig.type)) {
    type = {type: 'array'};
  }

  let initValue = fieldData || fieldConfig.default;
  if (/.*numeric.*/.test(fieldConfig.type)) {
    initValue = parseInt(initValue);
  }


  if (/.*date.*/.test(fieldConfig.type) && !_.isEmpty(initValue)) {
    //initValue = initValue ? moment(initValue,'YYYY-MM-DD') : null;
    initValue = initValue;
  }

  let errorMessage = fieldConfig.errorMessage;
  if (!errorMessage || errorMessage.length === 0) {
    errorMessage = fieldConfig.label + "不能为空。";
  }

  return (
    <div className={styles.formItem}>
      <div className={styles.label}>
        {fieldConfig.required && <span className={styles.must}>*</span> }
        {fieldConfig.label}
      </div>
      {fieldConfig.name === '出生日期' ?
        <div>
          {getFieldDecorator(fieldConfig.label, {
            rules: [
              {required: fieldConfig.required, message: errorMessage,}
            ]
          })(
            <Time
              item={{}}
              initialValue={initValue}
              onSave={save}
              type={'day'}
            />
          )}
        </div>
        :
        <div className={styles.control}>
          {getFieldDecorator(`${fieldConfig.name}`, {
            initialValue: initValue,
            rules: [
              {...type, required: fieldConfig.required, message: errorMessage},
            ],
          })(
            createField()
          )}
        </div>
      }
    </div>
  );
};

export default FormBuilder;
