import React, {PureComponent} from 'react';
import {message, Button, Icon, Spin, Modal} from 'antd';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import _ from 'lodash';
import classnames from 'classnames';
import FactItem from './FactItem';
import styles from './index.less';


const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const getItemStyle = isDragging => classnames(styles.item, isDragging ? styles.dragging : '');

const getListStyle = isDraggingOver => classnames(styles.list, isDraggingOver ? styles.over : '');

const rebuildNlpData = (data = []) => {
  return data;
};

export default class FactInfo extends React.Component {

  static getDerivedStateFromProps(nextProps, prevState) {
    // if (_.isEqual(prevState.lastData, nextProps.data) && _.isEqual(prevState.lastItems, nextProps.items)) {
    //   return null;
    // }
    return {
      data: nextProps.data,
      items: rebuildNlpData(nextProps.data),
      lastData: nextProps.data,
      lastItems: nextProps.items
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      current: {},
      saving: false,
      nlpParsing: false,
      data: props.data,
      items: rebuildNlpData(props.data),
      enumerate: {},
      zjbmsah: '',
      names: ''
    };
  }

  componentDidMount() {
    const {dispatch, stage, match} = this.props;
    const {params: {id}} = match;
    if (stage === 'GS') {
      this.getZjBmsah();
    }
    dispatch({
      type: 'znfz/get_enumerate',
    }).then(({data, success}) => {
      if (data && success) {
        this.setState({
          enumerate: data
        })
      }
    });
    dispatch({
      type: 'znfz/get_xyrName',
      payload: {
        bmsah: id
      }
    }).then((result) => {
      const {data, success} = result;
      if (data && success) {
        this.setState({
          names: data
        })
      }
    }).catch((error) => {
      message.warning('嫌疑人名称获取失败')
    })
  }

