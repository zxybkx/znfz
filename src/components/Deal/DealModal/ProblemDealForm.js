import React, {Component} from 'react';
import {Col, Form, Button, Input, Tabs, Icon, message} from 'antd';
import moment from 'moment';
import _ from 'lodash';
import OcrWrapper from 'lib/OcrWrapper';
import FormBulider from 'utils/FormBuilder';
import styles from './ProblemDealForm.less';
import {PROVENCE_SHORT_CODE} from '../../../constant';

const TabPane = Tabs.TabPane;
const {TextArea} = Input;

class ProblemDealForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ajxx: props.ajxx,
      problem: props.problem,
      formConfig: props.formConfig ||{},
      subResultVisible: false,
      disabled: false,
      showSubResult: false,
      cwlxVisible: false,
      yjfl: '',
    }
  }

  componentDidMount(){
    this.getFormConfig();
  }


  componentWillReceiveProps(nextProps){
    if((_.isEmpty(this.props.problem) && !_.isEmpty(nextProps.problem)) ||
          (!_.isEmpty(nextProps.problem) && !_.isEmpty(this.props.problem)
                && nextProps.problem.keyid !== this.props.problem.keyid)){
      this.getFormConfig(nextProps.problem);
    }
  }


  handleOk = () => {
    const {validateFields, getFieldsValue} = this.props.form;
    const {save, problem} = this.props;
    validateFields((errors) => {
      if (errors) {
        return;
      }
      const data = {...getFieldsValue()};

      /**
       * 目前仅对  ss_option 中的 date 做了处理
       */
      _.map(this.state.formConfig.fields, (row) => {

        if ((row.type && _.trim(row.type).toLowerCase() === 'date') || moment.isMoment(_.result(data, row.name))) {
          _.set(data, row.name, moment(_.result(data, row.name)).format('YYYY-MM-DD HH:mm:ss'));
        }
      });

      /**
       * 保存数据结果中添加分类
       * 规则如下:
       *   1. 若 deal_option 和 ss_option 对应的规则中存在 category,则处理,否则不处理
       *   2. result 若 category中找不到对应的值,则不处理
       *   3. result 以循环 category的最后的结果为准,所以在category 中结果应该唯一
       */
      let dealResult = data.result;
      const {dealOptions} = this.state.formConfig;

      _.set(data,'resultLabel',_.result(dealOptions,`options.${dealResult}`));

      // 判断前台是否有对应的ruledata的字段


      if(_.has(this.state.formConfigs,'hasFields')){
        _.set(data,'hasFields',true);
      }else{
        _.set(data,'hasFields',false);
      }

      if (dealResult && dealOptions && dealOptions.category) {
        let selectCategory;
        _.forEach(dealOptions.category, (value, key) => {
          if (_.includes(value, dealResult)) {
            selectCategory = key;
          }
        });
        if (selectCategory) {
          if (this.state.yjfl === '事实') {
            _.set(data, 'category', selectCategory === 'legal' ? '确认存在' : '确认不存在');
          } else {
            _.set(data, 'category', selectCategory === 'legal' ? '确认合法' : '确认非法');
          }
        }
      }

      let _data = Object.assign({}, problem.dealdata, data);

      if(_data.wtms) {
        if(_data.wtms.length >= 10) {
          save(_data);
        }else{
          message.warning('改进意见请输入至少10个字！')
        }
      }else {
        save(_data);
      }
    });
  };

  getFormConfig(problem) {
    const {stage, dispatch, ajxx} = this.props;
    if(!stage){
      return;
    }
    if(!problem){
      problem = this.props.problem;
    }

    const {dealdata} = problem;
    dispatch({
      type: 'znfz/getFormConfig',
      payload: {
        yjfl: problem.yjfl,
        keyId: problem.keyid,
        ysay: ajxx.ysay_aymc,
        stage: _.toUpper(stage),
        dwbm: PROVENCE_SHORT_CODE,
      }
    }).then(({data}) => {
      const formConfig = data && data.jsondata ? data.jsondata : {};
      if (dealdata) {
        let bool = 'result' in dealdata;
        if (bool) {
          let resultBool = !dealdata.result;
          this.setState({disabled: resultBool});
        } else {
          this.setState({disabled: true});
        }
      } else {
        this.setState({disabled: true});
      }

      let showSubResult = false;
      let subResultVisible = false;
      if (this.props.stage && this.props.stage === 'SP') {
        showSubResult = true;
        let trigger = _.result(formConfig, 'dealOptions.sub[0].trigger');
        if (dealdata && dealdata.result && dealdata.result === trigger) {
          subResultVisible = true;
        } else {
          subResultVisible = false;
        }
      } else {
        if (problem.yjfl === '证据') {
          showSubResult = true;
          let trigger = _.result(formConfig, 'dealOptions.sub[0].trigger');
          if (dealdata && dealdata.result && dealdata.result === trigger) {
            subResultVisible = true;
          } else {
            subResultVisible = false;
          }
        }
      }

      let cwlxVisible = false;
      const {xtwt} = problem;
      if (xtwt && xtwt.zbjg === 'B') {
        cwlxVisible = true;
      }

      this.setState({
        showSubResult, subResultVisible, formConfig, cwlxVisible, problem,
        yjfl: data ? data.yjfl : ''
      });
    });
  };

  /**
   * @param e
   */
  onChange = (e) => {
    const {problem, formConfig} = this.state;
    if (problem.yjfl === '证据' || (this.props.stage && this.props.stage === 'SP')) {
      const checkedValue = e.target.value;
      let trigger = _.result(formConfig, 'dealOptions.sub[0].trigger');

      if (checkedValue === trigger) {
        this.setState({subResultVisible: true});
      } else {
        this.setState({subResultVisible: false});
      }
    }
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
    const {problem = {}, formConfig = {}, showSubResult} = this.state;
    const {getFieldDecorator} = this.props.form;
    const dealData = problem.dealdata || {};
    const xtwt = problem.xtwt || {};

    //dealData中不存在result时，使用问题数据的zzjg字段代替
    if(!_.has(dealData, 'result')){
      dealData.result = problem.zzjg;
    }

    return (
      <Form style={{height: '100%'}} className={styles.default}>
        <Tabs defaultActiveKey={'1'} type="card" style={{height: '100%'}}>
          <TabPane tab={<span><Icon type="file-text"/>办案笔记</span>} key="1">
            <Col span={24} style={{height: '90%'}}>
              <OcrWrapper onClick={()=> this.onOcrClick('advice')}>
              {getFieldDecorator('advice', {
                initialValue: dealData.advice,
              })(
                <TextArea placeholder="从卷宗选择内容摘录或输入办案笔记"
                          style={{height: `100%`}}/>,
              )}
              </OcrWrapper>
            </Col>
          </TabPane>
          <TabPane tab={<span><Icon type="form"/>问题处理</span>} key="2">
            <Col span={24}>
              {
                formConfig.dealOptions && <FormBulider fieldConfig={formConfig.dealOptions}
                                                        fieldData={dealData[formConfig.dealOptions.name]}
                                                        getFieldDecorator={getFieldDecorator}
                                                        onChange={this.onChange}/>
              }
              {
                showSubResult && (
                  <div style={{display: this.state.subResultVisible ? 'block' : 'none'}}>
                    <FormBulider fieldConfig={{
                      type: 'RadioGroup',
                      name: 'subResult',
                      label: ' ',
                      options: {
                        A: '确认合法',
                        B: '确认非法',
                        C: '无法确认',
                      },
                    }} fieldData={dealData['subResult']} getFieldDecorator={getFieldDecorator}/>
                  </div>
                )
              }
              {
                formConfig.fields && formConfig.fields.map((fc, index) => {
                  let fieldData = dealData[fc.name];
                  return <FormBulider key={index} fieldConfig={fc} fieldData={fieldData}
                                      getFieldDecorator={getFieldDecorator}/>;
                })
              }
              {
                formConfig.documents && <FormBulider fieldConfig={formConfig.documents}
                                                      fieldData={dealData[formConfig.documents.name]}
                                                      getFieldDecorator={getFieldDecorator}/>
              }
            </Col>
          </TabPane>
          <TabPane tab={<span><Icon type="solution"/>系统问题反馈</span>} key="3">
            <FormBulider fieldConfig={{
              'type': 'RadioGroup',
              'name': 'zbjg',
              'label': '甄别结果',
              'options': {
                'A': '正确',
                'B': '错误',
              },
            }} fieldData={xtwt.zbjg} getFieldDecorator={getFieldDecorator} onChange={(e) => {
              this.setState({
                disabled: false,
                cwlxVisible: e.target.value === 'B',
              })
            }}/>
            <div style={{display: this.state.cwlxVisible ? 'block' : 'none'}}>
              <FormBulider fieldConfig={{
                'type': 'RadioGroup',
                'name': 'cwlx',
                'label': ' ',
                default: 'C',
                'options': {
                  'A': '规则问题',
                  'B': '识别问题',
                  'C': '其它问题',
                },
              }} fieldData={xtwt.cwlx} getFieldDecorator={getFieldDecorator}/>
            </div>

            <FormBulider fieldConfig={{
              'type': 'Textarea',
              'name': 'wtms',
              'label': '改进建议',
              'row': 8,
            }} fieldData={xtwt.wtms} getFieldDecorator={getFieldDecorator}/>
          </TabPane>
        </Tabs>
        <div
          style={{
            position: 'absolute',
            width: '100%',
            bottom: '8px',
            left: 0,
            padding: '4px 10px',
            textAlign: 'right',
          }}>
          <Button type="primary" onClick={this.handleOk}>保存</Button>
        </div>
      </Form>
    );
  }
}

export default Form.create()(ProblemDealForm);
