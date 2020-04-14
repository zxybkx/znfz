import React, { PureComponent } from 'react';
import { Steps, Icon, Dropdown, Menu, message, Modal, confTooltip } from 'antd';
import { routerRedux } from 'dva/router';
import styles from './index.less';
import FrameModal from 'lib/Frame/FrameModal';
import { connect } from 'dva';
// import NewFrameModal from '../../../lib/Frame/FrameModal';
import NewFrameModal from 'lib/Frame/NewFrameModal';
import Session from 'utils/session';

const Step = Steps.Step;
const confirm = Modal.confirm;
const qs = require("querystring");
const context = process.env.NODE_ENV === 'production' ? '/cm' : '';

@connect(({ global, znfz, zcjd, loading }) => ({
  global,
  znfz,
  zcjd,
}))
export default class FlowStep extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      title: {},
      image: {},
      imageSource: [],
      activeTab: '基本案情',
      rightVisible: false,
      data: props.data,
      currentIndex: props.currentIndex,
      cascadeProblemList: [],
      leftImage: [],
      rightImage: [],
      markList: [],
      jzmc: '',
      jnbmfw: [-1, -1],
      scrollPageNum: 0,
      docNlp: {},
      elseSave: true,
      fileKey: '',
    }
  }

  componentDidMount() {
    const { dispatch, match, znfz, ysay, stage } = this.props;
    const { params: { id } } = match;

    dispatch({//通版
      type: 'znfz/tbflg',
      payload: {
        bmsah: id,
      },
    });
    // this.getMark()
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (!_.isEqual(this.props.data, nextProps.data) || nextProps.currentIndex !== this.props.currentIndex) {
      this.setState({
        currentIndex: nextProps.currentIndex,
        data: nextProps.data,
      }, () => {
        this.loadData();
        this.getMark();
      });
    }
  }

  getMenus = () => {
    const { current } = this.state;
    const { activeTab } = this.state;
    const { bmsah, stage, tysah, ysay_aymc, znfz, ajxx } = this.props;

    const { znfz: { docTree } } = this.props;
    const params = {
      bmsah: bmsah,
      ajxx: bmsah,
      tysah: tysah,
      ysay: ysay_aymc,
      stage,
      docTree: docTree,
      rightSource: `${context}/currencydeal/${bmsah}/document`,
    };

    const tools = require('../../../common/tools.json');
    const lx = tools.lx;
    const la = tools.la;


    const electronEnv = navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0;
    const session = Session.get();
    const akParams = {
      bmsah: bmsah,
      dwbm: session.dwbm,
      gh: session.gh
    };

    return (
      //step列表切换
      <div className={styles.steps}>
        <div className={styles.goback}>
          <a onClick={this.returnToMainPage}>
            <div className={styles.icon}></div>
          </a>
        </div>
        <div className={styles.setepsr}>
          {
            // this.props.znfz.tbflg.tbflag !== 'T' ?
              <Steps type="navigation"
                current={current}
                onChange={this.onChange}>
                <Step status={this.isCurrent('case') ? 'finish' : 'wait'}
                  title={<a onClick={() => this.onStepClick('case', '基本案情')}

                  >基本案情</a>} />
                <Step status={this.isCurrent('file') ? 'finish' : 'wait'}

                  title={<a onClick={() => this.onStepClick('file', '阅卷核查')}

                  >阅卷核查</a>} />
                <Step status={this.isCurrent('doubtfulPoint') ? 'finish' : 'wait'}

                  title={<a onClick={() => this.onStepClick('doubtfulPoint', '审查处理')}

                  >审查处理</a>} />
                <Step status={this.isCurrent('conclusion') ? 'finish' : 'wait'}

                  title={<a onClick={() => this.onStepClick('conclusion', '审查结论')}
                  >审查结论</a>} />
              </Steps>
              // :
              // <Steps type="navigation"
              //   current={current}
              //   onChange={this.onChange}
              // >
              //   <Step status={this.isCurrent('case') ? 'finish' : 'wait'}
              //     title={<a onClick={() => this.onStepClick('case')}
              //     >基本案情</a>} />
              //   <Step status={this.isCurrent('file') ? 'finish' : 'wait'}
              //     title={<a onClick={() => this.onStepClick('file')}
              //     >阅卷核查</a>} />

              //   <Step status={this.isCurrent('conclusion') ? 'finish' : 'wait'}
              //     title={<a onClick={() => this.onStepClick('conclusion')}
              //     >审查结论</a>} />
              // </Steps>
          }


        </div>
        {/* <div className={styles.setepsr}>

              <Steps type="navigation"
                     current={current}
                     onChange={this.onChange}>
                <Step status={this.isCurrent('case') ? 'finish' : 'wait'}
                      title={<a onClick={() => this.onStepClick('case', '基本案情')}

                      >基本案情</a>}/>
                <Step status={this.isCurrent('file') ? 'finish' : 'wait'}

                      title={<a onClick={() => this.onStepClick('file', '阅卷核查')}

                      >阅卷核查</a>}/>
                <Step status={this.isCurrent('doubtfulPoint') ? 'finish' : 'wait'}

                      title={<a onClick={() => this.onStepClick('doubtfulPoint', '审查处理')}

                      >审查处理</a>}/>
                <Step status={this.isCurrent('conclusion') ? 'finish' : 'wait'}

                      title={<a onClick={() => this.onStepClick('conclusion', '审查结论')}
                      >审查结论</a>}/>
                <Step status={this.isCurrent('word') ? 'finish' : 'wait'}

                      title={<a onClick={() => this.onStepClick('word', '文书制作')}
                      >
                        <NewFrameModal title="文书制作"
                                       src={`${context}/currencydeal/${ajxx && ajxx.bmsah}/document`}
                                       params={params}
                                       icon="form">
                          文书制作
                        </NewFrameModal>
                      </a>}/>
              </Steps>
        </div> */}
      </div>
    );
  };


  onChange = current => {
    this.setState({ current })
  };
  //路由导航
  onStepClick = (step) => {
    new Promise(resolve => {
      this.props.onStepClick && this.props.onStepClick();
      resolve()
    }).then(() => setTimeout(() => this.StepClick(step), 1000));
  };

  StepClick = (step) => {
    const { dispatch, stage, ajxx, bmsah, znfz } = this.props;
    // console.log()
    const pathname = `/currencydeal/${bmsah}/${step}`;
    const base = stage === 'ZJ' ? 'zcjd' : stage === 'GS' ? 'gsjd' : 'spjd';
    const sub = stage === 'SP' ? 'spdeal' : 'deal';
    if ((stage === 'GS' || stage === 'ZJ') ) {
      dispatch({
        type: 'znfz/getAllpd',
        payload: {
          bmsah: bmsah
        }
      }).then(({ data, success }) => {
        if ((step == 'conclusion') && (data["待审核的事实"] !== data["已审核的事实"])) {
          Modal.info({
            title: <span>您有前一阶段的工作未完成</span>,
            content: `事实未处理。请先在"审查处理"页面审核，再进行本项操作。`,
            okText: '确定',
            onOk() {
            },
          });
        } else {
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
      })
    }
  };

  returnToMainPage = () => {
    const { dispatch, stage } = this.props;
    const base = stage === 'ZJ' ? 'zcjd' : stage === 'GS' ? 'gsjd' : 'spjd';
    const pathname = `/${base}`;
    dispatch(routerRedux.push({
      pathname: pathname,
    }));
  };

  isCurrent = (step, stype) => {
    const { match: { path }, location } = this.props;
    if (!location) {
      if (step === 'doubtfulPoint') {
        return path && path.indexOf(step) >= 0 || path && path.indexOf('fact') >= 0;
      }
      return path && path.indexOf(step) >= 0;
    } else {
      const { query: { type = '1' } } = location;
      return stype === type;
    }
  };

  render() {
    return (
      <div className={styles.default} ref={c => this.container = c}>
        {this.getMenus()}
      </div>
    );
  }
}
