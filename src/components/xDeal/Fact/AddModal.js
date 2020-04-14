/**
 *案件审查详情
 */
import React, {PureComponent} from 'react';
import {Modal, Button, Icon, Spin, Card, Tabs, Form, Input, Row, Col, Select} from 'antd';
import classnames from 'classnames';
import DocPreview from 'components/xDeal/DocPreview';
import NlpInfo from 'components/xDeal/NlpInfo';
import _ from 'lodash';

const TabPane = Tabs.TabPane;
const Option = Select.Option;

@Form.create()
export default class AddModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      facts: [],
      addModalVisible: false
    }
  }

  showModelHandler = () => {
    this.setState({
      addModalVisible: true
    })
  };

  hideModelHandler = () => {
    this.setState({
      addModalVisible: false
    })
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const {label} = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.addHandle && this.props.addHandle(values, label);
        this.hideModelHandler();
      }
    });
  };

  render() {
    const {label, enumerate, children} = this.props;
    const {getFieldDecorator} = this.props.form;

    const boolLabelConverter = {
      '被害人': 'bhrshuxing',
      '参与人': 'cyrshuxing',
      '伤残等级': 'shangcandengji',
      '本笔事实其他参与人': 'cyrshuxing'
    };

    const reCsLabel = (type) => {
      let label = type;
      if (boolLabelConverter[type]) {
        label = boolLabelConverter[type]
      } else {
        label = type
      }
      return label;
    };


    const cs = label && reCsLabel(label);
    const formItemLayout = {
      labelCol: {span: 3},
      wrapperCol: {span: 21},
    };


    return (
      <span>
        <span onClick={this.showModelHandler}>
          { children }
        </span>
        <Modal title={
          <span>
                 <span><Icon type='form'/> {`新增${label}`}</span>
               </span>
        }
               width='40%'
               visible={this.state.addModalVisible}
               maskClosable={false}
               destroyOnClose
               onCancel={this.hideModelHandler}
               footer={null}>
          <div>
            <Form onSubmit={this.handleSubmit}>
              <Row>
                <Col span={24}>
                  <Col span={12}>
                    <Form.Item {...formItemLayout}>
                      {getFieldDecorator('姓名', {
                        rules: [{required: true, message: `请输入人员姓名`}],
                      })(
                        <Input prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                               placeholder={`请输入人员姓名`}/>
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

                  <Button style={{marginLeft: 10}} onClick={this.hideModelHandler}>取消</Button>
                </Col>
              </Row>
            </Form>
          </div>
      </Modal>
      </span>
    );
  }
}

