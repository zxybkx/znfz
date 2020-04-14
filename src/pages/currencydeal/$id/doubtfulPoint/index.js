/**
 * 案件审查
 */
import React, {PureComponent, Fragment} from 'react';
import {connect} from 'dva';
import {Tabs, Card, Spin, Icon, Button, Checkbox, Switch} from 'antd';
import classnames from 'classnames';
import _ from 'lodash';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import {ToggleTrigger} from 'components/xDeal/Trigger';
import FlowStep from 'components/currencydeal/FlowStep';
import Tools from 'components/currencydeal/Tools';
import ProblemList from 'components/xDeal/Fact/ProblemList';
import Authorized from 'utils/Authorized';
import {PROVENCE_SHORT_CODE} from 'constant';
import {StatusTab} from 'components/xDeal/Tabs';
import styles from './index.less';
import GZMain from './components/Main';
import SubProblem from 'components/xDeal/Fact/SubProblem';
import SubFactProblem from 'components/xDeal/SubFactProblem';
import Simple from 'components/xDeal/Fact';
import DoubtFact from 'components/xDeal/DoubtFact';

const {AuthorizedRoute} = Authorized;
const Panel = Tabs.TabPane;

class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showDetail: false,
      allProblemList: [],
      subProblemList: [],
      keyid: '',
      subProblemCurrent: {},
      subMergekey: '',
      tabkey: '',
      flfg: [],
      title: '',
      count: {},
      facts: [],
      currentFact: {},
      showJbsssc: false,
      showAllProblemList: false,
      isSimple: true,
      factMaterials: [],
      enumerate: {},
      showRight: false,
      activeKey: '',
      scdj: [],
      result: [],
      flag: false,
    }
  }


  componentDidMount() {
    const {dispatch, match, location: {query}} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: 'znfz/getAjxx',
      payload: {
        bmsah: id,
      },
    });

    this.getFacts();
    this.getProblems(query && query.type === 'sssc');
    this.getFactMaterials();
    this.getEnumerate()
  }

  getFacts = (factId) => {
    const {dispatch, match} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: 'znfz/getFactList',
      payload: {
        bmsah: id,
      },
    }).then(({success, data}) => {
      if (success && data) {
        const newData = data && data.length > 0 ? data.map((item, index) => {
          return ({
            ...item,
            mergekey: `第${index + 1}笔`
          })
        }) : [];
        const countData = {};
        const total = newData.length;
        const reviewed = _.filter(newData, (n) => {
          return n.dqzt === 1;
        }).length;

        _.set(countData, 'total', total);
        _.set(countData, 'unreviewed', total - reviewed);
        _.set(countData, 'reviewed', reviewed);


        const orderedData = _.orderBy(newData, 'orderBy');
        const currentFact = factId ? _.find(orderedData, (o) => o.id === factId) : orderedData[0];

        this.setState({
          count: countData,
          facts: orderedData,
          currentFact: currentFact,
        })
      }
    });
  };

  getProblems = (type) => {
    const {dispatch, match: {params: {id}}, location: {query: {stage}}} = this.props;
    dispatch({
      type: stage === 'ZJ' ? 'znfz/getZJProblemList' : stage === 'GS' ? 'znfz/getGSProblemList' : '',
      payload: {
        bmsah: id,
      },
    }).then((data) => {
      this.setState({
        allProblemList: data,
      }, () => {
        if (type) {

          this.showJbsssc(true)
        } else {
          this.onTabChange('合法性审查')
        }
      });
    });
  };

  reload = (showJbsssc) => {
    const {currentFact} = this.state;
    if(currentFact.id) {
      this.getFacts(currentFact.id);
    } else {
      this.getFacts();
    }
    const {dispatch, match: {params: {id}}, location: {query: {stage}}} = this.props;
    dispatch({
      type: stage === 'ZJ' ? 'znfz/getZJProblemList' : stage === 'GS' ? 'znfz/getGSProblemList' : '',
      payload: {
        bmsah: id,
      },
    }).then((data) => {
      this.setState({
        allProblemList: data,
      }, () => {
        if (showJbsssc) {
          this.showJbsssc(true)
        } else {
          this.getSubProblem(this.state.keyid);
        }
      });
    });
  };


  onTabChange = (key) => {
    const current = this.dealProblemList(key);
    const keyid = current.length > 0 ? current[0].keyid : '';
    const {dispatch, location: {query}, location: {query: {ysay, stage}}, match, znfz, zjmainLoading, gsmainLoading} = this.props;
    const {params: {id}} = match;

    this.setState({
      activeKey: keyid
    }, () => {
      if (keyid) {
        this.getSubProblem(keyid);
      } else {
        if (key === '事实') {
          if (ysay === '故意伤害罪') {
            dispatch({
              type: stage === 'ZJ' ? 'znfz/getZJSubProblemByKey' : stage === 'GS' ? 'znfz/getGSSubProblemByKey' : '',
              payload: {
                bmsah: id,
                keyid: '事实_客观行为_被害人残疾等级'
              }
            }).then((response) => {
              this.setState({result: response})
            })
          }
          this.showJbsssc(true);
        } else {
          this.setState({
            keyid: '',
            subProblemList: [],
            subProblemCurrent: {},
            subMergekey: ''
          });
        }
      }
    })
  };

  showAllProblemList = (e) => {
    this.setState({
      showAllProblemList: e.target.checked
    })
  };

  dealProblemList = (yjfl) => {
    const {allProblemList, showAllProblemList} = this.state;
    // const problemList = _.filter(allProblemList, (d) => d.yjfl === yjfl);
    const problemList = yjfl === '合法性审查' ?
      _.filter(allProblemList, (d) => d.yjfl === '程序' || d.yjfl === '证据') :
      _.filter(allProblemList, (d) => d.yjfl === yjfl);
    const current = _.filter(problemList, d => d.dqzt === '疑点' || d.dqzt === '重点' || d.dqzt === '确认非法' || d.dqzt === '确认合法' || d.dqzt === '确认存在' || d.dqzt === '确认不存在');
    const data = showAllProblemList ? problemList : current;
    return _.orderBy(data, d => [d.znfz_icon.orderby, d.gzmc]);
  };


  getSubProblem = (keyid) => {
    const {dispatch, match, location: {query: {stage}}} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: stage === 'ZJ' ? 'znfz/getZJSubProblemByKey' : stage === 'GS' ? 'znfz/getGSSubProblemByKey' : '',
      payload: {
        bmsah: id,
        keyid: keyid,
      },
    }).then(data => {
      const _data = _.orderBy(data, d => [d.znfz_icon.orderby, d.gzmc]);
      this.setState({
        keyid: keyid,
        subProblemList: _data || [],
        subProblemCurrent: _data && _data.length > 0 ? _data[0] : {},
        subMergekey: _data && _data.length > 0 ? _data[0].mergekey : ''
      });
      this.showJbsssc(false);
    });

    this.getFlfg(keyid);
  };

  onListClick = (o) => {
    this.setState({
      activeKey: o.keyid
    }, () => {
      this.getSubProblem(this.state.activeKey);
    })
  };

  // 点击子规则列表，获取问题描述、工作笔记等
  onSubClick = (data) => {
    this.setState({
      subProblemCurrent: data,
      subMergekey: data.mergekey
    });
  };

  onSubFactClick = (data) => {
    const {dispatch, match, location: {query: {stage}}} = this.props;
    const {params: {id}} = match;
    const {result} = this.state;
    if (data.rdfs === null) {
      this.setState({flag: true});
      _.map(result, (item) => {
        if (data.mergekey === item.mergekey) {

          const scdj = item.ruledata.result;
          this.setState({
            scdj
          })
        }
      })
    }

    this.setState({
      currentFact: data,
    });
  };

  getEnumerate = () => {
    const {dispatch, match: {params: {id}}} = this.props;
    dispatch({
      type: 'znfz/get_enumerate',
    }).then(({data, success}) => {
      if (data && success) {
        this.setState({
          enumerate: data
        })
      }
    })
  };

  getFactMaterials = () => {
    const {dispatch, match: {params: {id}}} = this.props;
    dispatch({
      type: 'znfz/getFactMaterials',
      payload: {
        bmsah: id,
      },
    }).then(({success, data}) => {
      if (success && data) {
        this.setState({
          factMaterials: data
        })
      }
    });
  };

  getFlfg = (keyid) => {
    const {dispatch, match} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: 'znfz/getFlfgByKey',
      payload: {
        bmsah: id,
        keyid: keyid,
        dwbm: PROVENCE_SHORT_CODE,
      },
    }).then((data) => {
      this.setState({
        flfg: data && data.law || [],
      });
    });
  };

  showJbsssc = (showJbsssc) => {
    this.setState({
      showJbsssc: showJbsssc
    })
  };

  showRight = () => {
    this.setState({
      showRight: !this.state.showRight
    })
  };

  isSimple = (checked) => {
    this.setState({
      isSimple: checked
    })
  };

  render() {
    const {
      subProblemList, subMergekey, flfg, subProblemCurrent, showRight,
      showJbsssc, count, facts, isSimple, currentFact, factMaterials, enumerate, scdj, flag
    } = this.state;
    const {dispatch, location: {query}, location: {query: {ysay}}, match, znfz, zjmainLoading, gsmainLoading} = this.props;
    const {params: {id}} = match;
    const {ajxx, viewDocTree, coords} = znfz;
    const flowStep = (
      <div className={styles.flow}>
        <div className={styles.steps}>
          <FlowStep match={match}
                    dispatch={dispatch}
                    bmsah={id}
                    stage={query.stage}
                    ajxx={ajxx}
                    ysay={query.ysay}
          />
        </div>
        <div className={styles.tools}>
          <Tools stage={query.stage}
                 coords={coords}
                 dispatch={dispatch}
                 ajxx={ajxx}
                 docTree={viewDocTree}/>
        </div>
      </div>
    );


    const head = (yjfl) => {
      const data = this.dealProblemList(yjfl);
      const plus = yjfl === '事实' && Number(count.unreviewed) > 0 ? 1 : 0;
      const zdCount = data.filter(d => d.dqzt === '重点').length + plus;
      const ydCount = data.filter(d => d.dqzt === '疑点').length;
      const problemcount = zdCount + ydCount;
      return (
        <div style={{
          padding: '8px  30px',
          display: 'flex', flexDirection: 'column', color: '#4976F7'
        }}>
          {yjfl === '事实' ? '事实认定' : yjfl}
          <span style={{textAlign: 'center'}}>
            <a className={styles.item} style={{color: '#333333'}}>
              问题({yjfl === '事实' ? (count.unreviewed || 0) : problemcount})
            </a>
          </span>
        </div>
      )
    };

    const SubProblemProps = {
      subProblemList,
      mergekey: subMergekey,
      onSubClick: this.onSubClick
    };
    const SubFactProblemProps = {facts, onSubFactClick: this.onSubFactClick, currentFact};
    const gzDrawerProps = {
      match, dispatch, facts, ajxx, flfg, subProblemCurrent, ysay,
      reload: this.reload,
      stage: query.stage,
      getFacts: this.getFacts
    };

    const scdata = this.dealProblemList('合法性审查');
    const ssdata = this.dealProblemList('事实');
    const doubtFactProps = {
      factMaterials,
      currentFact,
      dispatch,
      match,
      ajxx,
      znfz,
      facts,
      stage: query.stage,
      ysay,
      getFacts: this.getFacts,
      reload: this.reload
    };
    const simpleProps = {
      currentFact, factMaterials, enumerate, isSimple, dispatch, match, ajxx, znfz, ysay, scdj, flag,
      getFacts: this.getFacts, bmsah: id, facts, stage: query.stage, reload: this.reload
    };

    return (
      <PageHeaderLayout content={flowStep} wrapperClassName={styles.default}>
        <Spin spinning={query.stage === 'ZJ' ? zjmainLoading : query.stage === 'GS' ? gsmainLoading : ''}
              size='large'
              className={styles.spin}/>
        <Card className={styles.content}>
          <div className={styles.main}>
            {
              this.props.znfz.tbflg.tbflag !== 'T' ?
                <Tabs defaultActiveKey={query && query.type ? '事实' : '合法性审查'}
                      style={{width: '100%'}}
                      onChange={this.onTabChange}>
                  <Panel tab={head('合法性审查')}
                         key='合法性审查'
                         style={{marginBottom: 20}}>
                    {
                      showRight ? '' :
                        <div className={styles.left}>
                          <ProblemList dispatch={dispatch}
                                       bmsah={id}
                                       data={scdata}
                                       active={this.state.activeKey}
                                       getSubProblem={this.getSubProblem}
                                       onListClick={this.onListClick}
                          />
                        </div>
                    }
                    {
                      showRight ? '' :
                        <div className={styles.middle}>
                          <SubProblem {...SubProblemProps}/>
                        </div>
                    }
                    <div className={styles.right}>
                      <GZMain {...gzDrawerProps} />
                    </div>
                  </Panel>
                  <Panel tab={head('事实')} key='事实'>
                    {
                      ysay === '危险驾驶罪' || showRight ? '' :
                        <div className={styles.left}>
                          <div style={{
                            paddingLeft: 20,
                            fontWeight: 'bold',
                            marginBottom: 10,
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                             <span style={{color: '#4976F7'}}>
                              事实笔数：{count.total || 0}
                              </span>
                            <span style={{color: '#4976F7'}}>
                              已审查：{count.reviewed || 0}
                              </span>
                            <span style={{color: 'red'}}>
                              未审查：{count.unreviewed || 0}
                              </span>
                          </div>
                          <SubFactProblem {...SubFactProblemProps}/>
                        </div>
                    }
                    {
                      // ysay === '危险驾驶罪' || showJbsssc ?
                        <Fragment>
                          {
                            showRight ? '' :
                              <div className={styles.factMiddle}>
                                <DoubtFact {...doubtFactProps}/>
                              </div>
                          }
                          <div className={styles.right}>
                            {/*{*/}
                            {/*  ysay === '盗窃罪' && <div>*/}
                            {/*    <Switch checkedChildren="简版"*/}
                            {/*            unCheckedChildren="普通版"*/}
                            {/*            defaultChecked*/}
                            {/*            className={styles.isSimple}*/}
                            {/*            onChange={this.isSimple}*/}
                            {/*    />*/}
                            {/*  </div>*/}
                            {/*}*/}
                            <Simple {...simpleProps} />
                          </div>
                        </Fragment>
                        // :
                        // <Fragment>
                        //   {
                        //     showRight ? '' :
                        //       <div className={styles.middle}>
                        //         <SubProblem {...SubProblemProps}/>
                        //       </div>
                        //   }
                        //   <div className={styles.right}>
                        //     <GZMain {...gzDrawerProps} tab='事实'/>
                        //   </div>
                        // </Fragment>
                    }
                  </Panel>
                </Tabs> :
                <Tabs defaultActiveKey={'事实'}
                      style={{width: '100%'}}
                      onChange={this.onTabChange}>
                  <Panel tab={head('事实')} key='事实'>
                    {
                      ysay === '危险驾驶罪' || showRight ? '' :
                        <div className={styles.left}>
                          <div style={{
                            paddingLeft: 20,
                            fontWeight: 'bold',
                            marginBottom: 10,
                            display: 'flex',
                            flexDirection: 'column'
                          }}>
                             <span style={{color: '#4976F7'}}>
                              事实笔数：{count.total || 0}
                              </span>
                            <span style={{color: '#4976F7'}}>
                              已审查：{count.reviewed || 0}
                              </span>
                            <span style={{color: 'red'}}>
                              未审查：{count.unreviewed || 0}
                              </span>
                          </div>
                          <SubFactProblem {...SubFactProblemProps}/>
                        </div>
                    }
                    {
                      // ysay === '危险驾驶罪' || showJbsssc ?
                        <Fragment>
                          {
                            showRight ? '' :
                              <div className={styles.factMiddle}>
                                <DoubtFact {...doubtFactProps}/>
                              </div>
                          }
                          <div className={styles.right}>
                            {
                              ysay === '盗窃罪' && <div>
                                <Switch checkedChildren="简版"
                                        unCheckedChildren="普通版"
                                        defaultChecked
                                        className={styles.isSimple}
                                        onChange={this.isSimple}
                                />
                              </div>
                            }
                            <Simple {...simpleProps} />
                          </div>
                        </Fragment>
                        // :
                        // <Fragment>
                        //   {
                        //     showRight ? '' :
                        //       <div className={styles.middle}>
                        //         <SubProblem {...SubProblemProps}/>
                        //       </div>
                        //   }
                        //   <div className={styles.right}>
                        //     <GZMain {...gzDrawerProps} tab='事实'/>
                        //   </div>
                        // </Fragment>
                    }
                  </Panel>
                </Tabs>
            }
            <Checkbox onChange={this.showAllProblemList}
                      className={styles.showall}>
              显示全部审查项
            </Checkbox>
            <Checkbox onChange={this.showRight}
                      className={styles.showRight}>
              右侧展开
            </Checkbox>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}

@connect(({znfz, xgsjd, xzcjd, loading}) => ({
  znfz,
  xgsjd,
  xzcjd,
  zjmainLoading: loading.effects['znfz/getZJProblemList'],
  gsmainLoading: loading.effects['znfz/getGSProblemList'],
}))

export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Index {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}
