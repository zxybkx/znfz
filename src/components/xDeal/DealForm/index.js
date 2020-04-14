import React, {PureComponent, Fragment} from 'react';
import {Card, Button, Divider, Form, Input, message} from 'antd';
import moment from 'moment';
import 'moment/locale/zh-cn';
import _ from 'lodash';
import classnames from 'classnames';
import OcrWrapper from 'lib/OcrWrapper';
import FormBulider from 'utils/FormBuilder';
import styles from './index.less';
import {PROVENCE_SHORT_CODE} from '../../../constant';

const {TextArea} = Input;
@Form.create({
  mapPropsToFields(props) {
    const dealdata = props.problem ? props.problem.dealdata || {} : {};
    return _.mapValues(dealdata, (v, k) => {
      // if (k !== 'advice' && (/\d+-\d+/.test(v) || /\d+年\d+月\d+日/.test(v))) {
      //   v = moment(v, 'YYYY-MM-DD')
      // }
      return Form.createFormField({k, value: v})
    });
  },
})
export default class Index extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      activeTab: '工作笔记',
      ajxx: props.ajxx,
      problem: props.problem,
      formConfig: {},
      subResultVisible: false,
      hasSubResult: false,
      cwlxVisible: false,
      yjfl: '',
    }
  }

  componentDidMount() {
    this.getFormConfig();
  }


  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.problem, nextProps.problem)) {
      this.setState({problem: nextProps.problem});
      if (_.isEmpty(this.state.formConfig) || nextProps.problem.id !== this.props.problem.id) {
        this.getFormConfig(nextProps.problem);
      }
    }
  }

  onTabChange = (key) => {
    this.setState({activeTab: key})
  };

  saveData = (data) => {
    const {stage, close, dispatch} = this.props;
    const {problem} = this.state;
    const xtwt = {
      pid: problem.id,
      keyid: problem.keyid,
      bmsah: problem.bmsah,
      tysah: problem.tysah,
      yjfl: problem.yjfl,
      gzmc: problem.gzmc,
      zbjg: data.zbjg,
      cwlx: data.zbjg === 'B' ? data.cwlx : null,
      wtms: data.wtms,
    };

    delete data.zbjg;
    delete data.cwlx;
    delete data.wtms;

    if (xtwt.zbjg) {
      dispatch({
        type: `znfz/saveXtwt`,
        payload: {
          data: xtwt,
        },
      });
    }

    if(data.resultLabel && data.resultLabel==='违法' && (data.document && data.document.length < 1 || data.document === undefined)){
        message.warning('保存失败！原因：处理结果为“违法”时，生成文书必选！')
    }else{
      if (data && !_.isEmpty(data)) {
        dispatch({
          type: `znfz/saveProblem`,
          payload: {
            stage: stage,
            data: data,
            id: problem.id,
          },
        }).then(() => {
          this.props.reload && this.props.reload();
        });
      }
    }
  };

  handleOk = () => {
    const {validateFields, getFieldsValue} = this.props.form;
    const {problem} = this.state;
    validateFields((errors) => {
      if (errors) {
        message.info('信息请填写完整');
        return;
      }
      const data = {...getFieldsValue()};
      const repAdvice = data.advice && data.advice.replace(/\<|>|《|》/g,'');
      repAdvice && _.set(data, 'advice', repAdvice);
      /**
       * 目前仅对  ss_option 中的 date 做了处理
       */
      _.map(this.state.formConfig.fields, (row) => {

        // if ((row.type && _.trim(row.type).toLowerCase() === 'date') || moment.isMoment(_.result(data, row.name))) {
        //   _.set(data, row.name, moment(_.result(data, row.name)).format('YYYY-MM-DD HH:mm:ss'));
        // }
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

      _.set(data, 'resultLabel', _.result(dealOptions, `options.${dealResult}`));

      // 判断前台是否有对应的ruledata的字段


      if (_.has(this.state.formConfigs, 'hasFields')) {
        _.set(data, 'hasFields', true);
      } else {
        _.set(data, 'hasFields', false);
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
            // console.log(1, this.state.yjfl)
            _.set(data, 'category', selectCategory === 'legal' ? '确认存在' : '确认不存在');
          } else {
            // console.log(2, this.state.yjfl)
            _.set(data, 'category', selectCategory === 'legal' ? '确认合法' : '确认非法');
          }
        }
      }

      let _data = Object.assign({}, problem.dealdata, data);
      this.saveData(_data);
    });
  };

  getFormConfig(problem) {
    const {stage, dispatch, ajxx = {}} = this.props;
    if (!problem) {
      problem = this.props.problem || {};
    }
    dispatch({
      type: 'znfz/getFormConfig',
      payload: {
        yjfl: problem.yjfl,
        keyId: problem.keyid,
        ysay: ajxx.ysay_aymc,
        stage: _.toUpper(stage),
        dwbm: PROVENCE_SHORT_CODE,
      },
    }).then(({data}) => {
      const formConfig = data && data.jsondata ? data.jsondata : {};
      const {dealdata = {}} = problem;

      let hasSubResult = false;
      let subResultVisible = false;
      if (this.props.stage && this.props.stage === 'SP') {
        hasSubResult = true;
        let trigger = _.result(formConfig, 'dealOptions.sub[0].trigger');
        if (dealdata && dealdata.result && dealdata.result === trigger) {
          subResultVisible = true;
        } else {
          subResultVisible = false;
        }
      } else {
        if (problem.yjfl === '证据') {
          hasSubResult = true;
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
        activeTab: '工作笔记', hasSubResult, subResultVisible, formConfig, cwlxVisible, problem,
        yjfl: data ? data.yjfl : ''
      });
    });
  };

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
    window.ocrListener = (value) => {
      const {getFieldValue, setFieldsValue} = this.props.form;
      const values = {};
      values[key] = (getFieldValue(key) || '') + value;
      setFieldsValue && setFieldsValue(values);
    }
  };

  renderAdvice = () => {
    const {form: {getFieldDecorator}} = this.props;
    const {problem} = this.state;
    const advice = problem && problem.dealdata && problem.dealdata.advice;
    // console.log(advice);
    return (
      <OcrWrapper onClick={() => this.onOcrClick('advice')}>
        {getFieldDecorator('advice', {
          initialValue: advice,
        })(<TextArea placeholder="从卷宗选择内容摘录或输入办案笔记" rows={12}/>)}
      </OcrWrapper>
    );
  };

  renderJlForm = () => {
    let {problem = {}, formConfig = {}, hasSubResult} = this.state;

    const {getFieldDecorator, setFieldsValue, getFieldValue} = this.props.form;
    const dealData = problem.dealdata || {};
    //dealData中不存在result时，使用问题数据的zzjg字段代替
    if (!_.has(dealData, 'result')) {
      dealData.result = problem.zzjg;
    }

    return (
      <Fragment>
        {
          formConfig.dealOptions && <FormBulider fieldConfig={formConfig.dealOptions}
                                                 fieldData={dealData[formConfig.dealOptions.name]}
                                                 getFieldDecorator={getFieldDecorator}
                                                 setFieldsValue={setFieldsValue}
                                                 getFieldValue={getFieldValue}
                                                 onChange={this.onChange}/>
        }
        {
          hasSubResult && (
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
              }} fieldData={dealData['subResult']} getFieldValue={getFieldValue} getFieldDecorator={getFieldDecorator} setFieldsValue={setFieldsValue}/>
            </div>
          )
        }
        {
          formConfig.fields && formConfig.fields.map((fc, index) => {
            let fieldData = dealData[fc.name];
            return <FormBulider key={index} fieldConfig={fc} fieldData={fieldData}
                                getFieldValue={getFieldValue} getFieldDecorator={getFieldDecorator} setFieldsValue={setFieldsValue}/>;
          })
        }
        {
          formConfig.documents && <FormBulider fieldConfig={formConfig.documents}
                                               fieldData={dealData[formConfig.documents.name]}
                                               setFieldsValue={setFieldsValue}
                                               getFieldValue={getFieldValue}
                                               getFieldDecorator={getFieldDecorator}/>
        }
      </Fragment>
    )
  };

  renderXtfk = () => {

    const {problem = {}} = this.state;
    const {getFieldDecorator, setFieldsValue, getFieldValue} = this.props.form;
    const xtwt = problem.xtwt || {};

    return (
      <Fragment>
        <FormBulider fieldConfig={{
          'type': 'RadioGroup',
          'name': 'zbjg',
          'label': '甄别结果',
          'options': {
            'A': '正确',
            'B': '错误',
          },
        }} fieldData={xtwt.zbjg} getFieldValue={getFieldValue} getFieldDecorator={getFieldDecorator} setFieldsValue={setFieldsValue} onChange={(e) => {
          this.setState({
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
          }} fieldData={xtwt.cwlx} getFieldValue={getFieldValue} getFieldDecorator={getFieldDecorator} setFieldsValue={setFieldsValue}/>
        </div>

        <FormBulider fieldConfig={{
          'type': 'Textarea',
          'name': 'wtms',
          'label': '改进建议',
          'row': 8,
        }} fieldData={xtwt.wtms} getFieldValue={getFieldValue} getFieldDecorator={getFieldDecorator} setFieldsValue={setFieldsValue}/>
      </Fragment>
    );
  };

  render() {

    const {activeTab} = this.state;

    const title = (
      <Fragment>
        <a className={classnames(styles.tabItem, activeTab === '工作笔记' ? styles.active : '')}
           onClick={() => this.onTabChange('工作笔记')}>工作笔记</a>
        <Divider type="vertical"/>
        <a className={classnames(styles.tabItem, activeTab === '问题处理' ? styles.active : '')}
           onClick={() => this.onTabChange('问题处理')}>问题处理</a>
        <Divider type="vertical"/>
        <a className={classnames(styles.tabItem, activeTab === '系统问题反馈' ? styles.active : '')}
           onClick={() => this.onTabChange('系统问题反馈')}>系统问题反馈</a>
      </Fragment>
    );
    const operations = <Button size={'small'} type={'primary'} onClick={this.handleOk} style={{marginRight:10}}>保存</Button>;

    return (
      <div className={styles.default}>
        <Card title={title} extra={operations}>
          <div className={styles.content} style={{display: activeTab === '工作笔记' ? 'block' : 'none'}}>
            {this.renderAdvice()}
          </div>
          <div className={styles.content} style={{display: activeTab === '问题处理' ? 'block' : 'none'}}>
            {this.renderJlForm()}
          </div>
          <div className={styles.content} style={{display: activeTab === '系统问题反馈' ? 'block' : 'none'}}>
            {this.renderXtfk()}
          </div>
        </Card>
      </div>
    );
  }
}
