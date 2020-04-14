import React, {PureComponent, Component} from 'react';
import {Collapse, Row, Col, Button, Tag, Radio, Form, Input, Select, message, Icon, Modal} from 'antd';
import classnames from 'classnames';
import styles from './index.less';
import Ellipsis from 'lib/Ellipsis';
import BooleanTag from 'lib/BooleanTag';
import Bind from 'lodash-decorators/bind';
import Debounce from 'lodash-decorators/debounce';
import _ from 'lodash';
import LabelRow from './LabelRow';
import TJTable from "./Table";
import FormBuilder from './FormBuilder';
import {aqjxConfig, lxqjConfig, ssqjName} from '../../../pages/currencydeal/data/nlp';
import AddModal from './AddModal';
import VerbalTable from './VerbalTable';
import FactDetailModal from './FactDetailModal';

const Panel = Collapse.Panel;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const {CheckableTag} = Tag;
const {TextArea} = Input;

@Form.create({
  mapPropsToFields: (props) => {
    if (props.ysay === '故意伤害罪') {
      const dealdata = props.currentFact ? props.currentFact.zhrddata || props.currentFact.aqjxdata : {};
      return _.mapValues(dealdata, (v, k) => {
        let val;
        if (k === '事实情节' || k === '伤残等级' || k === '本案犯罪嫌疑人' || k === '本笔事实其他参与人' || k === '财物') {
          val = _.get(props.currentFact.zhrddata, k) ? _.get(props.currentFact.zhrddata, k) : _.get(props.currentFact.aqjxdata, k);
          let initValue = val;
          if (Array.isArray(val)) {
            _.remove(initValue, o => o.length === 0);
          } else {
            if (typeof (val) === 'string' && val.length > 0) {
              initValue = val && val.split(',') || [];
            } else {
              initValue = [];
            }
          }
          val = initValue;
        } else {
          val = _.get(props.currentFact.zhrddata, k) ? _.get(props.currentFact.zhrddata, k) : _.get(props.currentFact.aqjxdata, k);
        }
        return Form.createFormField({k, value: val})
      });
    }
  }
})
export default class Index extends Component {
  constructor(props) {
    super(props);
    let newKeys = _.get(lxqjConfig, props.ysay, []).map((item) => _.keys(item)[0]);
    let newVal = props.currentFact && props.currentFact.aqjxdata ? newKeys.map((i) => {
      return ({
        [i]: props.currentFact.aqjxdata[i] || '否'
      });
    }) : [];

    this.state = {
      rdfs: props.currentFact && props.currentFact.rdfs || '认定',
      expend: true,
      names: '',
      factDetail: props.currentFact && props.currentFact.zhrddata && props.currentFact.zhrddata[_.get(ssqjName, props.ysay, [])] || props.currentFact && props.currentFact.aqjxdata && newVal || _.get(lxqjConfig, props.ysay, []),
      value: '事实不清、证据不足',
    }
  }

