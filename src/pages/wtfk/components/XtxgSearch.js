import React, {PureComponent} from 'react';
import { Form, Row, Col, Button, DatePicker} from 'antd';
import moment from 'moment';
import _ from 'lodash';
import styles from './Search.less';

const RangePicker = DatePicker.RangePicker;
const FormItem = Form.Item;

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
          startDate: fieldsValue.qzsj ? moment(fieldsValue.qzsj[0]).format("YYYY-MM-DD") : fieldsValue.qzsj,
          endDate: fieldsValue.qzsj ? moment(fieldsValue.qzsj[1]).format("YYYY-MM-DD") : fieldsValue.qzsj,
          // dfzt: fieldsValue.dfzt,
        };
        dispatch({
          type: 'wtfk/getXtxg',
          payload: values,
        });
        // dispatch({
        //   type: 'wtfk/changeState',
        //   payload: {
        //     startDate: fieldsValue.qzsj ? moment(fieldsValue.qzsj[0]).format("YYYY-MM-DD") : '',
        //     endDate: fieldsValue.qzsj ? moment(fieldsValue.qzsj[1]).format("YYYY-MM-DD") : '',
        //     dfzt: values.dfzt,
        //   },
        // });
      }
    });
  };


  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    dispatch({
      type: 'wtfk/getXtxg',
    });
  };

  renderForm() {
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <Row >
          <Col span={8}>
            <FormItem {...formItemLayout} style={{ width: '100%' }} colon={false} label={<span style={{fontWeight:'normal'}}>起止时间</span>} >
              {getFieldDecorator('qzsj')(
                <RangePicker />
              )}
            </FormItem>
          </Col>
          <Col span={7} offset={1}>
            <span className={styles.submitButtons}>
              <Button type="primary" onClick={this.handleSearch}>查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    return (
      <div className={styles.default}>
        {this.renderForm()}
      </div>
    );
  }
}


export default Form.create()(SearchForm);
