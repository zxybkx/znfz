import React, {PureComponent} from 'react';
import {Modal, Button, Icon, Spin, Card, Tabs, Form, Input, Row, Col, Select} from 'antd';

const Option = Select.Option;

@Form.create()
export default class AddModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      facts: [],
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const {label, listnamePath} = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log('Received values of form: ', values);
        this.props.addNLP && this.props.addNLP(listnamePath, values, label);
        this.props.hideModelHandler();
      }
    });
  };

  render() {
    const {label, enumerate, children, showModal} = this.props;
    const {getFieldDecorator} = this.props.form;
    const cs = label && label === '被害人' ? 'bhrshuxing' : 'cyrshuxing';
    const formItemLayout = {
      labelCol: {span: 3},
      wrapperCol: {span: 21},
    };


    return (
      <Modal title={<span><Icon type='form'/> {`新增${label}`}</span>}
             width='40%'
             visible={showModal}
             maskClosable={false}
             destroyOnClose
             onCancel={this.props.hideModelHandler}
             footer={null}>
        <div>
          <Form onSubmit={this.handleSubmit}>
            <Row>
              <Col span={24}>
                <Col span={12}>
                  <Form.Item {...formItemLayout}>
                    {getFieldDecorator('姓名', {
                      rules: [{required: true, message: `请输入${label}姓名`}],
                    })(
                      <Input prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                             placeholder={`请输入${label}姓名`}/>
                    )}
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item {...formItemLayout}>
                    {getFieldDecorator('属性', {
                      rules: [{required: true, message: `请选择${label}属性`}],
                    })(
                      <Select placeholder={`请选择${label}属性`} style={{width: '100%'}}>
                        {
                          enumerate[cs] && enumerate[cs].length > 0 ? enumerate[cs].map((dic, idx) => {
                            return (
                              <Option key={idx} data={dic} value={dic.value} style={{width: '100%'}}>
                                {dic.value}
                              </Option>
                            )
                          }) : ''
                        }
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Col>

              <Col span={12} offset={8} style={{marginTop: 20}}>
                <Button
                  type="primary" htmlType="submit">确定
                </Button>

                <Button style={{marginLeft: 10}} onClick={this.props.hideModelHandler}>取消</Button>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
    );
  }
}