  componentDidMount() {
    const {dispatch, match} = this.props;
    const {params: {id}} = match;
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

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.currentFact, nextProps.currentFact)) {
      let newKeys = _.get(lxqjConfig, nextProps.ysay, []).map((item) => _.keys(item)[0]);
      let newVal = nextProps.currentFact && nextProps.currentFact.aqjxdata ? newKeys.map((i) => {
        return ({
          [i]: nextProps.currentFact.aqjxdata[i] || '否'
        });
      }) : [];

      this.setState({
        rdfs: nextProps.currentFact && nextProps.currentFact.rdfs || '认定',
        factDetail: nextProps.currentFact && nextProps.currentFact.zhrddata && nextProps.currentFact.zhrddata[_.get(ssqjName, nextProps.ysay, [])] || nextProps.currentFact && nextProps.currentFact.aqjxdata && newVal || _.get(lxqjConfig, nextProps.ysay, [])
      })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true
  }

  onRdfsChange = (e) => {
    this.setState({
      rdfs: e.target.value
    })
  };

  handleYczjData = (data) => {
    data && data.sort((item1, item2) => this.compare(item1.type) - this.compare(item2.type));
    const list = [];
    data && _.map(data, (value, key) => {
      const item = {};
      _.set(item, 'id', value.id);
      _.set(item, '证据名称', `${value.type}-${value.owner}`);
      _.set(item, 'yjjl', value.yjjl);
      _.set(item, 'fxjl', value.fxjl || '');
      value.yczjs && value.yczjs.map((o) => {
        o.cs && o.cs.length > 0 && _.set(item, `${o.cs}`, {
          zl: o.gszy,
          fxyj: o.otherAnalysis,
          rdss: o.rdss,
          fx: o.analysis
        });
      });
      value.type && value.type.length > 0 && list.push(item);
    });
    return list;
  };

  compare = (type) => {
    const sourceArr = ["犯罪嫌疑人供述和辩解", "被害人陈述", "证人证言"];
    return sourceArr.indexOf(type)
  };

  handleAdd = (value, label) => {
    const values = this.props.form.getFieldValue(label);
    this.props.form.setFieldsValue({
      [label]: [...values, `${value['姓名']}(${value['属性']})`],
    })
  };

  @Bind()
  @Debounce(600)
  saveFxjl = (value, record) => {
    const {dispatch, getFacts, currentFact} = this.props;
    // const fxjl = e.target.value;
    const fxjl = value === true ? '认罪' : '不认罪';
    dispatch({
      type: 'znfz/updateFactOwner',
      payload: {
        data: {
          id: record.id,
          fxjl,
        }
      }
    }).then(() => {
      getFacts && getFacts(currentFact && currentFact.id);
    })
  };

  saveNormalFxjl = (e, record) => {
    const {dispatch, getFacts, currentFact} = this.props;
    const fxjl = e.target.value;
    dispatch({
      type: 'znfz/updateYczj',
      payload: {
        data: {
          id: record.id,
          fxjl,
        }
      }
    }).then(() => {
      getFacts && getFacts(currentFact && currentFact.id);
    })
  };

  onSave = (peoples) => {
    const {dispatch, currentFact, bmsah, getFacts, stage, ysay} = this.props;
    const {rdfs, factDetail} = this.state;
    const factid = currentFact.id;

    const {validateFields} = this.props.form;
    validateFields((errors, values) => {
      if (errors) {
        const sj = _.get(values, '时间');
        const dd = _.get(values, '地点');
        const xyr = ysay === '故意伤害罪' ? _.get(values, '本案犯罪嫌疑人') : _.get(values, '嫌疑人');
        const bhr = _.get(values, '被害人');
        if (!(sj && dd && xyr && bhr)) {
          this.setState({
            expend: true
          })
        }
        return;
      }


      const jz = _.get(values, '价值');
      if (typeof (jz) === 'string') {
        if (jz.length === 0 || !jz) {
          _.set(values, '价值', '0');
        }
      }

      const xyrVal = values['嫌疑人'] && values['嫌疑人'].filter(i => i.trim().length !== 0);

      _.set(values, '嫌疑人', xyrVal);

      _.set(values, _.get(ssqjName, ysay, []), factDetail);

      if (rdfs === '认定') {
        dispatch({
          type: 'znfz/ysjlFactChanged',
          payload: {
            id: factid,
            rdfs: rdfs,
            zhrddata: values,
            dqzt: 1
          }
        }).then((res) => {
          if(res) {
            const {success, data} = res;
            if(success && data) {
              if(data.isFactChanged === 'T') {
                dispatch({
                  type: 'znfz/saveFactConclusion',
                  payload: {
                    id: factid,
                    rdfs: rdfs,
                    zhrddata: values,
                    dqzt: 1
                  }
                }).then((result) => {
                  if (result && result.success) {
                    getFacts && getFacts(currentFact && currentFact.id);
                    message.success('保存成功')
                  }
                });

                const mergekey = ysay === '故意伤害罪' ? _.get(values, '本案犯罪嫌疑人') && _.split(_.get(values, '本案犯罪嫌疑人'), ',') :
                  _.map(_.get(values, '参与人'), _.trim);

                dispatch({
                  type: 'znfz/saveFactConclusionByPeople',
                  payload: {
                    bmsah: bmsah,
                    mergekeys: mergekey
                  }
                }).catch((error) => {
                  message.warning('结论同步失败')
                })
              } else {
                message.success('保存成功')
              }
            }
          }
        });
      } else {
        dispatch({
          type: 'znfz/ysjlFactChanged',
          payload: {
            id: factid,
            rdfs: rdfs,
            zhrddata: values,
            dqzt: 1
          }
        }).then((res) => {
          if(res) {
            const {success, data} = res;
            if(success && data) {
              if(data.isFactChanged === 'T') {
                dispatch({
                  type: 'znfz/saveFactConclusion',
                  payload: {
                    id: factid,
                    rdfs: rdfs,
                    brdly: values.brdly,
                    dqzt: 1
                  }
                }).then((result) => {
                  if (result && result.success) {
                    getFacts && getFacts(currentFact && currentFact.id);
                    message.success('保存成功')
                  }
                });
              } else {
                message.success('保存成功')
              }
            }
          }
        });
      }
    })
  };

  toggleForm = () => {
    this.setState({
      expend: !this.state.expend
    })
  };

  comparisionFunction = (catalog) => {
    const sourceArr = ["诉讼程序文书", "物证", "书证", "证人证言、被害人陈述", "犯罪嫌疑人供述和辩解", "鉴定意见", "勘验、检查、辨认、侦查实验等笔录", "视听资料、电子数据", "其他"];
    return sourceArr.indexOf(catalog)
  };

  boolChange = (value, index, item, listWithoutProperty) => {
    const newTagValue = {
      ...item,
      [_.keys(item)]: value === true ? '是' : '否'
    };

    listWithoutProperty.splice(index, 1, newTagValue);

    this.setState({
      factDetail: listWithoutProperty
    })
  };

  doRenderZJMC = (text, record, index) => {
    const {currentFact} = this.props;
    let newYczj = currentFact.owners;
    const labelConverter = {
      '犯罪嫌疑人供述': '犯罪嫌疑人供述和辩解',
      '证人证言': "证人证言、被害人陈述",
      '被害人陈述': "证人证言、被害人陈述",
    };

    const rebuildLabel = (type) => {
      return labelConverter[type];
    };

    return newYczj && newYczj.length > 0 && newYczj[index] && newYczj[index].yczjs && newYczj[index].yczjs.length > 0 ? newYczj[index].yczjs.map((item, index) => {
      let orderCs = item.cs.replace(/[^0-9]/ig, "");
      return ({
        key: orderCs,
        title: `${item.type}（${item.owner}）${item.cs}`,
        type: item.type,
        filekey: item.filekey,
        catalog: rebuildLabel(item.type)
      })
    }) : [];
  }

  onClickSave = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const {dispatch, match, location, ysay} = this.props;
    const {params: {id}} = match;

    if (ysay === '交通肇事罪' || ysay === '危险驾驶罪') {
      dispatch({
        type: 'znfz/GetXyrxx',
        payload: id
      }).then((result) => {
        const {data, success} = result;
        if (data && success) {
          const peoples = data.map((item) => item && item.xm);
          this.onSave(peoples);
        }
      })
    } else {
      this.onSave();
    }
  };

  onChange = e => {
    this.setState({
      value: e.target.value,
    });
  };

  render() {
    const {
      currentFact, factMaterials, enumerate, dispatch, isSimple,
      match, ajxx, znfz, facts, stage, reload, ysay, getFacts, scdj, flag
    } = this.props;
    const {rdfs, expend, factDetail, names} = this.state;
    const {params: {id}} = match;

    let newBalZj = _.filter(factMaterials, (item) => {
      if (item.bqnr && item.bqnr.attribute) {
        if (item.bqnr && item.bqnr.category && item.bqnr.category !== '其他') {
          return true;
        }
      }
    });

    newBalZj.sort((item1, item2) => this.comparisionFunction(item1.bqnr.category) - this.comparisionFunction(item2.bqnr.category));
    // let newLb = newBalZj && newBalZj.length > 0 ? _.uniq(newBalZj.map((item) => item.bqnr.category)) : [];
    // newLb.sort((item1, item2) => this.comparisionFunction(item1) - this.comparisionFunction(item2));

    const bdlNewData = newBalZj && newBalZj.length > 0 ? newBalZj.map((item, index) => {
      return ({
        title: item.label,
        type: item.label,
        filekey: item.tplj,
        catalog: item.bqnr.category
      })
    }) : [];

    const FactBdlNewDetailProps = {
      data: {
        jsondata: {
          data: bdlNewData
        }
      },
      dispatch, match, ajxx, znfz, ysay, loading: false,
      id, facts, stage, onClose: reload, getFacts
    };


    const qtzjcl = _.filter(factMaterials, (item) => {
      if (item.bqnr && item.bqnr.attribute) {
        return _.includes(item.bqnr.attribute, currentFact.id);
      }
    });

    const specialYsay = ['盗窃罪', '故意伤害罪'];
    const aqjxList = _.indexOf(specialYsay, ysay) > -1 ? _.get(aqjxConfig, ysay, []) : _.get(aqjxConfig, 'tb', []);
    const {getFieldDecorator, setFieldsValue, getFieldValue} = this.props.form;
    const formItemLayout = {
      labelCol: {span: 5},
      wrapperCol: {span: 18},
    };

    const newData = qtzjcl && qtzjcl.length > 0 ? qtzjcl.map((item, index) => {
      return ({
        title: item.label,
        type: item.label,
        filekey: item.tplj,
      })
    }) : [];

    const FactDetailProps = {
      data: {
        jsondata: {
          data: newData
        }
      },
      dispatch, match, ajxx, znfz, ysay, loading: false,
      id, facts, stage, onClose: reload, getFacts
    };

    const qtzjclColumns = [
      {
        title: '证据名称',
        dataIndex: 'label',
        key: 'label',
        width: 300,
        render: (text, record, index) => {
          return (
            <FactDetailModal {...FactDetailProps} currentIndex={index}>
              <a>{text}</a>
            </FactDetailModal>
          )
        }
      }, {
        title: '摘录',
        dataIndex: 'zy',
        key: 'zy',
        width: 480,
        render: (text, record) => {
          return <Ellipsis tooltip
                           lines={4}>&emsp;&emsp;{record.bqnr && record.bqnr.excerpt ? record.bqnr.excerpt : ''}</Ellipsis>
        }
      }, {
        title: '分析',
        dataIndex: 'fx',
        key: 'fx',
        width: 480,
        render: (text, record) => {
          return <Ellipsis tooltip
                           lines={4}>&emsp;&emsp;{record.bqnr && record.bqnr.analysis ? record.bqnr.analysis : ''}</Ellipsis>
        }
      }
    ];

    const newColumns = [
      {
        title: '类别名称',
        width: 300,
        dataIndex: 'category',
        render: (value, row, index) => {
          const obj = {
            children: row.bqnr.category,
            props: {},
          };
          const start = _.findIndex(newBalZj, function (o) {
            return o.bqnr.category === row.bqnr.category;
          });
          const end = _.findLastIndex(newBalZj, function (o) {
            return o.bqnr.category === row.bqnr.category;
          });

          if (index === start) {
            obj.props.rowSpan = end - start + 1;
          }
          if (index > start && index <= end) {
            obj.props.rowSpan = 0;
          }
          return obj;
        }
      },
      {
        title: '证据名称',
        dataIndex: 'label',
        key: 'label',
        width: 300,
        render: (text, record, index) => {
          return (
            <FactDetailModal {...FactBdlNewDetailProps} currentIndex={_.indexOf(newBalZj, record)}>
              <a>{text}</a>
            </FactDetailModal>
          )
        }
      }, {
        title: '摘录',
        dataIndex: 'zy',
        key: 'zy',
        width: 480,
        render: (text, record) => {
          return <Ellipsis tooltip
                           lines={4}>&emsp;&emsp;{record.bqnr && record.bqnr.excerpt ? record.bqnr.excerpt : ''}</Ellipsis>
        }
      }, {
        title: '分析',
        dataIndex: 'fx',
        key: 'fx',
        width: 480,
        render: (text, record) => {
          return <Ellipsis tooltip
                           lines={4}>&emsp;&emsp;{record.bqnr && record.bqnr.analysis ? record.bqnr.analysis : ''}</Ellipsis>
        }
      }
    ]

    const AddProps = {addHandle: this.handleAdd, dispatch, enumerate};

    const zhrd = currentFact && currentFact.zhrddata || '';
    const aqjx = currentFact && currentFact.aqjxdata || '';
    const yczj = currentFact && currentFact.owners || '';
    const newFact = currentFact && currentFact.nlpdata || '';
    const yczjData = this.handleYczjData(yczj);


    const allKeys = [];
    yczjData.map((item) => {
      let keys = _.keys(item);
      keys.map((o) => {
        allKeys.push(o);
      })
    });
    const columns = [];
    _.map(_.uniq(allKeys), (v, k) => {
      if (v === 'id' || v === 'fxjl') {
        return true;
      }
      const item = {};
      if (v === 'yjjl') {
        _.set(item, 'title', '综合结论');
        _.set(item, 'width', 100);
      } else {
        _.set(item, 'title', v);
      }
      _.set(item, 'dataIndex', v);
      if (v === '证据名称') {
        _.set(item, 'width', 100);
        _.set(item, 'render', (text, record, index) => {
          let newYczjDetail = this.doRenderZJMC(text, record, index);
          const YczjDetailProps = {
            data: {
              jsondata: {
                data: _.orderBy(newYczjDetail, ['key'], ['asc'])
              }
            },
            dispatch, match, ajxx, znfz, ysay, loading: false,
            id, facts, stage, onClose: reload, getFacts
          };

          const context = process.env.NODE_ENV === 'production' ? '/cm' : '';
          const param = record && _.split(_.get(record, '证据名称'), '-');
          const params = {
            type: _.get(param, '0'),
            owner: _.get(param, '1'),
            cs: '第1次',
            modal: 1
          };
          return (
            <FactDetailModal {...YczjDetailProps} currentIndex={0}>
              <a>{text}</a>
            </FactDetailModal>
          )
        })
      }
      if (v !== '证据名称' && v !== 'yjjl') {
        _.set(item, 'render', (text, record, index) => {
          return record && record['证据名称'] && record['证据名称'].split('-')[0] === '犯罪嫌疑人供述' ?
            text && <div>
              <div style={{height: '80px', padding: '8px', textAlign: 'left'}}>
                <Ellipsis tooltip
                          lines={3}><span style={{fontWeight: 'bold'}}>摘录：</span>&emsp;{text && text.zl || ''}
                </Ellipsis>
              </div>
              <div
                style={{padding: '8px', height: '80px'}}>
                <Ellipsis tooltip
                          lines={3}><span style={{fontWeight: 'bold'}}>事实：</span>&emsp;{text && text.rdss || ''}
                </Ellipsis>
              </div>
              <div style={{padding: '8px', textAlign: 'left'}}>
                <span style={{fontWeight: 'bold'}}>分析意见：</span>&emsp;
                <span>{text && text.fxyj ? text.fxyj.fg !== '否' ? '' : text.fxyj.brz === '否' ? '认罪' : '不认罪' : ''}</span>
                &nbsp;&nbsp;
                <span>{text && text.fxyj ? text.fxyj.brz === '否' ? '' : text.fxyj.fg === '否' ? '不翻供' : '翻供' : ''}</span>
              </div>
            </div> :
            <div>
              {text ? <div style={{textAlign: 'left'}}>
                <div style={{height: '80px', padding: '8px'}}>
                  <Ellipsis tooltip
                            lines={3}>{text && text.zl ?
                    <span style={{fontWeight: 'bold'}}>摘录：&emsp;</span> : ''}{text && text.zl || ''}
                  </Ellipsis>
                </div>
                <div style={{padding: '8px', height: '80px'}}>
                  <Ellipsis tooltip
                            lines={3}>{text && text.fx ?
                    <span style={{fontWeight: 'bold'}}>分析：&emsp;</span> : ''}{text && text.fx || ''}
                  </Ellipsis>
                </div>
              </div> : ''}
            </div>
        });

        _.set(item, 'width', 160);
      }
      columns.push(item);
    });

    const sortedColumns = _.orderBy(columns, v => _.toNumber(v.dataIndex.replace(/[^0-9]/ig, '')));
    if (sortedColumns.length > 0) {
      const clmc = _.remove(sortedColumns, (n) => n.title === '证据名称');
      const zhjl = _.remove(sortedColumns, (n) => n.title === '综合结论');
      sortedColumns.unshift(clmc[0]);
      if (sortedColumns.length < 5) {
        for (let i = 0; i <= 5 - sortedColumns.length; i++) {
          const columnsItem = {};
          _.set(columnsItem, 'title', '');
          _.set(columnsItem, 'dataIndex', `${i}`);
          _.set(columnsItem, 'width', 160);
          _.set(columnsItem, 'render', (text, record, index) => {
            return <div>
              <a>{text}</a>
            </div>
          });

          sortedColumns.push(columnsItem);
        }
      }
      // sortedColumns.push(zhjl[0]);
      sortedColumns.push({
        dataIndex: 'fxjl',
        title: '供述状态',
        width: 100,
        render: (text, record, index) => {
          return record && record['证据名称'] && record['证据名称'].split('-')[0] === '犯罪嫌疑人供述' ?
            <BooleanTag onChange={(value) => this.saveFxjl(value, record)} key={Math.random()}
                        checked={text === '认罪'}>
              认罪
            </BooleanTag> : ''
        }
      });

      // sortedColumns.push({
      //   dataIndex: 'fxjl',

      //   width: 100,
      //   render: (text, record) =>
      //     <TextArea defaultValue={text}
      //               onBlur={e => this.saveFxjl(e, record)} autosize={{minRows: 3, maxRows: 20}}/>
      // });
    }

    const VerbalTableProps = {
      data: yczj, match, dispatch, ajxx, znfz, stage, currentFact, facts,
      saveFxjl: this.saveNormalFxjl, onClose: reload, getFacts
    };

    const boolLabelConverter = {
      '是否严重超载驾驶': '严重超载',
      '追逐竞速': '追逐竞驶',
      '运送危化品': '违规运输危化品及公共安全',
      '逃避、拒绝或阻碍公安机关依法检查': '逃避或拒绝阻碍检查'
    };

    const rebuildBoolLabel = (type) => {
      let label = type;
      if (boolLabelConverter[type]) {
        label = boolLabelConverter[type]
      } else {
        label = type
      }
      return label;
    };
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
      margin: '10px'
    };
    return (
      <div className={styles.default}>
        <Collapse defaultActiveKey={['4']}>
          {/*<Panel header={'证据'} key="2">*/}
          {/*  {isSimple ?*/}
          {/*    <TJTable columns={sortedColumns} list={yczjData} scroll={{x: (sortedColumns.length - 2) * 160 + 400}}/> :*/}
          {/*    <VerbalTable {...VerbalTableProps}/>*/}
          {/*  }*/}
          {/*  /!*{*!/*/}
          {/*  /!*ysay !== '交通肇事罪' && qtzjcl && qtzjcl.length > 0 ? <div style={{marginTop: 20}}>*!/*/}
          {/*  /!*<TJTable columns={qtzjclColumns} list={qtzjcl}/>*!/*/}
          {/*  /!*</div> : ''*!/*/}
          {/*  /!*}*!/*/}

            {/*<div style={{marginTop: 20}}>*/}
            {/*  {*/}
            {/*    newBalZj && newBalZj.length > 0 ?*/}
            {/*      <TJTable columns={newColumns}*/}
            {/*               list={newBalZj}*/}
            {/*               scroll={{x: (newColumns.length - 2) * 320 + 500}}*/}
            {/*      />*/}
            {/*      : ''*/}
            {/*  }*/}
            {/*</div>*/}
          {/*</Panel>*/}

          <Panel header={
            <div>
              <span>综合认定</span></div>} key="4">
            <div className={styles.formstyle}>
              <Form>
                {
                  rdfs && rdfs === '不认定' ?
                    <Row>
                      <Row className={styles.zhrd}>
                        <Col span={24}>
                          <Col span={4} className={styles.zhrdLabel}>
                            认定结果
                          </Col>
                          <Col span={16} className={styles.zhrdContent}>
                            <RadioGroup buttonStyle="solid" value={rdfs} onChange={this.onRdfsChange}>
                              <RadioButton value="认定">认定</RadioButton>
                              <RadioButton value="不认定">不认定</RadioButton>
                            </RadioGroup>
                          </Col>
                        </Col>
                      </Row>
                      <FormItem {...formItemLayout}
                                label={<span style={{color: '#444'}}>不认定理由</span>}
                      >
                        {getFieldDecorator('brdly', {
                          initialValue: this.state.value
                        })(
                          <Radio.Group onChange={this.onChange}>
                            <Radio style={radioStyle} value='事实不清、证据不足'>
                              事实不清、证据不足
                            </Radio>
                            <Radio style={radioStyle} value='无犯罪事实或不认为是犯罪'>
                              无犯罪事实或不认为是犯罪
                            </Radio>
                          </Radio.Group>
                        )}
                      </FormItem>
                    </Row> :
                    <Row gutter={16}>
                      {
                        _.map(aqjxList, (item, index) => {
                          const itemProps = {enumerate, setFieldsValue, getFieldDecorator, getFieldValue, ...item};
                          const addSelects = ['参与人', '被害人', '本笔事实其他参与人', '伤残等级'];

                          if (item.label === '案情摘要') {
                            const initialValue = _.get(zhrd, '经审查认定的事实') ? _.get(zhrd, '经审查认定的事实') : _.get(aqjx, item.label);
                            return (
                              <div key={index}>
                                <Row className={styles.zhrd} style={{marginLeft: '8px'}}>
                                  <Col span={4} className={styles.zhrdLabel}>
                                    认定结果
                                  </Col>
                                  <Col span={16} className={styles.zhrdContent}>
                                    <RadioGroup buttonStyle="solid" value={rdfs} onChange={this.onRdfsChange}>
                                      <RadioButton value="认定">认定</RadioButton>
                                      <RadioButton value="不认定">不认定</RadioButton>
                                    </RadioGroup>
                                  </Col>
                                </Row>
                                {/*{*/}
                                {/*  ysay !== '盗窃罪' ?*/}
                                {/*    <Row style={{marginTop: 20, display: expend ? 'block' : 'none'}}>*/}
                                {/*      <Row className={styles.zhrd}>*/}
                                {/*        <Col span={24}>*/}
                                {/*          <Col span={4} className={styles.zhrdLabel} style={{marginLeft: '8px'}}>*/}
                                {/*            {_.get(ssqjName, ysay, [])}:*/}
                                {/*          </Col>*/}
                                {/*          <Col span={16} style={{width: '73.7%', paddingBottom: '8px'}}>*/}
                                {/*            <div className={styles.checkTag}>*/}
                                {/*              {*/}
                                {/*                factDetail && factDetail.map((d, index) => {*/}
                                {/*                  return <CheckableTag key={index}*/}
                                {/*                                       onChange={(val) => this.boolChange(val, index, d, factDetail)}*/}
                                {/*                                       style={{marginTop: '8px'}}*/}
                                {/*                                       checked={d[_.keys(d)] === '是'}>*/}
                                {/*                    {rebuildBoolLabel(_.keys(d))}*/}
                                {/*                  </CheckableTag>*/}
                                {/*                })*/}
                                {/*              }*/}
                                {/*            </div>*/}
                                {/*          </Col>*/}
                                {/*        </Col>*/}
                                {/*      </Row>*/}
                                {/*    </Row> : ''*/}
                                {/*}*/}
                                <Col span={24} key={index} style={{zIndex: 20}}>
                                  <FormBuilder {...itemProps}
                                               expend={expend}
                                               toggleForm={this.toggleForm}
                                               initialValue={initialValue}
                                               label={'经审查认定的事实'}
                                               itemLayout={formItemLayout}
                                               getFieldDecorator={getFieldDecorator}
                                  />
                                </Col>
                              </div>
                            )
                          } else if (_.indexOf(addSelects, item.label) > -1) {
                            const initialValue = _.get(zhrd, item.label) ? _.get(zhrd, item.label) : _.get(aqjx, item.label);
                            let initValue = initialValue;
                            if (Array.isArray(initialValue)) {
                              _.remove(initValue, o => o.length === 0);
                            } else {
                              if (typeof (initialValue) === 'string' && initialValue.length > 0) {
                                initValue = [initialValue];
                              } else {
                                initValue = [];
                              }
                            }

                            return (
                              <Col span={24} key={index} style={{display: expend ? 'block' : 'none'}}>
                                <FormItem {...formItemLayout}
                                          style={{margin: '5px 0', zIndex: 20}}
                                          label={<span
                                            style={{color: 'black'}}>{item.label === '伤残等级' ? `${item.label}` : `${item.label}姓名`}</span>}
                                >
                                  {getFieldDecorator(item.label, {
                                    initialValue: item.label === '伤残等级' && flag === true ? scdj : initValue || [],
                                    rules: [{
                                      required: item.label !== '伤残等级' ? item.required : '',
                                      message: item.label === '伤残等级' ? `请输入${item.label}` : `请输入${item.label}姓名`
                                    }],
                                  })(
                                    <Select mode="multiple" style={{width: '85%', marginRight: 10}}>
                                      {
                                        getFieldValue(item.label) && getFieldValue(item.label).length > 0 ? getFieldValue(item.label).map((item, index) => {
                                          return <Select.Option key={index} value={item}>{item}</Select.Option>
                                        }) : []
                                      }
                                    </Select>
                                  )}
                                  <AddModal {...AddProps} label={item.label} initialValue={initialValue}>
                                    <a>新增</a>
                                  </AddModal>
                                </FormItem>
                              </Col>
                            )
                          } else if (item.label === '盗窃类型') {
                            const initialValue = _.get(zhrd, item.label) ? _.get(zhrd, item.label) : _.get(aqjx, item.label);
                            let facts = newFact && newFact[item.label] ? newFact[item.label] : item;
                            const cs = facts.type && facts.type.split('|')[1];

                            let initialValues = enumerate[cs] && enumerate[cs].length > 0 ? enumerate[cs].map(item => item.probable_value) : [];
                            const i = initialValues.map((i, index) => i && i.indexOf(initialValue) !== -1);
                            const init = i.indexOf(true) === -1 ? initialValue : enumerate[cs][i.indexOf(true)];

                            let initValue = init && init.value || init;

                            return (
                              <Row key={item.label}>
                                <Col span={24} key={item.label} style={{padding: '0 8px'}}>
                                  <FormBuilder {...itemProps}
                                               expend={expend}
                                               toggleForm={this.toggleForm}
                                               initialValue={initValue}
                                               getFieldDecorator={getFieldDecorator}
                                  />
                                </Col>
                              </Row>
                            )
                          } else {
                            const initialValue = _.get(zhrd, item.label) ? _.get(zhrd, item.label) : _.get(aqjx, item.label);
                            return (
                              <Row key={item.label}>
                                <Col span={24} key={item.label} style={{padding: '0 8px'}}>
                                  <FormBuilder {...itemProps}
                                               expend={expend}
                                               toggleForm={this.toggleForm}
                                               setFieldsValue={setFieldsValue}
                                               initialValue={initialValue}
                                               names={names}
                                               getFieldDecorator={getFieldDecorator}
                                  />
                                </Col>
                              </Row>
                            )
                          }
                        })
                      }
                    </Row>
                }
                <Button icon={'save'}
                        style={{float: 'right', marginTop: '6px', marginRight: '5%'}}
                        type={'primary'}
                        size="small"
                        onClick={(e) => this.onClickSave(e)}>
                  保存
                </Button>
              </Form>
            </div>
          </Panel>
        </Collapse>
      </div>

    );
  }
}
