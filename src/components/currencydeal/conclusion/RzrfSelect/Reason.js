import React, {Component, Fragment} from 'react';
import {Form, Switch, Input, Select, Tooltip} from 'antd';
const FormItem = Form.Item;
const {Option} = Select;

export default class RzrfSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTrue: props.initialValue && props.initialValue.rzrf === '是',
    }
  }

  onChange = (checked) => {
    this.setState({
      isTrue: checked
    })
  };

  render() {
    const {isTrue} = this.state;
    const {getFieldDecorator, object, name, initialValue} = this.props;
    let reasonInitialValue = initialValue && initialValue.wsyyy ? initialValue.wsyyy : '';
    const reason = {
      A: 'A 犯罪嫌疑人不认罪',
      B: 'B 犯罪嫌疑人认罪不认罚',
      C: 'C 值班律师未到位',
      D: 'D 辩护人作无罪辩护',
      E: 'E 有影响刑事诉讼活动正常进行的行为',
      F: 'F 犯罪性质恶劣、犯罪手段残忍、社会危害严重',
      G: 'G 其他情形'
    };

    return (
      <Fragment>
        <FormItem>
          {getFieldDecorator(`${object}-${name}`, {
            initialValue: initialValue && initialValue.rzrf === '是',
            valuePropName: 'checked'
          })(
            <Switch checkedChildren="是"
                    unCheckedChildren="否"
                    onChange={(checked) => this.onChange(checked)}
            />
          )}
        </FormItem>
        {isTrue ? '' :
          <FormItem style={{marginLeft: 50}}>
            <span style={{color: 'red', fontSize: 20, marginRight: 10, marginTop: 10}}>*</span>
            {getFieldDecorator(`${object}-未适用认罪认罚原因`, {
              initialValue: reasonInitialValue && reasonInitialValue,
              rules: [{required: true, message: `请选择未适用认罪认罚原因`}]
            })(
              <Select style={{width: '80%'}} showArrow={true}>
                {
                  _.map(reason, (v, k) => {
                    return (
                      <Option key={k} value={k}>
                        <Tooltip placement='left' title={v} tooltip>
                          {v}
                        </Tooltip>
                      </Option>
                    )
                  })
                }
              </Select>
            )}
          </FormItem>
        }
      </Fragment>
    )
  }
}
