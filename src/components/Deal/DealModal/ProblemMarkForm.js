import React, {PureComponent} from 'react';
import {Form, Button, Input} from 'antd';
import OcrWrapper from 'lib/OcrWrapper';
import styles from './ProblemMarkForm.less';

const {TextArea} = Input;
const FormItem = Form.Item;

class ProblemMarkForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      markCoords: props.markCoords || null,
      markItem: props.markItem || {},
      problem: props.problem || {},
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      markCoords: nextProps.markCoords || null,
      markItem: nextProps.markItem || {}
    })
  }

  handleOk = () => {
    const {resetFields, validateFields, getFieldsValue} = this.props.form;
    const {save} = this.props;
    validateFields((errors) => {
      if (errors) {
        return;
      }
      const data = {...getFieldsValue()};
      save(data);
      resetFields();
    });
  };

  onOcrClick = (key) => {
    window.ocrListener = (value)=> {
      const {getFieldValue, setFieldsValue} = this.props.form;
      const values = {};
      values[key] = (getFieldValue(key) || '') + value;
      setFieldsValue && setFieldsValue(values);
    }
  };

  render() {
    const {getFieldDecorator} = this.props.form;

    const formItemLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 18
      }
    };

    return (
      <Form style={{height: '100%'}} className={styles.default}>
        <FormItem {...formItemLayout} label="标记要素" style={{height:'20%'}}>
          {this.state.markItem.fieldname}
          {getFieldDecorator('fieldpath', {
            initialValue: this.state.markItem.fieldpath,
          })(
            <Input type="hidden"/>
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="标记内容"  style={{height:'40%'}}>
          <OcrWrapper onClick={()=> this.onOcrClick('fieldvalue')}>
          {getFieldDecorator('fieldvalue', {
            initialValue: '',
            rules: [
              {required: true, message: '请输入标记内容'}
            ]
          })(
            <TextArea placeholder="标记内容" style={{width: '100%', height: '99%'}}/>
          )}
          </OcrWrapper>
        </FormItem>
        <FormItem {...formItemLayout} label="标记位置" style={{height:'20%'}}>
          {getFieldDecorator('coords', {
            initialValue: this.state.markCoords ? JSON.stringify(this.state.markCoords, null, 4) : '',
          })(
            <TextArea rows={2} readOnly style={{display: 'none'}}/>
          )}
          {
            this.state.markCoords && <span style={{color: '#00FF7F'}}>已标记</span>
          }
        </FormItem>
        <div
          style={{
            position: 'absolute',
            width: '100%',
            bottom: '8px',
            left: 0,
            padding: '4px 10px',
            textAlign: 'right'
          }}>
          <Button type="primary" onClick={this.handleOk} disabled={this.state.disabled}>保存</Button>
        </div>
      </Form>
    );
  }
}

export default Form.create()(ProblemMarkForm);
