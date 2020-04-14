import React, {Component} from 'react';
import {Radio, Button, Select, Form, Switch, Row, Input, Checkbox, Alert, message} from 'antd';
import TJTable from './Table';
import WordModal from 'components/xDeal/RelatedWord';
import _ from 'lodash';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sycxList: [],
      xyrss: '',
      scqsSycx: '',
      reason: '',
      visible: false
    }
  }

  componentDidMount = () => {
    this.getSycxData()
    console.log(this.props)
  };


  dealSycxJsonData = () => {
    let sycxJsondata = {};
    const {validateFields} = this.props.form;
    validateFields((errors, values) => {
      _.set(sycxJsondata, '公安机关是否建议速裁', values['公安机关是否建议速裁'] ? '是' : '否');
      let reasonarr = _.clone(values.reason);
      let ProgramTestarr = _.clone(values.ProgramTest);
      const other = _.find(reasonarr, (o) => o === '其他');
      if (other) {

        _.remove(reasonarr, (o) => o === '其他');
        reasonarr.push('其他-' + values.otherReason);
      }
      const scqssy = {
        cx: values['审查起诉适用'],
        reason: reasonarr,
        xyrss: ProgramTestarr,
        defaultValue: '普通'
      };
      _.set(sycxJsondata, '审查起诉适用', scqssy);
      _.set(sycxJsondata, '建议法院适用', values['建议法院适用']);
      _.set(sycxJsondata, '同意法院适用', values['同意法院适用']);
    });
    return sycxJsondata;
  };

  onSycxChange = (e) => {
    this.setState({
      scqsSycx: e.target.value,
    });
    const {getFieldValue, setFieldsValue} = this.props.form;
    setFieldsValue({['建议法院适用']: `${e.target.value}`});
  };

  renderSycx = (text, record) => {
    const {getFieldDecorator} = this.props.form;
    const {scqsSycx, reason, xyrss} = this.state;
    const ontherData = text&&text.defaultValue ? text.defaultValue === '简易' ? '速裁' : text.defaultValue === '普通' ? '速裁或简易' : '':'';

    if (record.name === '公安机关是否建议速裁') {
      return (
        <FormItem style={{textAlign: 'left'}}>
          {getFieldDecorator(`${record.name}`, {
            initialValue: text === '是',
            valuePropName: 'checked'
          })(
            <Switch checkedChildren="是"
                    unCheckedChildren="否"
                    style={{marginLeft: 10}}
            />
          )}
        </FormItem>
      )
    } else if (record.name === '审查起诉适用') {
      const message =
        <div>
          <div>请选择修改系统推送结论的原因：</div>
          <FormItem style={{textAlign: 'left'}}>
            {getFieldDecorator(`reason`, {
              initialValue: reason,
            })(
              <Checkbox.Group style={{width: '100%'}}
                              onChange={this.onReasonChange}>
                <Row>
                  <Checkbox value="1.有重大社会影响的；">1.有重大社会影响的；</Checkbox>
                </Row>
                <Row>
                  <Checkbox value="2.犯罪嫌疑人、被告人表示认罪，但有干扰证人作证、毁灭、伪造证据或者串供等影响刑事诉讼活动正常进行的行为的；">
                    2.犯罪嫌疑人、被告人表示认罪，但有干扰证人作证、毁灭、伪造证据或者串供等影响刑事诉讼活动正常进行的行为的；
                  </Checkbox>
                </Row>
                <Row>
                  <Checkbox value="其他">
                    其他不适用速裁或简易程序的情形
                  </Checkbox>
                </Row>
              </Checkbox.Group>
            )}
          </FormItem>
          {
            _.find(reason, (o) => o === '其他') ?
              <FormItem style={{margin: 0}}>
                {getFieldDecorator(`otherReason`, {
                  initialValue: text.otherReason
                })(
                  <Input style={{width: 500, marginLeft: 10, border: '1px solid lightBlue'}}
                         placeholder={'请输入其他理由'}
                  />
                )}
              </FormItem> : null
          }
        </div>;


      const conclusionMessage =
        <div>
          <div>本案具有如下已勾选的情形：</div>
          <FormItem style={{textAlign: 'left'}}>
            {getFieldDecorator('ProgramTest', {
              initialValue: xyrss,
            })(
              <Checkbox.Group style={{width: '100%'}} disabled>
                <Row>
                  <Checkbox value="案件事实清楚，证据确实充分">案件事实清楚，证据确实充分；</Checkbox>
                </Row>
                <Row>
                  <Checkbox
                    value="被告人认罪认罚（承认自己所犯罪行，对指控的犯罪事实及量刑建议没有异议并签署具结书）">被告人认罪认罚（承认自己所犯罪行，对指控的犯罪事实及量刑建议没有异议并签署具结书）；</Checkbox>
                </Row>
                <Row>
                  <Checkbox value="被告人同意适用">被告人同意适用；</Checkbox>
                </Row>
                <Row>
                  {xyrss.indexOf("可能判处3年以下有期徒刑") > -1 ? <Checkbox value="可能判处3年以下有期徒刑">可能判处3年以下有期徒刑；</Checkbox> : ''}
                  {xyrss.indexOf("可能判处3年以上有期徒刑") > -1 ? <Checkbox value="可能判处3年以上有期徒刑">可能判处3年以上有期徒刑；</Checkbox> : ''}
                </Row>
                <Row>
                  <Checkbox value="被告人是盲、聋、哑人，或者是尚未完全丧失辨认或者控制自己行为能力的精神病人的">
                    被告人是盲、聋、哑人，或者是尚未完全丧失辨认或者控制自己行为能力的精神病人的；
                  </Checkbox>
                </Row>
                <Row>
                  <Checkbox value="被告人是未成年人的">被告人是未成年人的；</Checkbox>
                </Row>
                <Row>
                  <Checkbox value="共同犯罪案件中部分被告人对指控的犯罪事实、罪名、量刑建议或适用速裁程序有异议的">
                    共同犯罪案件中部分被告人对指控的犯罪事实、罪名、量刑建议或适用速裁程序有异议的；
                  </Checkbox>
                </Row>
                <Row>
                  <Checkbox value="被告人与被害人或者其法定代理人没有就附带民事诉讼赔偿等事项达成调解或者和解协议的">
                    被告人与被害人或者其法定代理人没有就附带民事诉讼赔偿等事项达成调解或者和解协议的；
                  </Checkbox>
                </Row>
              </Checkbox.Group>
            )}
          </FormItem>
        </div>;

      return (
        <div style={{textAlign: 'left', marginTop: 5}}>

          {
            <div>
              <Alert message={conclusionMessage}/>
            </div>
          }

          {
            <div style={{marginTop: 5}}>
              <Alert
                message={
                  <div>
                    系统推荐使用程序：{text.defaultValue}&nbsp;&nbsp;
                    (<a onClick={this.showModal}>相关法律条文请戳这里</a>)
                  </div>}
                type="error"
              />
              {
                text.defaultValue === '速裁' ? null :
                  <Alert
                    style={{marginTop: 5}}
                    type="error"
                    message={
                      <div>
                        若需选择
                        {ontherData}
                        程序,需要重新确认上述“审查意见”及“认罪认罚”模块对应的事实情形。
                      </div>
                    }
                  >
                  </Alert>
              }
            </div>
          }

          <FormItem>
            {getFieldDecorator(`${record.name}`, {
              initialValue: text.cx
            })(
              <RadioGroup onChange={this.onSycxChange}>
                <Radio value={'速裁'} disabled={!(text.defaultValue === '速裁')}>速裁</Radio>
                <Radio value={'简易'}>简易</Radio>
                <Radio value={'普通'}>普通</Radio>
              </RadioGroup>
            )}
          </FormItem>

          {
            scqsSycx === '普通' && text.defaultValue !== '普通' ?
              <div>
                <Alert message={message} style={{marginBottom: 5}} type="warning"/>
              </div> : null
          }

        </div>
      )
    } else if (record.name === '建议法院适用') {
      return (
        <FormItem style={{textAlign: 'left'}}>
          {getFieldDecorator(`${record.name}`, {
            initialValue: text
          })(
            <Select style={{width: 200}}>
              <Option value="建议速裁" disabled={!(scqsSycx === '速裁')}>速裁</Option>
              <Option value="建议简易">简易</Option>
              <Option value="建议普通">普通</Option>
              <Option value="建议其他" style={{height: 30}}/>
            </Select>
          )}
        </FormItem>
      );
    } else {
      return (
        <FormItem style={{textAlign: 'left'}}>
          {getFieldDecorator(`${record.name}`, {
            initialValue: text
          })(
            <Select style={{width: 200}}>
              <Option value="同意速裁">速裁</Option>
              <Option value="同意简易">简易</Option>
              <Option value="同意普通">普通</Option>
              <Option value="同意其他" style={{height: 30}}/>
            </Select>
          )}
        </FormItem>
      );
    }

  };


  sycxData = () => {
    const {match, znfz, people,stage,ysay} = this.props;
    const {params: {id}} = match;
    const payload = [];
    people.map((name, i) => {
      const itemData = {};
      _.set(itemData, 'ysay', ysay);
      _.set(itemData, 'stage', stage);
      _.set(itemData, 'bmsah', id);
      _.set(itemData, 'tysah', znfz.ajxx.tysah);
      _.set(itemData, 'mergekey', name);
      const sycxJsondata =  this.dealSycxJsonData();
      _.set(itemData, 'sycxJsondata', sycxJsondata);
      payload.push(itemData);
    });
    return payload;
  };


  saveSycxData = () => {
    const {dispatch, match, znfz, validateFields} = this.props;
    const {params: {id}} = match;
    // const {validateFields} = this.props.form;
    validateFields((errors, values) => {
      if (errors) {
        return;
      }
      const payload = this.sycxData();
      
      dispatch({
        type: 'znfz/',
        payload: payload
      }).then((result) => {
        message.success('保存成功');
        dispatch({
          type: 'znfz/sendStepList',
          payload: {
            bmsah: id,
            jllc: ['审查意见', '文书制作']
          }
        });
        this.props.onChangeState && this.props.onChangeState('文书制作', ['审查意见', '文书制作'])
      }).catch((error) => {
        message.warning('保存失败');
      })
    });
  };


  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = (e) => {
    this.setState({
      visible: false,
    });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };

  renderTableFooter2 = () => {
    const {znfz: {ajxx}} = this.props;
    return (
      <Button icon={'save'}
              type={'primary'}
              disabled={ajxx.ajzt && ajxx.ajzt.zt === 9}
              onClick={() => this.saveSycxData()}
      >下一步</Button>
    )
  };


  dealData = () => {
    const {match, znfz, people,ysay,stage} = this.props;
    const {params: {id}} = match;
    const payload = [];
    people.map((name, i) => {
      const itemData = {};
      _.set(itemData, 'ysay',ysay);
      _.set(itemData, 'stage',stage);
      _.set(itemData, 'bmsah', id);
      _.set(itemData, 'tysah', znfz.ajxx.tysah);
      _.set(itemData, 'mergekey', name);
      payload.push(itemData);
    });
    return payload;
  };



  getSycxData = () => {
    const {dispatch} = this.props;
    const payload = this.dealData();

    dispatch({
      type: 'znfz/getSycxs',
      payload: payload
    }).then((response) => {
      if (response) {
        const {success, data} = response;
        if (data && success) {
          const json = data.sycx_jsondata;
          if (json) {
            let reason = json['审查起诉适用'].reason;
            let xyrss = json['审查起诉适用'].xyrss;
            const other = _.find(reason, (o) => _.startsWith(o, '其他'));
            let otherReason = '';
            if (other) {
              _.remove(reason, (o) => o === other);
              reason.push('其他');
              otherReason = other.split('-')[1]
            }
            const cx = {
              cx: json['审查起诉适用'].cx,
              reason: reason,
              otherReason: otherReason,
              defaultValue: json['审查起诉适用'].defaultValue
            };
            const sycxList = [
              {id: 0, name: '公安机关是否建议速裁', cx: json['公安机关是否建议速裁']},
              {id: 1, name: '审查起诉适用', cx: cx},
              {id: 2, name: '建议法院适用', cx: json['建议法院适用']},
              {id: 3, name: '同意法院适用', cx: json['同意法院适用']}
            ];

            const {setFieldsValue} = this.props.form;
            setFieldsValue({
              ['审查起诉适用']: json['审查起诉适用'].cx
            });
            this.setState({
              sycxList: sycxList,
              scqsSycx: json['审查起诉适用'].cx,
              reason: reason,
              xyrss: xyrss,
            })
          }
        }
      }
    })
  };

  render() {
    const {sycxList} = this.state;

    const sycxColumns = [
      {
        title: '类别',
        width: 200,
        dataIndex: 'name',
      }, {
        title: '程序',
        dataIndex: 'cx',
        render: (text, record) => this.renderSycx(text, record),  //dataIndex,一条记录
      }];

    return (
      <div>
        <TJTable
          columns={sycxColumns}
          list={sycxList}
          title='适用程序'
          footer={this.renderTableFooter2}
        />

        <WordModal visible={this.state.visible}
                   onOk={this.handleOk}
                   onCancel={this.handleCancel}
                   width={'60%'}
                   footer={null}/>
      </div>
    );
  }
}
