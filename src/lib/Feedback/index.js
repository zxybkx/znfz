import React, {PureComponent} from 'react';
import {Col, Modal, Spin, Form, Input, Button, Checkbox, Icon} from 'antd';
import $ from 'jquery';
import domtoimage from 'dom-to-image';
import pathToRegexp from 'path-to-regexp';
const FormItem = Form.Item;
const { TextArea } = Input;

class MyForm extends PureComponent{

  constructor(props){
    super(props);
    this.state = {
      visible: false,
      image: null,
    }
  }

  toggleSnapshot = (e)=>{
    const {setFieldsValue} = this.props.form;
    const checked = e.target.checked;
    if(checked){
      this.setState({
        visible: true,
      });

      if(!this.state.image) {
        const app = $('#root');
        domtoimage.toPng(app[0])
          .then(dataUrl => {
            setFieldsValue({
              "snapshot": dataUrl
            });
            this.setState({
              image: dataUrl
            })
          })
          .catch(function (error) {
            console.error('oops, something went wrong!', error);
          });
      }
    }else{
      setFieldsValue({
        "snapshot" : null
      });
      this.setState({
        visible: false,
      });
    }
  };

  handleOk = ()=>{
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


  render()
  {
    const { getFieldDecorator} = this.props.form;
    const {image, visible} = this.state;
    const {onCancel} = this.props;
    return (
      <Form style={{height: '100%'}}>
        <FormItem>
          {getFieldDecorator('advice', {
            initialValue: '',
            rules: [
              {required: true, message: "必须添加说明"},
            ],
          })(
            <TextArea placeholder="请说明您的问题或分享您的想法" rows={4}
                      style={{height: `100%`}}/>
          )}
        </FormItem>
        <FormItem style={{marginBottom: '5px'}}>
          <Col span={12}>
            {getFieldDecorator('has_snapshot', {
              initialValue: ''
            })(
              <Checkbox onChange={this.toggleSnapshot}>包含屏幕截图</Checkbox>
            )}
          </Col>
          <Col span={12} style={{textAlign: 'right'}}>
            <Button type="primary" onClick={this.handleOk}>保存</Button>
            <Button  onClick={onCancel} style={{marginLeft: '5px'}}>取消</Button>
          </Col>
        </FormItem>
        <FormItem style={{width: '100%', height: '250px', display: visible ? 'block' : 'none'}}>
          <Spin spinning={!image} tip="截图中..."><img src={image} style={{width: '100%', height: '100%'}}/></Spin>
        </FormItem>
        <FormItem>
          {getFieldDecorator('snapshot', {
            initialValue: ''
          })(
            <Input type="hidden"/>
          )}
        </FormItem>
      </Form>
    );
  }
}

export default class Feedback extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  hideModelHandler = () => {
    this.setState({
      modalVisible: false
    })
  };


  feedback = ()=>{
    this.setState({
      modalVisible: true,
    })
  };

  onSave = (data) =>{
    const {dispatch, location: {query, pathname}} = this.props;
    const match = pathToRegexp('/*jd/*deal/:id/*').exec(pathname);

    if(match) {
      dispatch({
        type: "portal/saveFeedback",
        payload: {
          data: {
            pathname,
            type: '吐槽',
            ...data,
            bmsah: match.length > 4 ? match[3] : match[2],
            stage: match[1] === 'gs' ? 'GS' : 'ZJ',
            jsondata: data
          }
        }
      });
    }else {
      dispatch({
        type: "portal/saveFeedback",
        payload: {
          data: {
            pathname,
            type: '吐槽',
            ...data,
            ...query,
            jsondata: data
          }
        }
      });
    }


    this.setState({
      modalVisible:false,
    });
  };

  render() {
    const {modalVisible} = this.state;
    const FeedbackForm = Form.create()(MyForm);
    return (

      <Modal title={<span><Icon type='question-circle-o'/> 问题反馈</span>}
             visible={modalVisible}
             maskClosable={false}
             closable={true}
             onCancel={this.hideModelHandler}
             footer={null}>
        <FeedbackForm onSave={this.onSave} onCancel={this.hideModelHandler}/>
      </Modal>
    );
  }
}
