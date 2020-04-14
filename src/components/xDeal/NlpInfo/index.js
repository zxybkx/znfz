import React, {PureComponent} from 'react';
import {Form, Button, Alert, message} from 'antd';
import _ from 'lodash';
import NlpItem from './NlpItem';
import styles from './index.less';

@Form.create()
export default class Index extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      dropData: [],
      enumerate: {},
      names: '',
      aa: '',
      xyrJbxx: {}
    }
  }

  componentDidMount() {
    const {ajxx} = this.props;
    const {dispatch, match} = this.props;
    const {params: {id}} = match;

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
    }).then((result) => {
      const {data, success} = result;
      if (data && success) {
        this.setState({
          names: data
        })
      }
    }).catch((error) => {
      message.warning('嫌疑人名称获取失败')
    });

    dispatch({
      type: 'znfz/getTyywGgXyrjbxx',
      payload: {bmsah: id}
    }).then((result) => {
      if(result) {
        const {success, data} = result;
        if(success && data) {
          this.setState({
            xyrJbxx: data
          })
        }
      }
    })
  }

  componentWillReceiveProps = (nextProps) => {
    this.setState({
      data: nextProps.data,
    });
  };

  reload = () => {
    this.props.reload && this.props.reload();
  };

  addNLP = (path) => {
    const {dispatch, match: {params: {id}}} = this.props;
    dispatch({
      type: 'znfz/addNlpItem',
      payload: {
        path,
        bmsah: id,
      },
    }).then(({success, data}) => {
      this.reload();
    });
  };

  deleteNLP = (path) => {
    const {dispatch, match: {params: {id}}} = this.props;
    if (path) {
      dispatch({
        type: 'znfz/deleteNlpItem',
        payload: {
          path,
          bmsah: id,
        },
      }).then(({success, data}) => {
        this.reload();
      });
    }
  };

  saveNLP = (item) => {
    const {dispatch, match: {params: {id}}} = this.props;
    dispatch({
      type: 'znfz/saveNLPData',
      payload: {
        bmsah: id,
        ...item,
      },
    }).then(({success, data}) => {
      this.reload();
    });
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


  batchSave = (showMessage, isBtn) => {
    const {dispatch, match: {params: {id}}, elseSave, currentNlpData} = this.props;
    const requiredData = _.find(currentNlpData, item => item.required && item.content === '');

    if(requiredData) {
      message.warning('有必填项未填');
    } else {
      dispatch({
        type: 'znfz/fillNLPData',
        payload: {
          bmsah: id,
        },
      }).then(() => {
        if (elseSave === false) {
          message.warning('保存失败!请检查数据格式是否正确');
        } else {
          isBtn && message.success('保存成功');
          this.props.reload && this.props.reload();
          this.props.save && this.props.save(showMessage);
          this.reCalculate();
        }
      })
    }
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

        if (_.get(source, k) && _.has(source, k) && _.get(source, `${k}.type`) !== 'unknown') {
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

  getNLP = (path, key, value, data) => {
    const {dispatch, ajxx} = this.props;
    dispatch({
      type: 'global/parseTextFromNlp',
      payload: {
        bmsah: ajxx.bmsah,
        ...data,
      },
    }).then(({success, data}) => {
      if (success && !_.isEmpty(data)) {
        const {data: nlpData} = this.state;
        let _nlpData = _.cloneDeep(nlpData);
        let currentItem = null;

        _.map(data, (v, k) => {
          const item = _.find(_nlpData, (v1, k1) => k1 === k);
          if (!_.isEmpty(item)) {
            let indexs = path.match(/\d+/g);
            if (!_.isEmpty(indexs)) {
              const index = indexs.pop();
              if (index <= item.length - 1) {
                const oldItem = item[index];
                this.copyProperties(v, oldItem);
                _.set(oldItem, `${key}.content`, value);

                _.set(v, key, _.get(oldItem, key));

                currentItem = oldItem;
              }
            }
          }
        });
        this.setState({data: _nlpData}, () => {
          _.map(data, v => this.saveProperties(v, currentItem));
        });
      }
    })
  };

  importSave = (key, index, item) => {
    const {data: nlpData} = this.state;
    const current = _.get(nlpData, key)[index];
    let _nlpData = _.cloneDeep(nlpData);
    _.get(_nlpData, key)[index] = item;
    this.setState({data: _nlpData}, () => {
      _.forEach(item, (v, k) => {
        if (k !== '参与人') {
          if (k !== 'listname') {
            this.saveNLP && this.saveNLP(v);
          }
        } else {
          const oldData = _.get(current, '参与人');
          const newData = v;
          const fillLength = newData.length - oldData.length;
          const oldLength = oldData.length;
          const newLength = newData.length;
          if (fillLength > 0) {


            for (let i = 0; i < fillLength; i++) {
              const path = _.get(newData[oldLength - 1 + i], 'listname.path');
              if (path) {
                const {dispatch, id} = this.props;
                dispatch({
                  type: 'znfz/addNlpItem',
                  payload: {
                    path,
                    bmsah: id,
                  },
                }).then(() => {
                  if (i === fillLength - 1) {
                    _.map(v, (item) => {
                      this.saveNLP && this.saveNLP(_.get(item, '姓名'));
                    });
                  }
                })
              }
            }
          } else if (fillLength < 0) {
            const spliceLength = oldData.length - newData.length;


            for (let i = 0; i < spliceLength; i++) {
              const path = _.get(oldData[newLength + i], 'listname.path');
              if (path) {
                const {dispatch, id} = this.props;
                dispatch({
                  type: 'znfz/deleteNlpItem',
                  payload: {
                    path,
                    bmsah: id,
                  },
                }).then(() => {
                  _.map(v, (item) => {
                    this.saveNLP && this.saveNLP(_.get(item, '姓名'));
                  });
                })
              }
            }
          } else {
            _.map(v, (item) => {
              this.saveNLP && this.saveNLP(_.get(item, '姓名'));
            })
          }
        }
      });
    })

  };

  getFact = (mergekey) => {
    const {dispatch, ajxx, owner} = this.props;
    dispatch({
      type: 'global/getFact',
      payload: {
        bmsah: ajxx.bmsah,
        owner: owner,
      },
    }).then(({success, data}) => {
      this.setState({
        dropData: data,
      });
    })
  };

  ifSave = (data, fzdata) => {
    this.props.ifSave && this.props.ifSave(data, fzdata)
  };

  renderItem = (key, value, index) => {
    //全局定义pr
    const {
      dictionaries, docNlp,
      importData, ajxx, facts, isSuspect, docType, owner, cs, dispatch, match: {params: {id}}
    } = this.props;

    const {enumerate, names} = this.state;
    const nameArr = names && names.split('、');

    return <NlpItem key={key}
                    title={key}
                    isSuspect={isSuspect}
                    index={index}
                    data={value}
                    ajxx={ajxx}
                    enumerate={enumerate}
                    names={nameArr}
                    docType={docType}
                    owner={owner}
                    cs={cs}
                    dispatch={dispatch}
                    id={id}
                    facts={facts}
                    docNlp={docNlp}
                    dictionaries={dictionaries}
                    batchSave={this.batchSave}
                    getNLP={this.getNLP}
                    addNLP={this.addNLP}
                    deleteNLP={this.deleteNLP}
                    saveNLP={this.saveNLP}
                    ifSave={this.ifSave}
                    reload={this.reload}
                    importData={importData}
                    getFact={this.getFact}
                    dropData={this.state.dropData}
                    importSave={this.importSave}
                    xyrJbxx={this.state.xyrJbxx}
                    getCurrentXyrNlpInfo={this.props.getCurrentXyrNlpInfo}
                    getNlpInfoKey={this.props.getNlpInfoKey}
    />
  };

  getTargetObject = (targetObject, propsArray) => {
    if (typeof (targetObject) !== "object" || !Array.isArray(propsArray)) {
      throw new Error("参数格式不正确");
    }
    const result = {};
    Object.keys(targetObject).filter(key => propsArray.includes(key)).forEach(key => {
      result[key] = targetObject[key];
    });
    return result;
  };


  render = () => {
    let {data = {}} = this.state;
    let {ifShow = true, docNlp, ysay} = this.props;
    let newData = _.clone(data);
    const {includes = [], excludes = [], editable = true, triggerStyle = {}} = this.props;

    let categorys = ['鉴定意见', '鉴定资质', '检查笔录', '搜查笔录', '委托书'];
    let currentShow = '';

    if (excludes && excludes.length > 0) {
      data = _.omit(data, excludes)
    }

    if (includes && includes.length > 0) {
      data = _.pick(data, includes)
    }

    if (ysay && ysay === '故意伤害罪') {
      if (docNlp && docNlp.title && _.indexOf(categorys, docNlp.title) > -1) {
        _.mapValues(data[docNlp.title], (value, key) => {
          if (value && value.classifier && value.classifier === 'true') {
            currentShow = value.content
          }
        });
        data = this.getTargetObject(data, [docNlp.title, currentShow]);
      }
    }

    let index = 0;
    let isBtn = true;

    const style = {
      ...triggerStyle,
    };

    return (
      <div className={styles.default}>
        {
          editable && (
            <Button className={styles.trigger} type="primary"
                    style={{...style, right: '0'}} size="small" onClick={(e) => this.batchSave(e, isBtn)}>
              保存
            </Button>
          )
        }
        <Form>
          {_.isEmpty(newData) && ifShow ?
            <Alert message="文书要素未解析"
                   description='当前文书无需进行要素解析。'
                   type="info"
                   showIcon
                   style={{margin: '20px 0 10PX 0'}}/>
            :
            data && _.map(data, (v, k) => {
              return this.renderItem(k, v, index++)
            })
          }
        </Form>
      </div>
    )
  }
}