  getZjBmsah = () => {
    const {dispatch, match} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: 'xgsjd/getZJbmsah',
      payload: {bmsah: id}
    }).then((result) => {
      if (result && result.data && result.data.bmsah) {
        this.setState({
          zjbmsah: result.data.bmsah
        })
      }
    })
  };

  onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const items = reorder(
      this.state.items,
      result.source.index,
      result.destination.index
    );

    this.orderMap = {};
    const _items = _.map(items, (d, idx) => {
      _.set(d, 'orderBy', idx + 1);
      _.set(this.orderMap, _.get(d, 'listname.path'), idx + 1);
      return d;
    });
    this.setState({
      items: _items,
    }, () => {
      this.doSave(false, _items);
    });
  };

  fillNlpData = () => {
    const {dispatch, match: {params: {id}}} = this.props;
    dispatch({
      type: 'znfz/fillNLPData',
      payload: {
        bmsah: id,
      },
    })
  };

  reCalculate = () => {
    const {dispatch, match: {params: {id}}} = this.props;
    dispatch({
      type: 'znfz/reCalculate',
      payload: {
        bmsah: id,
      },
    });
  };

  /**
   * 实时解析Ocr
   * @param path 当前需要解析的输入框path
   * @param key 当前需要解析的输入框名称
   * @param value 当前需要解析的输入框的值
   * @param params 解析接口调用参数
   * @param currentItem 当前实体
   */
  getNLP = (path, key, value, params, currentItem) => {
    this.setState({
      nlpParsing: true,
      current: currentItem
    }, () => {
      this.doParse(path, key, value, params);
    });
  };

  doParse = (path, key, value, params) => {
    const {dispatch, match: {params: {id}}} = this.props;
    dispatch({
      type: 'global/parseTextFromNlp',
      payload: {
        bmsah: id,
        ...params,
      },
    }).then(({success, data}) => {
      if (success && !_.isEmpty(data)) {
        const {data: nlpData} = this.state;
        let _nlpData = _.cloneDeep(nlpData);
        let currentItem = null;
        _.map(data, newItem => {
          if (!_.isEmpty(_nlpData)) {
            const oldItem = _.find(_nlpData, (v, k) => _.get(v, `${key}.path`) === path);
            this.copyProperties(newItem, oldItem);
            _.set(oldItem, `${key}.content`, value);

            _.set(newItem, key, _.get(oldItem, key));
            currentItem = oldItem;
          }
        });

        this.setState({current: null, nlpParsing: false, data: _nlpData, items: rebuildNlpData(_nlpData),}, () => {
          _.map(data, v => this.saveProperties(v, currentItem));
          this.fillNlpData();
        });
      }
    })
  };

  copyProperties = (source, target) => {
    const mainKey = _.get(target, 'listname.content');
    _.map(target, (v, k) => {
      if (k === 'listname') {
        return true;
      }


      if (k === mainKey) {
        if (!_.isEmpty(_.get(source, `${k}.content`))) {
          _.set(target, k, _.get(source, k))
        }
      } else {

        if (_.has(source, k) && _.get(source, `${k}.type`) !== 'unknown') {
          _.set(target, k, _.get(source, k))
        }
      }
    });
  };

  saveProperties = (source, target) => {
    const mainKey = _.get(target, 'listname.content');
    _.forEach(source, (v, k) => {
      if (k === 'listname') {
        return true;
      }

      if (k === mainKey && _.isEmpty(_.get(source, `${k}.content`))) {
        return true;
      }

      if (Array.isArray(v)) {
        _.forEach(v, v2 => {
          _.forEach(v2, (v3, k3) => {
            if (k3 === 'listname') {
              return false;
            }
            if (v3) {
              this.saveNLP(v3)
            }
          });
        });
      } else {
        if (v) {
          this.saveNLP(v)
        }
      }
    })
  };

  addNLP = (path, values) => {
    const {dispatch, match: {params: {id}}} = this.props;
    dispatch({
      type: 'znfz/addNlpItem',
      payload: {
        path,
        bmsah: id,
      },
    }).then(({success, data}) => {
      if (success) {
        this.fillNlpData();
        this.reCalculate();
        this.saveFact(false);
      }
      if (values) {
        const l = data.length - 1;
        const name = data[l]['姓名'];
        _.set(name, 'content', values['姓名']);
        this.saveNLP(name);

        const type = data[l]['属性'];
        _.set(type, 'content', values['属性']);
        this.saveNLP(type);

        this.reloadData(path, data);
      } else {
        this.reloadData(path, data);
      }
    });
  };

  deleteNLP = (path) => {
    const {dispatch, match: {params: {id}}} = this.props;
    dispatch({
      type: 'znfz/deleteNlpItem',
      payload: {
        path,
        bmsah: id,
      },
    }).then(({success, data}) => {
      this.reloadData(path, data);
      this.fillNlpData();
      this.reCalculate();
      this.saveFact(false);
    });
  };

  relateFact = (gsmergekey, zjdata, zjFact, oldgsmergekey) => {
    const {items} = this.state;
    const idx1 = _.findIndex(items, (o) => o.gsmergekey === gsmergekey);
    let _items = _.cloneDeep(items);
    let zjList = [];
    if (zjdata) {


      _.map(zjFact, (v, k) => {
        if (!items[idx1][k]) {
          // 1.侦监存在公诉无的：新增
          const value = _.cloneDeep(v);
          _.set(value, 'path', _.replace(value.path, '提请批准逮捕书', '起诉意见书'));
          _.set(_items[idx1], k, value);
          this.saveNLP(_items[idx1][k]);
        }
      });

      _.map(items[idx1], (v, k) => {

        if (k !== 'zjdata' && typeof (v) === 'object') {
          if (zjFact && zjFact[k]) {
            // 2.侦监、公诉共同存在的：修改
            if (_.isArray(v)) {
              const list = zjFact[k];
              const _list = _.cloneDeep(list);
              _.map(list, (o, i) => {
                _.map(o, (value, key) => {
                  _.set(_list[i][key], 'path', _.replace(value.path, '提请批准逮捕书', '起诉意见书'));
                  this.saveNLP(_list[i][key]);
                })
              });
              _.set(_items[idx1], k, _list)
            } else {
              _.set(_items[idx1], `${k}.content`, zjFact[k]['content']);
              this.saveNLP(_items[idx1][k]);
            }
          } else {
            // 3.关联的侦监不存在的：删除
            _.unset(_items[idx1], `${k}.content`)
          }
        }
      });

      zjList.push({mergekey: gsmergekey, zjdata: zjdata});
      if (oldgsmergekey) {
        zjList.push({mergekey: oldgsmergekey, zjdata: {}});
      }

    } else {
      // 无关联
      const _zjdata = {zjmergekey: '无关联', zjid: ''};
      zjList.push({mergekey: gsmergekey, zjdata: _zjdata});
    }
    this.props.dealFacts(zjList);
  };

  saveNLP = (item) => {
    if (item && item.path) {
      const {dispatch, match: {params: {id}}} = this.props;
      dispatch({
        type: 'znfz/saveNLPData',
        payload: {
          bmsah: id,
          ...item,
        },
      }).then(() => {
        this.reFillData({...item});
      });
    }
  };

  reloadData = (path, data) => {

    let indexs = path.match(/\d+/g);
    if (indexs.length > 1) {
      const {data: oldData} = this.state;
      let paths = path.match(/[^\d]+/g);
      const parentPath = `${paths[0]}${indexs[0]}_listname`;
      const parent = _.find(oldData, d => _.get(d, 'listname.path') === parentPath);
      const parentKey = paths[1].replace(/_/g, '');
      _.set(parent, parentKey, data);
      const newData = _.cloneDeep(oldData);
      this.setState({data: newData, items: rebuildNlpData(newData)});
    } else {
      let newData = data;
      if (!_.isEmpty(this.orderMap)) {
        newData = _.map(data, d => _.set(d, 'orderBy', _.get(this.orderMap, _.get(d, 'listname.path')), 999));
      }
      this.setState({data: newData, items: rebuildNlpData(newData)})
    }
  };

  reFillData = ({path, content}) => {
    let indexs = path.match(/\d+/g);
    if (indexs.length > 1) {
      const {data: oldData} = this.state;
      let paths = path.match(/[^\d]+/g);
      const parentPath = `${paths[0]}${indexs[0]}_listname`;
      const parent = _.find(oldData, d => _.get(d, 'listname.path') === parentPath);
      const parentKey = paths[1].replace(/_/g, '');
      const lists = _.get(parent, parentKey);
      const item = _.find(lists, d => _.find(d, v => v.path === path));
      const field = _.find(item, v => v.path === path);
      if (field) {
        _.set(field, 'content', content);
        const newData = _.cloneDeep(oldData);
        this.setState({data: newData, items: rebuildNlpData(newData)});
      }
    } else {
      const {data: oldData} = this.state;
      const item = _.find(oldData, d => _.find(d, v => v && v.path === path));
      const field = _.find(item, v => v.path === path);
      if (field) {
        _.set(field, 'content', content);
        const newData = _.cloneDeep(oldData);
        this.setState({data: newData, items: rebuildNlpData(newData)});
      }
    }
  };

  doSave = (show, dragItems) => {
    const {elseSave, fzdata} = this.props;
    if (elseSave === false) {
      message.warning('保存失败!请检查数据格式是否正确');
    } else {
      this.setState({
        saving: false
      }, () => {
        this.fillNlpData();
        this.reCalculate();
        this.saveFact(show, dragItems);
      });
    }
  };

  alterFactRdfs = (id, postData, showMessage) => {
    const {dispatch} = this.props;
    dispatch({
      type: 'znfz/alterFactRdfs',
      payload: {
        id
      },
    }).then((res) => {
      if (res) {
        const {success} = res;
        if (success) {
          this.saveFacts(postData, showMessage)
        }
      }
    })
  };

  saveFacts = (payload, showMessage) => {

    const { dispatch, stage, currentNlpData, match: { params: { id } } } = this.props;
    const requiredData = _.find(currentNlpData, item => item.required && item.content === '');

    if(showMessage && requiredData) {
      message.warning('有必填项未填');
    } else {
      dispatch({
        type: 'znfz/saveFacts',
        payload: {
          data: payload,
        },
      }).then(({success, data}) => {
        if (success && data) {
          showMessage && message.success('保存成功！');
          // this.setState({saving: false});
          this.refresh = setTimeout(() => this.props.reload && this.props.reload(), 1000);
          if (stage && stage === 'GS') {
            dispatch({
              type: 'znfz/setbshy',
              payload: {
                bmsah: id,
              },
            })
          }
        }
      }).catch((error) => {
        this.refresh = setTimeout(() => this.props.reload && this.props.reload(), 1000);
        this.setState({saving: false});
        message.warning('保存失败!')
      });
    }
  };

  doSaveFact = (postData, showMessage) => {
    const {dispatch, fzdata, match: {params: {id}}, stage,} = this.props;
    //验证提示
    dispatch({
      type: 'znfz/ysjlFactsChanged',
      payload: postData,
    }).then((res) => {
      if (res) {
        const {success, data} = res;
        if (success && data) {
          if (data.isFactChanged === 'T') {
            this.alterFactRdfs(data.id, postData, showMessage);
          } else {
            this.saveFacts(postData, showMessage)
          }
        }
      }
    });
  };

  saveFact = (showMessage = true, dragItems) => {
    let {items: facts, zjbmsah} = this.state;
    facts = dragItems ? dragItems : facts;
    const {dispatch, match: {params: {id}}} = this.props;
    const notAqjx = [
      '案件名称',
      'listname',
    ];
    const postData = [];
    if (facts && !_.isEmpty(facts)) {
      let hasError = false;
      _.map(facts, (fact, index) => {
        const mergeKey = `第${index + 1}笔`;
        const post = {};
        const aqjxdata = {};
        fact && _.map(_.omit(fact, notAqjx), (v, k) => {
          if (Array.isArray(v)) {
            //todo 暂时只定位到第一层
            let contents = _.map(v, item => _.get(item, `${_.get(item, 'listname.content')}.content`) + "(" + _.get(item, "属性.content") + ")");
            _.set(aqjxdata, k, contents);
          } else {
            _.set(aqjxdata, k, _.get(v, 'content'));
          }
        });
        _.set(post, 'nlppath', _.get(fact, 'listname.path'));
        _.set(post, 'orderBy', index + 1);
        _.set(post, 'nlpdata', fact);
        _.set(post, 'bmsah', id);
        _.set(post, 'aqjxdata', aqjxdata);
        _.set(post, 'mergekey', mergeKey);
        _.set(post, 'rdss', _.get(fact, '案情摘要.content'));
        _.set(post, 'type', 0);
        _.set(post, 'zjdata', fact.zjdata);
        postData.push(post);
      });

      if (!hasError) {
        let relateZJData = postData.map((item) => item.zjdata && item.zjdata.zjmergekey);
        if (showMessage) {
          if (_.compact(relateZJData).length === postData.length || !zjbmsah) {
            this.doSaveFact(postData, showMessage);
          } else {
            const relateTips = _.compact(relateZJData.map((item, index) => !item && `第${index + 1}笔`));
            // this.setState({saving: false});
            // Modal.warning({title: `${relateTips}未关联！请先对事实做关联项处理后再保存！`});
            this.doSaveFact(postData, showMessage);
          }
        } else {
          this.doSaveFact(postData, showMessage);
        }
      }
    }
  };

  ifSave = (data, fzdata) => {
    this.props.ifSave && this.props.ifSave(data, fzdata)
  };

  render() {
    let {items = [], current, enumerate, zjbmsah, saving, names} = this.state;
    const {dispatch, stage, match, ysay, bmsah} = this.props;

    const nameArr = names.split('、');
    items = _.orderBy(items, 'orderBy');
    this.orderMap = {};

    let zjmergekeyList = {};
    _.map(items, o => {
      o.zjdata && o.zjdata.zjmergekey && _.set(zjmergekeyList, o.zjdata.zjmergekey, o.gsmergekey)
    });

    return (
      <div className={styles.default}>
        {/* <Spin spinning={saving} size='large' className={styles.spin}/> */}
        <div className={styles.title}><Icon type='edit'/> 侦查机关认定的事实</div>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                className={getListStyle(snapshot.isDraggingOver)}
              >
                {
                  items.map((item, index) => {
                    const id = _.get(item, 'listname.path');
                    _.set(this.orderMap, id, _.get(item, 'orderBy'));
                    return (
                      <Draggable key={id} draggableId={id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={getItemStyle(snapshot.isDragging)}
                            style={{...provided.draggableProps.style}}
                          >
                            {
                              _.get(current, 'listname.path') === id && this.state.nlpParsing &&
                              <div className={styles.loading}><Icon type={'loading'}/> 正在进行案情解析...</div>
                            }
                            <FactItem data={item}
                                      index={index}
                                      dispatch={dispatch}
                                      provided={provided}
                                      getNLP={this.getNLP}
                                      deleteNLP={this.deleteNLP}
                                      ifSave={this.ifSave}
                                      saveNLP={this.saveNLP}
                                      addNLP={this.addNLP}
                                      enumerate={enumerate}
                                      names={nameArr}
                                      stage={stage}
                                      match={match}
                                      reload={this.props.reload}
                                      doLoading={this.props.doLoading}
                                      doSave={this.doSave}
                                      zjbmsah={zjbmsah}
                                      zjmergekeyList={zjmergekeyList}
                                      relateFact={this.relateFact}
                                      ysay={ysay}
                            />
                          </div>
                        )}
                      </Draggable>
                    )
                  })}
                {provided.placeholder}
                <div className={styles.operation}>
                  <Button style={{marginRight: '5px'}} icon='plus'
                          onClick={() => this.addNLP(_.get(items, '0.listname.path'))}>新增</Button>
                  <Button disabled={this.state.nlpParsing}
                    // loading={this.state.saving}
                          type='primary'
                          icon='save'
                          onClick={() => this.doSave()}>保存</Button>
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    );
  }
}
