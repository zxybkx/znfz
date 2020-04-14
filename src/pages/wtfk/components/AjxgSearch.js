import React, {PureComponent} from 'react';
import { Form, Row, Col, Input, Button, Select, DatePicker, Icon } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import {TASK_CONDITION} from '../../../constant';
import styles from './Search.less';

const RangePicker = DatePicker.RangePicker;
const FormItem = Form.Item;
const Option = Select.Option;

class SearchForm extends PureComponent {
  state = {
    addInputValue: '',
    modalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
  };

  handleSearch = (e) => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {

      if (err) return;
      if (!err) {
        const values = {
          // startDate: fieldsValue.startDate ? moment(fieldsValue.startDate).format("YYYY-MM-DD") : null,
          // endDate: fieldsValue.endDate ? moment(fieldsValue.endDate).format("YYYY-MM-DD") : null,
          ysay_aymc: fieldsValue.ysay_aymc,
          ajmc: fieldsValue.ajmc,
          bmsah: fieldsValue.bmsah,
        };
        fieldsValue.startDate && _.set(values,'startDate',moment(fieldsValue.startDate).format("YYYY-MM-DD"));
        fieldsValue.endDate && _.set(values,'endDate',moment(fieldsValue.endDate).format("YYYY-MM-DD"));
        dispatch({
          type: 'wtfk/getAjxg',
          payload: {
            data: values
          },
        });
      }
    });
  };


  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    dispatch({
      type: 'wtfk/getAjxg',
    });
  }


  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }

  renderSimpleForm() {
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row >
          <Col span={8}>
            <FormItem {...formItemLayout} style={{ width: '100%' }} colon={false} label={<span style={{fontWeight:'normal'}}>案件名称</span>} >
              {getFieldDecorator('ajmc')(
                <Input placeholder="案件名称" />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} style={{ width: '100%' }} colon={false} label={<span style={{fontWeight:'normal'}}>部门受案号</span>} >
              {getFieldDecorator('bmsah')(
                <Input placeholder="部门受案号" />
              )}
            </FormItem>
          </Col>
          <Col span={7} offset={1}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row >
          <Col span={8}>
            <FormItem {...formItemLayout} style={{ width: '100%' }} colon={false} label={<span style={{fontWeight:'normal'}}>案件名称</span>} >
              {getFieldDecorator('ajmc')(
                <Input placeholder="案件名称" />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} style={{ width: '100%' }} colon={false} label={<span style={{fontWeight:'normal'}}>部门受案号</span>} >
              {getFieldDecorator('bmsah')(
                <Input placeholder="部门受案号" />
              )}
            </FormItem>
          </Col>
          <Col span={7} offset={1}>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </Col>
        </Row>
        <Row style={{ marginTop: 15 }}>
          <Col span={8}>
            <FormItem {...formItemLayout} style={{ width: '100%' }} colon={false} label={<span style={{fontWeight:'normal'}}>移送案由</span>} >
              {getFieldDecorator('ysay_aymc')(
                <Select placeholder="移送案由">
                  {
                    TASK_CONDITION.map(c => <Option key={c.ysay} value={c.ysay}>{c.ysay}</Option>)
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout}
                      style={{ width: '100%' }}
                      colon={false}
                      label={<span style={{fontWeight:'normal'}}>起止时间</span>} >
              {getFieldDecorator('startDate')(
                <DatePicker/>
              )}
              {getFieldDecorator('endDate')(
                <DatePicker/>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  renderForm() {
    return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  render() {

    return (
      <div className={styles.default}>
        {this.renderForm()}
      </div>
    );
  }
}

export default Form.create({
  mapPropsToFields(props) {
    return _.mapValues(props.searchFields, (v, k) => {
      if(k === 'startDate' || k === 'endDate') {
        v = moment(v);
      }
      return Form.createFormField({k, value: v})
    });
  }
})(SearchForm);
