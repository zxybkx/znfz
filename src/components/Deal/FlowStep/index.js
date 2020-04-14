import React, {PureComponent} from 'react';
import { Steps, Icon ,Modal} from 'antd';
import {routerRedux} from 'dva/router';
import {PROCESS_SIMPLE, PROVENCE_CODE} from '../../../constant';
const Step = Steps.Step;

const STEP_CONFIG = {
  "320": {
    "document": "document",
    "process": "process",
  },
  "530": {
    "document" : "documentx",
    "process" : "processx"
  }
};

export default class FlowStep extends PureComponent{

  constructor(props){
    super(props);
    // const {ajxx} = props;
    // let simple = false;
    // if(ajxx){
    //   simple = PROCESS_SIMPLE.indexOf(ajxx.ysay_aymc)>= 0;
    // }
    // this.state = { simple };
  }

  componentWillReceiveProps(nextProps){
    // const {ajxx} = nextProps;
    // this.setState({simple: PROCESS_SIMPLE.indexOf(ajxx.ysay_aymc)>= 0})
  }

  getStepByProvence = (step) => {
    const provenceStep = STEP_CONFIG[PROVENCE_CODE][step];
    return provenceStep ? provenceStep : step;
  };

  onStepClick = (step) => {
    const { dispatch, stage, ajxx, bmsah} = this.props;
    const base = stage === 'ZJ' ? 'zcjd' : stage === 'GS' ? 'gsjd' : 'spjd';
    const sub = stage === 'SP' ? 'spdeal' : 'deal';
    const pathname = `/${base}/${sub}/${bmsah}/${this.getStepByProvence(step)}`;

    if(stage === 'SP'){
      dispatch({
        type: 'znfz/getAllpd',
        payload: {
          bmsah: bmsah
        }
      }).then(({data, success})=>{
        if(data && success){
          const scx = data["待处理的审查项"];
          if ( step === "document" &&  scx !== 0) {
            const tipTdwo = scx !== 0 ? ` ${scx} 个未审核的疑点或重点项` : '';
            Modal.info({
              title: <span>您有前一阶段的工作未完成</span>,
              content: `您尚有${tipTdwo}。请先在"阅卷审查"页面完成上述内容的审核工作，再进行本项操作。`,
              okText: '确定',
              onOk() {
              },
            });
          }else{
            dispatch(routerRedux.push({
              pathname: pathname,
              query: {
                stage: stage,
                bmsah: bmsah,
                tysah: ajxx.tysah,
                ysay: ajxx.ysay_aymc,
              }
            }));
          }
        }
      })
    }else{
      dispatch(routerRedux.push({
        pathname: pathname,
        query: {
          stage: stage,
          bmsah: bmsah,
          tysah: ajxx.tysah,
          ysay: ajxx.ysay_aymc,
        }
      }));
    }
  };

  returnToMainPage = () => {
    const { dispatch, stage} = this.props;
    const base = stage === 'ZJ' ? 'zcjd' : stage === 'GS' ? 'gsjd' : 'spjd';
    const pathname = `/${base}`;
    dispatch(routerRedux.push({
      pathname: pathname,
    }));
  };

  isCurrent = (step) => {
    const { match: {path} } = this.props;
    return path && path.indexOf(step) >= 0;
  };

  render(){
    // const {simple} = this.state;
    const {stage} = this.props;
    if(stage === 'SP'){
      return (
        <Steps>
          <Step status={'wait'} title={<a onClick={this.returnToMainPage}>任务列表</a>} icon={<Icon type='bars' />} />
          <Step status={this.isCurrent('file') ?'finish' : 'wait'} title={<a onClick={()=>this.onStepClick('file')}>阅卷审查</a>} icon={<Icon type='folder' />} />
          {/*<Step status={this.isCurrent('question') ?'finish' : 'wait'} title={<a onClick={()=>this.onStepClick('question')}>疑点推送</a>} icon={<Icon type='question-circle' />} />*/}
          <Step status={this.isCurrent('document') ?'finish' : 'wait'} title={<a onClick={()=>this.onStepClick('document')}>审查结论</a>} icon={<Icon type='edit' />} />
        </Steps>
      );
    }else{

      return (
        <Steps>
          <Step status={'wait'} title={<a onClick={this.returnToMainPage}>任务列表</a>} icon={<Icon type='bars' />} />
          <Step status={this.isCurrent('case') ?'finish' : 'wait'} title={<a onClick={()=>this.onStepClick('case')}>基本案情</a>} icon={<Icon type='book' />} />
          <Step status={this.isCurrent('file') ?'finish' : 'wait'} title={<a onClick={()=>this.onStepClick('file')}>阅卷核查</a>} icon={<Icon type='folder' />} />
          <Step status={this.isCurrent('question') ?'finish' : 'wait'} title={<a onClick={()=>this.onStepClick('question')}>案件审查</a>} icon={<Icon type='question-circle' />} />
          <Step status={this.isCurrent('process') ?'finish' : 'wait'} title={<a onClick={()=>this.onStepClick('process')}>讯问提纲</a>} icon={<Icon type='file-unknown' />} />
          <Step status={this.isCurrent('conclusion') ?'finish' : 'wait'} title={<a onClick={()=>this.onStepClick('conclusion')}>审查结论</a>} icon={<Icon type='file-text' />} />
          <Step status={this.isCurrent('document') ?'finish' : 'wait'} title={<a onClick={()=>this.onStepClick('document')}>文书编辑</a>} icon={<Icon type='edit' />} />
          <Step status={this.isCurrent('finish') ?'finish' : 'wait'} title={<a onClick={()=>this.onStepClick('finish')}>办结案件</a>} icon={<Icon type='check-circle' />} />
        </Steps>
      );
    }
  }
}
