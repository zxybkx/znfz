import React, {PureComponent} from 'react';
import _ from 'lodash';
import Ellipsis from 'lib/Ellipsis';
import {Col, Row, Steps, Icon, Popconfirm, Button, Collapse, List, message, Form, Modal} from 'antd';
import {PROVENCE_SHORT_CODE} from '../../../constant';
import View from './Views';
import AdmitGuilt from './AdmitGuilt';
import Document from './Document';
import Program from './Program';
import styles from './index.less';
const Step = Steps.Step;
const {Panel} = Collapse;

@Form.create()
export default class ConclusionStep extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      stepList: ['审查意见'],
      step: '审查意见',
      fzss: [],
      people: [],
    }
  }

  componentDidMount() {
    const {dispatch, match, znfz,ysay, stage} = this.props;
    const {params: {id}} = match;
    this.getStepList();

    dispatch({//通版
      type: 'znfz/tbflg',
      payload: {
        bmsah: id,
       },
      });
    dispatch({
      type: 'znfz/getAjxx',
      payload: {bmsah: id},
    });

    dispatch({
      type: 'znfz/getTree',
      payload: {bmsah: id},
    });

    dispatch({
      type: 'znfz/getFactList',
      payload: {bmsah: id},
    }).then(({success, data}) => {
      if (success && data) {
        const fzssData = [];
        data.forEach((o) => {
          const fzssItem = {};
          _.set(fzssItem, 'title', o.mergekey);
          _.set(fzssItem, 'rdfs', o.rdfs);
          if (o.rdfs && o.rdfs === '认定') {
            _.set(fzssItem, 'content', o.zhrddata);
          } else if (o.rdfs && o.rdfs === '不认定') {
            _.set(fzssItem, 'content', o.brdly);
          }
          fzssData.push(fzssItem);
        });

        const fzssSortedData = _.sortBy(fzssData, o => parseInt(o.title.substring(1)));
        this.setState({
          fzss: fzssSortedData,
        })
      }
    });
    this.getPeople()
  }

  getPeople=()=> {
    const {dispatch, match, znfz, ysay, stage} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: 'znfz/getConclusionRules',
      payload: {
        dwbm: PROVENCE_SHORT_CODE,
        ysay: ysay,
        stage: stage,
        bmsah: id,
      }
    }).then((rules) => {
      if (rules && rules.success && rules.data) {
        dispatch({
          type: 'znfz/getConclusionData',
          payload: {
            bmsah: id,
            ysay: ysay,
            stage: stage,
            dwbm: PROVENCE_SHORT_CODE,
          }
        }).then(({success, data}) => {
          const people = [];
          data && _.map(data, (v, k) => {
            people.push(k.replace(/\./g, "·"));
          });
          this.setState({
            people: people,
          });
        });
      }
    });
  };


  getStepList = () => {
    const {dispatch, match, znfz} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: 'znfz/getStepList',
      payload: {bmsah: id},
    }).then(({success, data}) => {
      if (success && data) {
        const newData = data[0] === '犯罪嫌疑人情况' ? ['审查意见', '文书制作'] : data;
        this.setState({
          stepList: newData
        })
      }
    });
  };


  onStepClick = (step) => {
    if (_.indexOf(this.state.stepList, step) >= 0) {
      this.setState({step});
    }
  };


  onChangeState = (step, stepList) => {
    this.setState({step, stepList})
  };


  dealData = () => {
    const {match, znfz,ysay,stage} = this.props;
    const {people} = this.state;
    const {params: {id}} = match;
    const payload = [];
    people.map((name, i) => {
      const itemData = {};
      _.set(itemData, 'ysay', ysay);
      _.set(itemData, 'stage', stage);
      _.set(itemData, 'bmsah', id);
      _.set(itemData, 'tysah', znfz.ajxx.tysah);
      _.set(itemData, 'mergekey', name);
      payload.push(itemData);
    });
    return payload;
  };


  changeAjzt = () => {
    const {znfz: {ajxx}, dispatch, match} = this.props;
    const {params: {id}} = match;
    if (!ajxx || !ajxx.bmsah) {
      return;
    }

    dispatch({
      type: 'znfz/resetBjsj',
      payload: {
        bmsah: id,
      }
    });

    dispatch({
      type: 'znfz/updateAJZT',
      payload: {
        bmsah: ajxx.bmsah,
        zt: 1,
      },
    }).then(({success}) => {
      if (success) {
        dispatch({
          type: 'znfz/sendStepList',
          payload: {
            bmsah: id,
            jllc: ['审查意见']
          }
        });
        dispatch({
          type: 'znfz/getAjxx',
          payload: {
            bmsah: ajxx.bmsah,
          },
        });
        //this.getConclusionData();
        this.setState({
          step: '审查意见',
          stepList: ['审查意见']
        })
      } else {
        message.error('操作失败')
      }
    })
  };

  finish = () => {
    const {znfz: {ajxx}, dispatch} = this.props;
    if (!ajxx || !ajxx.bmsah) {
      return;
    }
    dispatch({
      type: 'znfz/updateAJZT',
      payload: {
        bmsah: ajxx.bmsah,
        zt: 9,
      },
    }).then(() => {
      Modal.info({
        title: '案件已审结',
        okText: '确定',
        onOk(){
        }
      });
      dispatch({
        type: 'znfz/getAjxx',
        payload: {
          bmsah: ajxx.bmsah,
        },
      });
    })
  };

  render() {
    const {znfz, stage, dispatch, match, ysay} = this.props;
    const {step, stepList, fzss, rzrfData, people} = this.state;
    const {ajxx} = znfz;
    const {validateFields} = this.props.form;


    const gsStep = (
      <Steps>
        <Step status={step === '审查意见' ? 'finish' : 'wait'}
              title={<a onClick={() => this.onStepClick('审查意见')}>审查意见</a>}
              icon={<Icon type="file"/>}/>
        <Step status={step === '文书制作' ? 'finish' : 'wait'}
              title={<a onClick={() => this.onStepClick('文书制作')}>文书制作</a>}
              icon={<Icon type="form"/>}/>
      </Steps>
    );


    const zjStep = (
      <Steps>
        <Step status={step === '审查意见' ? 'finish' : 'wait'}
              title={<a onClick={() => this.onStepClick('审查意见')}>审查意见</a>}
              icon={<Icon type="file"/>}/>
        <Step status={step === '文书制作' ? 'finish' : 'wait'}
              title={<a onClick={() => this.onStepClick('文书制作')}>文书制作</a>}
              icon={<Icon type="form"/>}/>
      </Steps>
    );

    const viewProps = {
      dispatch,
      match,
      znfz,
      stage,
      ysay,
      fzss,
      step,
      onChangeState:  ajxx.ajzt && ajxx.ajzt.zt === 9  ? '': this.onChangeState,
    };

    const AdmitGuiltProps = {
      dispatch,
      znfz,
      match,
      stage,
      ysay,
      onChangeState:  ajxx.ajzt && ajxx.ajzt.zt === 9  ? '': this.onChangeState,
      getRzrfData: this.getRzrfData,
    };


    const documentsProps = {
      znfz,
      ajxx,
      match,
      ysay,
      stage,
      dispatch,
      finish: this.finish,
    };

    const ProgramProps = {
      people: people,
      validateFields,
      onChangeState:  ajxx.ajzt && ajxx.ajzt.zt === 9  ? '': this.onChangeState,
    };

    return (
      <div>
        {/*步骤条*/}
        <Row>
          <Col span={19}>
            {stage === 'GS' ? gsStep : stage === 'ZJ' ? zjStep : ''}
          </Col>
          <Col span={2} offset={2}>
            {
              ajxx.ajzt && ajxx.ajzt.zt === 9 &&
              <Popconfirm title="确定进行修改审查结论操作吗?" onConfirm={this.changeAjzt}>
                <Button type='primary'
                        icon='edit'>
                  修改审查结论
                </Button>
              </Popconfirm>
            }
          </Col>
        </Row>

        {/*犯罪事实*/}
        <Collapse>
          <Panel
          className={this.props.znfz.tbflg.tbflag === 'T'?styles.generalEdit:''}
          header={<span style={{fontSize: '15px'}}>犯罪事实</span>} key="1">
            <List
              grid={{gutter: 16, column: 2}}
              dataSource={this.state.fzss}
              renderItem={item => {
                let zhrdData;
                if (item.rdfs && item.rdfs === '认定') {
                  zhrdData = item.content ? _.get(item.content, '经审查认定的事实') : null;
                } else {
                  zhrdData = item.content;
                }

                return (
                  <List.Item>
                    <List.Item.Meta
                      title={<span>{item.title}</span>}
                      description={
                        item.rdfs ? <Ellipsis lines={1} tooltip style={{
                          height: '22px',
                          lineHeight: '22px'
                        }}>{item.rdfs === '认定' ? `经审查认定的事实：${zhrdData}` : `不认定：${zhrdData}`}</Ellipsis> :
                          <span style={{height: '22px', lineHeight: '22px'}}>暂未认定</span>
                      }
                    />
                  </List.Item>
                )
              }}
            />
          </Panel>
        </Collapse>
        {
          step === '审查意见' ?
            <View {...viewProps} wrappedComponentRef={c => this.scyjView = c}/> :
            step === '认罪认罚' ?
              <AdmitGuilt {...AdmitGuiltProps}/> :
              step === '适用程序' ?
                <Program {...this.props} {...ProgramProps} people={people}
                         wrappedComponentRef={c => this.program = c}/> :
                step === '文书制作' ?
                  <div>
                    <Document {...documentsProps} wrappedComponentRef={c => this.document = c}/>
                  </div> : ''
        }
      </div>
    )
  }
}
