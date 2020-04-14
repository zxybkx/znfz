import React, {PureComponent} from 'react';
import {Form, Input, Button, Col} from 'antd';

const FormItem = Form.Item;
const {TextArea} = Input;

class FKForm extends PureComponent {
  constructor(props) {
    super(props);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const {validateFields, getFieldsValue} = this.props.form;
    const {onSave} = this.props;
    validateFields((errors) => {
      if (errors) {
        return;
      }
      const data = {...getFieldsValue()};
      onSave(data);
    });
  };

  render() {
    const {getFieldDecorator} = this.props.form;
    const {loading} = this.props;
    return (
      <Form onSubmit={this.handleSubmit} layout='horizontal'>
        <Col span={24}>
          <FormItem>
            {getFieldDecorator('clnr', {
              rules: [{required: true, message: '答复意见不能为空!'}],
            })(
              <TextArea rows={6}/>,
            )}
          </FormItem>
        </Col>
        <Col span={24} style={{textAlign: 'right'}}>
          <FormItem>
            <Button type="primary" htmlType="submit" loading={loading}>保存</Button>
          </FormItem>
        </Col>
      </Form>
    );
  }
}

export default Form.create()(FKForm);
