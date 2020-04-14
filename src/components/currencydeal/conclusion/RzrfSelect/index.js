import React, {Component, Fragment} from 'react';
import {Select, Form, Switch} from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

export default class RzrfSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTrue: props.initialValue && props.initialValue.sfwpc === '是',
    }
  }

  onChange = (checked) => {
    const {object, name, onRzrfChange} = this.props;
    onRzrfChange && onRzrfChange(name, object, checked);

    this.setState({
      isTrue: checked
    })
  };

  render() {
    const {isTrue} = this.state;
    const {getFieldDecorator, object, name, initialValue} = this.props;
    let rzrfInitialValue = initialValue && initialValue.qqsfhl ? initialValue.qqsfhl : '';

    return (
      <Fragment>
        <FormItem>
          {getFieldDecorator(`${object}-${name}`, {
            initialValue: initialValue && initialValue.sfwpc === '是',
            valuePropName: 'checked'
          })(
            <Switch checkedChildren="是"
                    unCheckedChildren="否"
                    onChange={(checked) => this.onChange(checked)}
            />
          )}
        </FormItem>
        <FormItem style={{marginLeft: 50}}>
          {getFieldDecorator(`${object}-未就附带民事诉讼赔偿等事项达成调解或者和解协议选项`, {
            initialValue: rzrfInitialValue ? rzrfInitialValue : ''
          })(
            <Select style={{width: 200, display: isTrue ? 'block' : 'none'}}>
              <Option value="被害人请求合理">被害人请求合理</Option>
              <Option value="被害人请求不合理">被害人请求不合理</Option>
            </Select>
          )}
        </FormItem>
      </Fragment>
    )
  }
}
