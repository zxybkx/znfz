import React, { Component } from 'react';
import { Button, Row, Form, Collapse, Input, Tooltip, Icon, Drawer, Checkbox, message } from 'antd';
import Bind from 'lodash-decorators/bind';
import Debounce from 'lodash-decorators/debounce';

import OcrWrapper from 'lib/OcrWrapper';
import { cursorPosition } from 'utils/utils';
import styles from './index.less';
import factStyles from './fact.less';
import FactItem from './FactItem';
import NoteItem from './NoteItem';
import _ from 'lodash';

const Panel = Collapse.Panel;
const { TextArea } = Input;
const FormItem = Form.Item;

@Form.create()
export default class MarkInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      showFactAdd: false,
      showDrawer: false,
      enumerate: {},
      importList: [],
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'znfz/get_enumerate',
    }).then(({ data, success }) => {
      if (data && success) {
        this.setState({
          enumerate: data
        })
      }
    })
  }

  @Bind()
  @Debounce(600)
  onInputClick = (e) => {
    const position = cursorPosition.get(e.target);
    window._currentCursorTarget = e.target;
    window._currentCursorPosition = position;
  };

  @Bind()
  @Debounce(600)
  onOcrClick = (path) => {
    const { getFieldValue, setFieldsValue } = this.props.form;
    window.ocrListener = (value) => {
      if (window._currentCursorTarget && window._currentCursorPosition) {
        try {
          cursorPosition.add(window._currentCursorTarget, window._currentCursorPosition, value);
        } catch (e) {
          const values = {};
          values[path] = (getFieldValue(path) || '') + value;
          setFieldsValue && setFieldsValue(values);
          const position = cursorPosition.get(window._currentCursorTarget);
          window._currentCursorPosition = position;
        }
        try {
          cursorPosition.fireKeyEvent(window._currentCursorTarget, 'keydown', 13);
        } catch (e) {
        }
        const values = {};
        values[path] = window._currentCursorTarget.value;
        setFieldsValue && setFieldsValue(values);
        const position = cursorPosition.get(window._currentCursorTarget);
        window._currentCursorPosition = position;
      } else {
        const values = {};
        values[path] = (getFieldValue(path) || '') + value;
        setFieldsValue && setFieldsValue(values);
      }
    }
  };

  onAddChange = () => {
    this.setState({
      showFactAdd: !this.state.showFactAdd
    })
  };

  creatMark = () => {
    const data = {
      title: this.props.filename,
      attribute: [],
      excerpt: '',
      analysis: '',
    };
    this.saveMark(data, '');
  };

  deleteMark = (id) => {
    const { dispatch, getMark } = this.props;
    dispatch({
      type: 'znfz/deleteMark',
      payload: {
        id: id,
      }
    }).then(({ data, success }) => {
      if (success) {
        message.success('删除成功');
        getMark && getMark(true)
      }
    })
  };

  saveMark = (_data, key, attribute) => {
    const { dispatch, match, fileKey, getMark, filename, fileCategory, imageSource, currentPage, addWsMark } = this.props;
    const { params: { id } } = match;
    dispatch({
      type: 'znfz/saveMark',
      payload: {
        bmsah: id,
        image: fileKey,
        id: key,
        data: _data
      }
    }).then(({ data, success }) => {
      if (success) {
        // message.success('保存成功');
        getMark && getMark(attribute);
        // 判断是否摘录,是则为文书添加标记
        if (!_.isEmpty(_data.attribute) || !_.isEmpty(_data.analysis) || !_.isEmpty(_data.excerpt)) {
          addWsMark && this.props.addWsMark(currentPage, filename, imageSource, fileCategory, '2')
        } else {
          addWsMark && this.props.addWsMark(currentPage, filename, imageSource, fileCategory, '1')
        }
      }
    })
  };

  onAddClick = () => {
    const { validateFields } = this.props.form;
    validateFields((err, values) => {
      if (err) return;

      this.dealFact('add', values.gszy);
      this.setState({
        showFactAdd: !this.state.showFactAdd
      });
    });


  };

  //fact表添加删除修改
  dealFact = (type, factData) => {
    const { dispatch, match, facts, getFacts } = this.props;
    const { params: { id } } = match;
    let payload = _.cloneDeep(facts);
    if (type === 'delete') {
      dispatch({
        type: 'znfz/deleteFact',
        payload: factData
      }).then(({ data, success }) => {
        if (success) {
          message.success('删除成功');
          dispatch({
            type: 'znfz/getFactList',
            payload: {
              bmsah: id,
            },
          }).then(({ success, data }) => {
            const newData = data && data.length > 0 ? data.map((item, index) => {
              return ({
                ...item,
                mergekey: `第${index + 1}笔`
              })
            }) : [];

            dispatch({
              type: 'znfz/saveFacts',
              payload: {
                data: newData
              }
            }).then(({ data, success }) => {
              if (success) {
                getFacts && getFacts();
              }
            })
          });
        }
      });

    } else if (type === 'add') {
      const newMergekey = '第' + (facts.length + 1) + '笔';
      const newdata = {
        aqjxdata: { '案情摘要': factData },
        bmsah: id,
        brdly: '',
        type: 1,
        gszl: '',
        id: '',
        mergekey: newMergekey,
        nlpdata: {},
        owners: [],
        rdfs: '',
        rdss: factData,
        orderBy: facts.length + 1
      };
      payload.push(newdata);
      dispatch({
        type: 'znfz/saveFacts',
        payload: {
          data: payload
        }
      }).then(({ data, success }) => {
        if (success && data) {
          // this.setState({facts: data.save});
          const newdata = _.find(data, (o) => o.mergekey === newMergekey);
          const yczjData = {
            aqjxdata: {},
            gszy: '',
            otherAnalysis: {
              brz: '否',
              fg: '否',
            },
            analysis: '',
            rdss: factData,
            mergekey: newdata.id
          };
          this.dealYczj('add', yczjData);
          getFacts && getFacts();
        }
      });
    }

  };

  getNLP = (content, yczj) => {
    const { dispatch, match, ysay } = this.props;
    const { params: { id } } = match;
    const template = require('../../../data/template.json');
    dispatch({
      type: 'global/parseTextFromNlp',
      payload: {
        bmsah: id,
        content: content,
        template: template[ysay]
      },
    }).then(({ success, data }) => {
      if (success && data) {
        _.set(yczj, 'aqjxdata', data['犯罪事实']);
        this.dealYczj('add', yczj);
      }
    });
  };

  onFactImport = (fact) => {
    const mergekey = fact.id;
    const { dispatch, match, filename } = this.props;
    const { params: { id } } = match;
    const arr = filename && filename.split('（');
    const arr2 = arr.length > 1 ? arr[1].split('）') : [];   //[嫌疑人，第几次]
    dispatch({
      type: 'znfz/importFact',
      payload: {
        bmsah: id,
        mergekey: String(mergekey),
        owner: arr2[0]
      }
    }).then((response) => {
      if (response) {
        const { data, success } = response;
        if (data && success) {
          this.setState({
            showDrawer: true,
            importList: data
          })
        }
      }
    });
  };

  onClose = () => {
    this.setState({
      showDrawer: false,
    });
  };

  chooseGszy = (o) => {
    const data = {
      aqjxdata: o.aqjxdata,
      gszy: '同' + o.owner + o.cs + '摘录',
      otherAnalysis: o.otherAnalysis,
      analysis: o.analysis,
      rdss: o.rdss,
      mergekey: o.mergekey
    };
    this.dealYczj('add', data);
    this.onClose();
  };


  dealYczj = (type, data) => {
    const { dispatch, match, fileKey, filename, factMarkList, getMark } = this.props;
    const { params: { id } } = match;
    let payload = _.cloneDeep(factMarkList);
    const arr = filename && filename.split('（');
    const arr2 = arr.length > 1 ? arr[1].split('）') : [];   //[嫌疑人，第几次]

    if (type === 'delete') {

      // _.remove(payload, (o) => o.mergekey === data);
      dispatch({
        type: 'znfz/deleteYczjs',
        payload: { rdss: data }
      }).then(({ data, success }) => {
        if (success) {
          // message.success('保存成功');
          getMark && getMark();
        }
      })

    } else {

      const newdata = {
        ...data,
        mergekey: String(data.mergekey),
        bmsah: id,
        filekey: fileKey,
        owner: arr2[0],
        cs: arr2[1],
        nlpData: {},
        type: ''
      };

      _.remove(payload, (o) => o.mergekey === String(data.mergekey));
      payload.push(newdata);

      dispatch({
        type: 'znfz/saveYczjs',
        payload: {
          data: payload
        }
      }).then(({ data, success }) => {
        if (success) {
          // message.success('保存成功');
          getMark && getMark();
        }
      })

    }

  };

  saveFact = (e, factId) => {
    const { dispatch, match: { params: { id } }, getFacts } = this.props;
    dispatch({
      type: 'znfz/ysjlFact',
      payload: {
        id: factId,
        bmsah: id,
        rdss: e.target.value
      }
    }).then((res) => {
      if (res) {
        const { success, data } = res;
        if (success && data) {
          getFacts && getFacts();
        }
      }
    })
  };


  render() {
    const { showDrawer, enumerate, importList } = this.state;
    const { markList, factMarkList, fileKey, facts, filename, fileCategory, ysay, currentPage, imageSource } = this.props;

    // const showFact = _.startsWith(filename, '询问笔录') || _.startsWith(filename, '讯问笔录') || _.startsWith(filename, '犯罪嫌疑人供述') || _.startsWith(filename, '证人证言') || _.startsWith(filename, '被害人陈述');
    const FactItemProps = {
      filename, fileKey, ysay, fileCategory, currentPage, imageSource,
      getNLP: this.getNLP, dealYczj: this.dealYczj, dealFact: this.dealFact, addWsMark: this.props.addWsMark
    };
    const NoteItemProps = {
      filename, facts, fileKey, fileCategory, currentPage, imageSource,
      deleteMark: this.deleteMark, saveMark: this.saveMark, addWsMark: this.props.addWsMark
    };
    const { getFieldDecorator } = this.props.form;
    const arr = filename && filename.split('（');
    const arr2 = arr && arr.length > 1 ? arr[1].split('）') : [];
    const _markList = markList && markList.length > 0 ?
      markList : [{ analysis: '', attribute: [], excerpt: '', id: '', title: '' }];

    return (
      <Form className={styles.default}>
        <div>
          <Collapse defaultActiveKey={'1'}>
            <Panel header={<div style={{ marginLeft: 10 }}>认定事实—摘录</div>} key="1">
              <div className={styles.sub}>
                {
                  facts && facts.map((obj, idx) => {
                    const item = _.find(factMarkList, (o) => parseInt(o.mergekey) === parseInt(obj.id));
                    return (
                      <div>
                        <div className={factStyles.factTop} 
                         style={{border:'1px solid grey'}}>
                          <div className={factStyles.left}>
                            <span>{obj.mergekey}</span>
                          </div>
                          <div className={factStyles.right}>
                            <div style={{ display: 'flex' }}>
                              <div className={factStyles.leftCon}><span className={factStyles.zl}>事实</span></div>
                              <div className={factStyles.rightCon}>
                                <FormItem className={factStyles.item}>
                                  <div>{obj.rdss}</div>
                                </FormItem>
                              </div>
                              <div key={fileKey + idx} 
                              style={{borderLeft:'1px solid grey',
                              display:'flex',alignItems:'center'}}>
                                  <FactItem {...FactItemProps}
                                    enumerate={enumerate}
                                    facts={facts}
                                    ifSave={this.props.ifSave}
                                    obj={obj}
                                    item={item || {}}
                                  />
                                </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    )
                  })
                }
              </div>
              {
                this.state.showFactAdd ?
                  <div>
                    <FormItem>
                      <OcrWrapper onClick={() => this.onOcrClick('gszy')}>
                        {
                          getFieldDecorator('gszy', { initialValue: '' })(
                            <TextArea style={{ color: 'black' }} rows={5} onClick={this.onInputClick} />,
                          )}
                      </OcrWrapper>
                    </FormItem>
                    <Row className={styles.add}>
                      <Button type={'primary'}
                        onClick={() => this.onAddClick()}
                        style={{ marginRight: 20 }}
                      >
                        确定
                      </Button>
                      <Button type={'primary'}
                        onClick={() => this.onAddChange()}
                        style={{ marginRight: 20 }}
                      >
                        取消
                      </Button>
                    </Row>
                  </div>
                  :
                  <Row className={styles.add}>
                    <Button type={'primary'}
                      onClick={() => this.onAddChange()}
                      style={{ marginRight: 20 }}
                    >
                      新增事实
                    </Button>
                  </Row>
              }
            </Panel>
          </Collapse>
          <Collapse defaultActiveKey={'2'}>
            <Panel header={<div style={{ marginLeft: 10 }}>摘录</div>} key="2">
              <div className={styles.sub}>
                {
                  _markList && _markList.map((obj, idx) => {
                    return (
                      <div key={fileKey + idx} className={styles.part}>
                        <div className={styles.head}>{filename + '- 摘录' + (idx + 1)}</div>
                        <NoteItem {...NoteItemProps}
                          item={obj}
                        />
                      </div>
                    )
                  })
                }
              </div>
              <Row className={styles.add}>
                <Button type={'primary'}
                  onClick={() => this.creatMark()}
                  style={{ marginRight: 20 }}
                >
                  新增笔记
                </Button>
              </Row>
            </Panel>
          </Collapse>
          {/* <Spin spinning={saving} size='large' className={styles.spin}/> */}
        </div>
        {/* <Collapse defaultActiveKey={'1'}>
              <Panel header={<div style={{marginLeft: 10}}>摘录</div>} key="1">
                <div className={styles.sub}>
                  {
                    _markList && _markList.map((obj, idx) => {
                      return (
                        <div key={fileKey + idx} className={styles.part}>
                          <div className={styles.head}>{filename + '- 摘录' + (idx + 1)}</div>
                          <NoteItem {...NoteItemProps}
                                    item={obj}
                          />
                        </div>
                      )
                    })
                  }
                </div>
                <Row className={styles.add}>
                  <Button type={'primary'}
                          onClick={() => this.creatMark()}
                          style={{marginRight: 20}}
                  >
                    新增笔记
                  </Button>
                </Row>
              </Panel>
            </Collapse> */}

        {/*{!showFact ?*/}
        {/*  <Collapse defaultActiveKey={'1'}>*/}
        {/*    <Panel header={<div style={{marginLeft: 10}}>摘录</div>} key="1">*/}
        {/*      <div className={styles.sub}>*/}
        {/*        {*/}
        {/*          _markList && _markList.map((obj, idx) => {*/}
        {/*            return (*/}
        {/*              <div key={fileKey + idx} className={styles.part}>*/}
        {/*                <div className={styles.head}>{filename + '- 摘录' + (idx + 1)}</div>*/}
        {/*                <NoteItem {...NoteItemProps}*/}
        {/*                          item={obj}*/}
        {/*                />*/}
        {/*              </div>*/}
        {/*            )*/}
        {/*          })*/}
        {/*        }*/}
        {/*      </div>*/}
        {/*      <Row className={styles.add}>*/}
        {/*        <Button type={'primary'}*/}
        {/*                onClick={() => this.creatMark()}*/}
        {/*                style={{marginRight: 20}}*/}
        {/*        >*/}
        {/*          新增笔记*/}
        {/*        </Button>*/}
        {/*      </Row>*/}
        {/*    </Panel>*/}
        {/*  </Collapse>*/}
        {/*  : null}*/}
        <Drawer
          title="摘录"
          placement="right"
          closable={false}
          onClose={this.onClose}
          visible={showDrawer}
          width={500}
        >
          {importList && importList.map((o, i) => {
            return (
              <div key={i} className={styles.drawer}>
                <p style={{ fontWeight: 'bold' }}>{arr2[0]} {o.cs} 摘录</p>
                <p style={{ fontWeight: 'bold' }}>摘录：</p>
                <div>{o.gszy}</div>
                <p style={{ fontWeight: 'bold', marginTop: 20 }}>分析：</p>
                <div>
                  <Checkbox checked={o.otherAnalysis.brz === '是'} />
                  <span style={{ marginRight: 10 }}>&nbsp;不认罪</span>
                  <Checkbox checked={o.otherAnalysis.fg === '是'} />
                  <span>&nbsp;翻供</span>
                </div>
                <div>{o.analysis}</div>
                <Button onClick={() => this.chooseGszy(o)}
                  size={'small'}
                  type={'primary'}
                  style={{ float: 'right', marginRight: 20 }}
                >同本次摘录及分析</Button>
              </div>
            )
          })}
        </Drawer>
      </Form>
    );
  }
}
