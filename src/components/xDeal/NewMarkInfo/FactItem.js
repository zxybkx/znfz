import React, {Component} from 'react';
import {Button, Icon, Row, Col, Form, Input, Popconfirm, Checkbox, Dropdown, Tooltip, Menu} from 'antd';
import Bind from 'lodash-decorators/bind';
import Debounce from 'lodash-decorators/debounce';
import OcrWrapper from 'lib/OcrWrapper';
import {cursorPosition} from 'utils/utils';
import styles from './Item.less';
import MoreNlp from './MoreNlp';

const FormItem = Form.Item;
const {TextArea} = Input;

@Form.create()
export default class MarkInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      subVisible: false,
    };
  }

  saveFactMark = () => {
    const {validateFields} = this.props.form;
    const {fileKey, obj, item, dealYczj, currentPage, imageSource, fileCategory, filename} = this.props;
    const id = obj.id;
    validateFields((err, values) => {
      if (err) return;
      const data = {
        aqjxdata: item.aqjxdata,
        gszy: values['gszy_' + fileKey + '_' + id] || '',
        otherAnalysis: {
          brz: values['brz_' + fileKey + '_' + id] ? '是' : '否',
          fg: values['fg_' + fileKey + '_' + id] ? '是' : '否',
        },
        analysis: values['analysis_' + fileKey + '_' + id] || '',
        rdss: obj.rdss,
        mergekey: obj.id
      };

      // if(!_.isEmpty(data.gszy) || !_.isEmpty(data.analysis)) {
      //   this.props.addWsMark(currentPage, filename, imageSource, fileCategory, '2')
      // }
      dealYczj && dealYczj('add', data);
    });
  };

  deleteFactMark = () => {
    const {obj, dealFact, dealYczj} = this.props;
    dealFact && dealFact('delete', obj.id);


    dealYczj && dealYczj('delete', obj.rdss);
  };

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
    const {getFieldValue, setFieldsValue} = this.props.form;
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

  onRzChange = (e) => {
    const {validateFields} = this.props.form;
    const {fileKey, obj, item, dealYczj} = this.props;
    const id = obj.id;
    validateFields((err, values) => {
      if (err) return;
      const data = {
        aqjxdata: item.aqjxdata,
        gszy: values['gszy_' + fileKey + '_' + id] || '',
        otherAnalysis: {
          brz: e.target.checked ? '是' : '否',
          fg: values['fg_' + fileKey + '_' + id] ? '是' : '否',
        },
        analysis: values['analysis_' + fileKey + '_' + id] || '',
        rdss: obj.rdss,
        mergekey: obj.id
      };
      dealYczj && dealYczj('add', data);
    });
  };

  onFgChange = (e) => {
    const {validateFields} = this.props.form;
    const {fileKey, obj, item, dealYczj} = this.props;
    const id = obj.id;
    validateFields((err, values) => {
      if (err) return;
      const data = {
        aqjxdata: item.aqjxdata,
        gszy: values['gszy_' + fileKey + '_' + id] || '',
        otherAnalysis: {
          brz: values['brz_' + fileKey + '_' + id] ? '是' : '否',
          fg: e.target.checked ? '是' : '否',
        },
        analysis: values['analysis_' + fileKey + '_' + id] || '',
        rdss: obj.rdss,
        mergekey: obj.id
      };
      dealYczj && dealYczj('add', data);
    });
  };

  onZlChange = () => {
    const {validateFields} = this.props.form;
    const {fileKey, obj, item, dealYczj, currentPage, imageSource, fileCategory, filename} = this.props;
    const id = obj.id;
    validateFields((err, values) => {
      if (err) return;
      const data = {
        aqjxdata: item.aqjxdata,
        gszy: values['gszy_' + fileKey + '_' + id] || '',
        otherAnalysis: {
          brz: values['brz_' + fileKey + '_' + id] ? '是' : '否',
          fg: values['fg_' + fileKey + '_' + id] ? '是' : '否',
        },
        analysis: values['analysis_' + fileKey + '_' + id] || '',
        rdss: obj.rdss,
        mergekey: obj.id
      };

      // if(!_.isEmpty(data.gszy) || !_.isEmpty(data.analysis)) {
      //   this.props.addWsMark(currentPage, filename, imageSource, fileCategory, '2')
      // }
      dealYczj && dealYczj('add', data);
    });
  };

  getNLP = () => {
    const {validateFields} = this.props.form;
    const {fileKey, obj, item} = this.props;
    const id = obj.id;
    validateFields((err, values) => {
      if (err) return;
      const value = values['gszy_' + fileKey + '_' + id] || '';
      const data = {
        aqjxdata: item.aqjxdata,
        gszy: value,
        otherAnalysis: {
          brz: values['brz_' + fileKey + '_' + id] ? '是' : '否',
          fg: values['fg_' + fileKey + '_' + id] ? '是' : '否',
        },
        analysis: values['analysis_' + fileKey + '_' + id] || '',
        rdss: obj.rdss,
        mergekey: obj.id
      };
      this.props.getNLP && this.props.getNLP(value, data);
    });
  };

  saveNLP = (label, data, sublabel, subIndex) => {
    const {item, dealYczj} = this.props;
    const _item = _.cloneDeep(item);
    if (sublabel) {

      _.set(_item.aqjxdata[sublabel][subIndex], label, data);
    } else {

      _.set(_item.aqjxdata, label, data);
    }

    dealYczj && dealYczj('add', _item);
  };

  deleteNLP = (label, data, subIndex) => {

    const {item, dealYczj} = this.props;
    const _item = _.cloneDeep(item);
    const arr = _.cloneDeep(_item.aqjxdata[label]);
    const i = Number(subIndex);
    arr.splice(i, 1);
    _.set(_item.aqjxdata, label, arr);
    dealYczj && dealYczj('add', _item);
  };

  addNLP = (path, values, label) => {
    const type = label && label === '被害人' ? 'enume|bhrshuxing' :
      label && label === '参与人' ? 'enume|cyrshuxing' : 'string';
    const newitem = {
      '姓名': {
        content: values && values['姓名'],
        coords: [],
        // path: path,
        property: ['list'],
        type: 'string',
      },
      '属性': {
        content: values && values['属性'],
        coords: [],
        // path: path,
        property: ['list'],
        type: type,
      },
      listname: {
        content: '姓名',
        coords: [],
        // path: path,
        property: ['list'],
        type: 'unknown',

      }
    };
    const {item, dealYczj} = this.props;
    const _item = _.cloneDeep(item);
    _item.aqjxdata[label].push(newitem);
    dealYczj && dealYczj('add', _item);

  };

  onMenuClick = (key) => {
    const {facts} = this.props;
    const item = facts[key];
    this.onZladd(item.rdss, item.nlpdata)
  };

  onZladd = (value, aqjxdata) => {
    const {validateFields} = this.props.form;
    const {fileKey, obj, dealYczj} = this.props;
    const id = obj.id;
    validateFields((err, values) => {
      if (err) return;
      const data = {
        aqjxdata: aqjxdata,
        gszy: value,
        otherAnalysis: {
          brz: values['brz_' + fileKey + '_' + id] ? '是' : '否',
          fg: values['fg_' + fileKey + '_' + id] ? '是' : '否',
        },
        analysis: values['analysis_' + fileKey + '_' + id] || '',
        rdss: obj.rdss,
        mergekey: obj.id
      };
      dealYczj && dealYczj('add', data);
    });
  };

  render() {
    const {getFieldDecorator} = this.props.form;
    const {fileKey, obj, item, facts, filename, ysay} = this.props;
    const {subVisible} = this.state;
    const show = _.startsWith(filename, '讯问笔录') || _.startsWith(filename, '犯罪嫌疑人供述');
    const showMore = _.startsWith(filename, '讯问笔录') || _.startsWith(filename, '询问笔录');
    return (
      <Form className={styles.default}>
        <div className={styles.main}>
          <div className={styles.top} style={{borderBottom: '1px solid grey'}}>
            <div className={styles.left}><span className={styles.zl}>摘录</span></div>
            <div className={styles.right}>
              <div>
                <FormItem className={styles.item}>
                  <OcrWrapper onClick={() => this.onOcrClick('gszy_' + fileKey + '_' + obj.id)}>
                    {
                      getFieldDecorator('gszy_' + fileKey + '_' + obj.id,
                        {
                          initialValue: item.gszy,
                        })(
                        <TextArea rows={8}
                                  onClick={this.onInputClick}
                                  onBlur={() => this.onZlChange()}
                        />
                      )}
                  </OcrWrapper>
                </FormItem>
              </div>
              <div>
                {ysay === '交通肇事罪' || ysay === '危险驾驶罪' && !showMore &&
                <Col span={24}>
                  {
                    !_.isEmpty(item.aqjxdata) ?
                      <a onClick={() => this.setState({subVisible: !subVisible})}>
                        更多 <Icon type={subVisible ? 'down' : 'right'}/>
                      </a> : null
                  }
                  <Button size={'small'}
                          type={'primary'}
                          ghost
                          onClick={() => this.getNLP()}
                          style={{float: 'right', marginTop: 3, marginRight: 20}}>
                    解析
                  </Button>
                </Col>
                }
                {subVisible && !_.isEmpty(item.aqjxdata) ?
                  <Col span={24} className={styles.part}>
                    <MoreNlp data={item.aqjxdata}
                             saveNLP={this.saveNLP}
                             ifSave={this.props.ifSave}
                             enumerate={this.props.enumerate}
                             deleteNLP={this.deleteNLP}
                             addNLP={this.addNLP}
                    />
                  </Col> : null
                }
              </div>
            </div>
          </div>
          <div className={styles.top}>
            <div className={styles.left}><span className={styles.fx}>分析</span></div>
            <div className={styles.right}>
              {show ?
                <div>
                  <Row>
                    <Col span={4}>
                      <FormItem style={{margin: 0}}>
                        {
                          getFieldDecorator('brz_' + fileKey + '_' + obj.id,
                            {valuePropName: 'checked', initialValue: item.brz && item.brz === '是'})(
                            <Checkbox onChange={this.onRzChange}>不认罪</Checkbox>,
                          )}
                      </FormItem>
                    </Col>
                    <Col span={4}>
                      <FormItem style={{margin: 0}}>
                        {
                          getFieldDecorator('fg_' + fileKey + '_' + obj.id,
                            {valuePropName: 'checked', initialValue: item.fg && item.fg === '是'})(
                            <Checkbox onChange={this.onFgChange}>翻供</Checkbox>,
                          )}
                      </FormItem>
                    </Col>
                  </Row>
                </div>
                : null
              }
              <div>
                <FormItem className={styles.item}>
                  <OcrWrapper onClick={() => this.onOcrClick('analysis_' + fileKey + '_' + obj.id)}>
                    {
                      getFieldDecorator('analysis_' + fileKey + '_' + obj.id, {initialValue: item.analysis})(
                        <TextArea rows={3}
                                  onClick={this.onInputClick}
                                  onBlur={() => this.saveFactMark()}
                        />,
                      )}
                  </OcrWrapper>
                </FormItem>
              </div>
            </div>
          </div>
          <div className={styles.del}>
            {
              Number(obj.type) === 1 ?
                <Popconfirm title="确认删除？若确认无供述，将会删除该事实及其摘录"
                            okText="是"
                            cancelText="否"
                            onConfirm={() => this.deleteFactMark()}>
                  <Button className={styles.delete}
                          size={'small'}
                          type={'primary'}>
                    删除
                  </Button>
                </Popconfirm> : null
            }
          </div>
        </div>
      </Form>
    );
  }
}
