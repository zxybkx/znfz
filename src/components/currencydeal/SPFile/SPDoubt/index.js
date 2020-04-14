import React from 'react';
import {Collapse, Icon, Checkbox, Button, message} from 'antd';
import classnames from 'classnames';
import styles from './index.less';
import _ from 'lodash';
import DealForm from 'components/xDeal/DealForm';

const Panel = Collapse.Panel;

class DocumentTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allProblemList: [],
      yjfl: [],
      currentKeyid: '',
      tabList: [],
      currentMergekey: '',
      showAll: []
    };
  }

  componentDidMount() {
    this.getProblems()
  }

  getProblems = () => {
    const {dispatch, bmsah} = this.props;
    dispatch({
      type: 'spjd/getProblemList',
      payload: {
        bmsah: bmsah,
      },
    }).then((data) => {
      // console.log(data);
      data.sort((item1, item2) => this.compareDqzt(item1.dqzt) - this.compareDqzt(item2.dqzt));
      data.sort((item1, item2) => this.compareYjfl(item1.yjfl) - this.compareYjfl(item2.yjfl));
      const list = _.filter(data, (d) => d.yjfl !== '判决结论');
      const yjfl = _.uniq(_.map(list, (o) => o.yjfl));
      this.setState({
        allProblemList: list,
        yjfl: yjfl
      });
    });
  };

  compareDqzt = (dqzt) => {
    const sourceArr = ["疑点", "重点"];
    if (sourceArr.indexOf(dqzt) > -1) {
      return sourceArr.indexOf(dqzt)
    } else {
      return 2
    }
  };

  compareYjfl = (yjfl) => {
    // const sourceArr = ["罪名", "量刑监督", "事实认定监督", "审判程序监督", "法律条文"];
    const sourceArr = ["罪名", "量刑", "事实认定", "情节认定", "审判程序", "法律条文", "法律适用"];
    return sourceArr.indexOf(yjfl)
  };


  getGlList = (keyid) => {
    const {dispatch, bmsah} = this.props;
    const {currentMergekey} = this.state;
    dispatch({
      type: 'spjd/getGLByKey',
      payload: {
        bmsah: bmsah,
        keyid: keyid,
        mergekey: currentMergekey,
        stage: 'SP'
      },
    }).then(({data, success}) => {
      if (data && success) {
        this.props.dealPos && this.props.dealPos(data);
      }
    })
  };

  onSubClick = (keyid, type = '起诉书') => {
    const {dispatch, bmsah, changeLeftImage} = this.props;
    if (keyid === this.state.currentKeyid) {
      this.setState({currentKeyid: ''})
    } else {
      type !== "刑事判决书" && changeLeftImage(type);
      dispatch({
        type: 'spjd/getSubProblemByKey',
        payload: {
          bmsah: bmsah,
          keyid: keyid,
        },
      }).then(data => {
        if (data) {
          const tabList = _.map(data, (o) => o.mergekey);
          this.setState({
            currentKeyid: keyid,
            subProblemList: data,
            tabList: tabList,
          }, () => {
            if (tabList.length > 0) {
              this.onTabClick(tabList[0]);
            }
          });
        }
      });
    }
  };

  onTabClick = (mergekey) => {
    const {subProblemList, currentKeyid} = this.state;
    const subProblemCurrent = _.filter(subProblemList, (o) => o.mergekey === mergekey);
    this.setState({
      currentMergekey: mergekey,
      subProblemCurrent: subProblemCurrent[0]
    }, () => {
      this.getGlList(currentKeyid);
    });
  };

  reload = () => {
    if (this.state.currentKeyid === '罪名_罪名_罪名认定是否一致' || this.state.currentKeyid === '量刑_量刑_量刑建议是否被采纳') {
      this.reCalculate()
    }

    const {dispatch, bmsah} = this.props;
    !_.isEmpty(this.state.keyid) && this.onSubClick(this.state.keyid);
    dispatch({
      type: 'spjd/getProblemList',
      payload: {
        bmsah: bmsah,
      },
    }).then((data) => {
      const list = _.filter(data, (d) => d.yjfl !== '判决结论');
      this.setState({
        allProblemList: list,
      }, () => {
        this.onSubClick(this.state.currentKeyid)
      });
    });
  };

  onChange = (e, keyid) => {
    const {showAll} = this.state;
    const _showAll = _.cloneDeep(showAll);
    if (e.target.checked) {
      _showAll.push(keyid);
    } else {
      _.remove(_showAll, (o) => o === keyid)
    }
    this.setState({
      showAll: _showAll,
    });
  };

  reCalculate = () => {
    const {dispatch, bmsah} = this.props;
    dispatch({
      type: 'znfz/reCalculate',
      payload: {
        bmsah: bmsah,
      },
    }).then(({message, result}) => {
      message.success('规则正在重新计算，请10秒后刷新');
    });
  };

  render() {
    const {yjfl, allProblemList, currentKeyid, tabList, subProblemCurrent, showAll, currentMergekey} = this.state;
    const {dispatch, stage, ajxx} = this.props;

    return (
      <div className={styles.default}>
        <Button
          type={'primary'}
          onClick={() => this.reload()}
          size={'small'}
          style={{margin: 10}}
        >刷新</Button>
        <Collapse defaultActiveKey={['0', '1', '2', '3', '4']}>
          {
            yjfl && yjfl.map((o, i) => {

              const allList = _.filter(allProblemList, (obj) => obj.yjfl === o);
              const yidian = _.filter(allList, (obj) => obj.dqzt === '疑点');
              const zhongdian = _.filter(allList, (obj) => obj.dqzt === '重点');
              // const partList = _.concat(yidian, zhongdian);

              const partList = _.filter(allList, (obj) => obj.dqzt === '疑点' || obj.dqzt === '重点');


              const idx = _.indexOf(showAll, o);
              const list = idx >= 0 ? allList : partList;


              const head =
                <div className={styles.head}>
                  {
                    (yidian && yidian.length > 0) || (zhongdian && zhongdian.length > 0) ?
                      <span className={styles.tishi}>
                        {/*<Icon type="exclamation-circle" style={{margin: '0 2px 0 30px', color: 'red'}}/>*/}
                        {/*<span style={{marginRight: 10}}>疑点：{yidian && yidian.length}</span>*/}
                        {/*<span style={{marginRight: 10}}>重点：{zhongdian && zhongdian.length}</span>*/}
                        {/*<Icon type="exclamation-circle" />*/}
                        !
                        {/*<span className={styles.tishi}>{partList && partList.length}条</span>*/}
                      </span> :
                      <span className={styles.tishi2}>
                        <Icon type="check" style={{color: 'green'}}/>
                      </span>
                  }
                  {o}
                </div>;

              return (
                <Panel header={head} key={i} className={styles.part}>
                  <Checkbox onChange={(e) => this.onChange(e, o)}
                            className={styles.check}
                  >全部</Checkbox>
                  {
                    list && list.map((obj, idx) => {
                      if (obj.yjfl === o) {
                        const icon = obj.znfz_icon;
                        return (
                          <div key={idx} className={styles.item}>
                            <div className={styles.title}>
                              <a
                                onClick={() => this.onSubClick(obj.keyid, obj.jsondata.data[0] && obj.jsondata.data[0].type)}>
                                {
                                  <Icon type={icon.icon} style={{margin: '0 10px 0 0', color: icon.color}}/>
                                }
                                {obj.gzmc}
                              </a>
                            </div>
                            {
                              currentKeyid === obj.keyid ?
                                <div className={styles.content}>
                                  <div className={styles.tabs}>
                                    {tabList && tabList.map((tab, tabId) => {
                                      return (
                                        <Button key={tabId}
                                                className={styles.tab}
                                                type={currentMergekey === tab ? 'primary' : ''}
                                                size={'small'}
                                                onClick={() => this.onTabClick(tab)}
                                        >{tab}</Button>
                                      )
                                    })}
                                  </div>
                                  <DealForm dispatch={dispatch}
                                            stage={stage}
                                            ajxx={ajxx}
                                            problem={subProblemCurrent}
                                            reload={this.reload}
                                  />

                                </div> : null
                            }
                          </div>
                        )
                      }
                    })
                  }
                </Panel>
              )
            })
          }
        </Collapse>
      </div>
    );
  }
}

export default DocumentTree;
