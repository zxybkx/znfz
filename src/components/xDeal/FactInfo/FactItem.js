import React, {Component} from 'react';
import {Button, Icon, Row, Col, Form, Input, Popconfirm, Spin, Drawer} from 'antd';
import Bind from 'lodash-decorators/bind';
import Debounce from 'lodash-decorators/debounce';
import OcrWrapper from 'lib/OcrWrapper';
import _ from 'lodash';
import {cursorPosition} from 'utils/utils';
import reactComponentDebounce from 'lib/DebounceFormWrapper';
import styles from './FactItem.less';
import MoreNlp from './MoreNlp';
import {connect} from 'dva'

const FormItem = Form.Item;
const {TextArea} = Input;
const MyTextArea = reactComponentDebounce(500)(TextArea);
@connect(({global, znfz, zcjd, loading}) => ({
  global,
  znfz,
  zcjd,
}))
@Form.create({
  // onFieldsChange: (props, fields) => {
  //   console.log(111);
  //   const {data, saveNLP} = props;
  //   _.forEach(fields, (field, path) => {
  //     const item = _.find(data, (v, k) => v.path === path);
  //     _.set(item, `content`, field.value);
  //     saveNLP && saveNLP(item);
  //   });
  // },
})
export default class FactItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subVisible: false,
      showDrawer: false,
      zjFacts: [],
      docNlp: {},
      path: '',
      loading: false,
      btnLoading: false,
    };
  }

  componentDidMount() {
    const {dispatch, match, znfz, ysay, stage} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: 'znfz/tbflg',
      payload: {
        bmsah: id,
      },
    });
    // if(ysay==='交通肇事罪' || ysay === '危险驾驶罪'){
    //   this.setState({subVisible:true})
    // }
  }

  onDelete = (path) => {
    const {deleteNLP, form: {resetFields}} = this.props;
    deleteNLP && deleteNLP(path);
    resetFields();
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

      if (_.startsWith(path, 'gszy_')) {
        this.onZlChange(value)
      }

    }
  };

  //Nlp解析
  onNlpAnalyze = (path) => {
    const {data, getNLP} = this.props;
    const value = this.props.form.getFieldValue(path);
    const item = _.find(data, (v, k) => v.path === path);
    if (_.has(item, 'nlp_property')) {
      const property = _.get(item, 'nlp_property');
      if (!_.isEmpty(property)) {
        const {api, params} = property;
        const key = _.findKey(data, (v, k) => v.path === path);
        _.set(item, `content`, value);
        getNLP && getNLP(path, key, value, {
          ...params,
          path: path,
          text_string: value,
        }, data);
      }
    }
  };


  onFactAlabelClick = (path) => {
    const {dispatch, zjbmsah, data, doSave} = this.props;
    if (!data.gsmergekey) {
      doSave && doSave(false)
    }
    this.props.doLoading && this.props.doLoading();
    this.setState({
      btnLoading: true
    }, () => {
      this.refresh = setTimeout(() => {
        this.setState({
          showDrawer: true,
          loading: true,
          btnLoading: false
        });
        if (zjbmsah) {
          dispatch({
            type: 'znfz/getNlpByBmsahAndWsmc',
            payload: {
              bmsah: zjbmsah,
              wsmc: '提请批准逮捕书'
            }
          }).then(({success, data: docNlp}) => {
              dispatch({
                type: 'znfz/getFactListByType',
                payload: {
                  bmsah: zjbmsah,
                  type: 0,
                }
              }).then(({success, data}) => {
                if (success && data) {
                  this.setState({
                    zjFacts: data,
                    docNlp: docNlp,
                    loading: false,
                    path,
                  });
                }
              });
            }
          );
        }
      }, 2000);
    })
  };


  onClose = () => {
    this.setState({
      showDrawer: false,
    });
  };


  onRelate = (fact) => {
    this.setState({
      loading: true
    }, () => {
      this.refresh = setTimeout(() => {
        const {data, zjmergekeyList} = this.props;
        const {docNlp} = this.state;
        this.setState({
          showDrawer: false,
        })
        if (fact) {
          const zcss = _.find(docNlp.content['侦查机关认定的犯罪事实'], o => o && o.listname && o.listname.path === fact.nlppath);
          const oldgsmergekey = zjmergekeyList[fact.mergekey];

          const zjdata = {
            zjmergekey: fact.mergekey,
            zjid: String(fact.id)
          };

          if (data.gsmergekey === oldgsmergekey) return;
          this.props.relateFact && this.props.relateFact(data.gsmergekey, zjdata, zcss, oldgsmergekey);

        } else {
          this.props.relateFact && this.props.relateFact(data.gsmergekey);
        }
      }, 1000);
    });

  };

  saveNlp = (e, name) => {
    const {data, saveNLP} = this.props;
    const item = _.find(data, (v, k) => v.path === name);
    _.set(item, `content`, e.target.value);
    saveNLP && saveNLP(item);
  };


  render() {
    const {getFieldDecorator} = this.props.form;
    let {data = {}, index, provided = {}, stage, zjmergekeyList, zjbmsah, tbflag} = this.props;
    const {subVisible, zjFacts, loading, btnLoading} = this.state;

    const orderZjFacts = _.orderBy(zjFacts, v => v.orderBy);
    const _data = _.cloneDeep(data);
    delete _data.orderBy;
    delete _data.gsmergekey;
    delete _data.zjdata;
    const zjmergekey = data && data.zjdata && data.zjdata.zjmergekey;

    const msg = stage === 'GS' && zjbmsah ?
      zjmergekey ?
        zjmergekey === '无关联' ?
          <span style={{marginLeft: 20}}>同审查逮捕阶段
            <Button style={{color: '#1890ff', marginLeft: 5}}
                    size={'small'}
                    loading={btnLoading}
                    onClick={() => this.onFactAlabelClick(_.get(_data, 'listname.path'))}>
              无关联
            </Button>
          </span> :
          <span style={{marginLeft: 20}}>同审查逮捕阶段
            <Button style={{color: '#1890ff', marginLeft: 5}}
                    size={'small'}
                    loading={btnLoading}
                    onClick={() => this.onFactAlabelClick(_.get(_data, 'listname.path'))}>
              {zjmergekey}
            </Button>
          </span>
        :
        ''
      // <span style={{marginLeft: 20}}>
      //   同审查逮捕阶段
      //   <Button style={{color: 'red', marginLeft: 5}}
      //           size={'small'}
      //           loading={btnLoading}
      //           onClick={() => this.onFactAlabelClick(_.get(_data, 'listname.path'))}>
      //     第 ？笔
      //   </Button>
      // </span>
      : '';

    const name = _.get(_data, '案情摘要.path');
    return (
      <Form>
        <div className={styles.default}>
          <div className={styles.title} {...provided.dragHandleProps}>
            <div className={styles.left}>
              {'第' + `${index + 1}` + '笔'}
              {/*{msg}*/}
            </div>
            <div className={styles.right}>
              <Popconfirm title="该案情将会删除且无法恢复，确认删除？"
                          okText="是"
                          cancelText="否"
                          onConfirm={() => this.onDelete(_.get(_data, 'listname.path'))}>
                <a className={styles.delete}><Icon type='close'/></a>
              </Popconfirm>
            </div>
          </div>
          <div className={styles.content}>
            <Row className={styles.main}>
              <Col span={24} className={styles.part}>
                <div className={styles.left}>
                  案情摘要
                </div>
                <div className={styles.right}>
                  <FormItem className={styles.item}>
                    <OcrWrapper onClick={() => this.onOcrClick(_.get(_data, '案情摘要.path'))}>
                      {
                        getFieldDecorator(name,
                          {
                            initialValue: _.get(_data, '案情摘要.content', null),
                          })(
                          <MyTextArea rows={5}
                                      onBlur={(e) => this.saveNlp(e,name)}
                                      onClick={this.onInputClick}
                          />,
                        )}
                    </OcrWrapper>
                  </FormItem>
                </div>
              </Col>
              <Col span={24} className={styles.part}
              >
                <a onClick={() => this.setState({subVisible: !subVisible})}>
                  更多 <Icon type={subVisible ? 'down' : 'right'}/>
                </a>
                <Button size={'small'}
                        type={'primary'}
                        ghost
                        onClick={() => this.onNlpAnalyze(_.get(_data, '案情摘要.path'))}
                        style={{marginLeft: '85%'}}>
                  解析
                </Button>
              </Col>
              {subVisible && !_.isEmpty(_data) ?
                <Col span={24} className={styles.part}>
                  <MoreNlp data={_data}
                           ifSave={this.props.ifSave}
              
                           saveNLP={this.props.saveNLP}
                           deletePath={this.props.deletePath}
                           enumerate={this.props.enumerate}
                           names={this.props.names}
                           deleteNLP={this.props.deleteNLP}
                           addNLP={this.props.addNLP}
                           ysay={this.props.ysay}
                  />
                </Col> : null
              }
            </Row>
          </div>
        </div>
        <Drawer
          title="本案在审查逮捕阶段审查认定的事实"
          placement="right"
          closable={false}
          onClose={this.onClose}
          visible={this.state.showDrawer}
          width={500}
        >
          <div className={styles.drawer}>
            <Spin spinning={loading} size='large' className={styles.spin}/>
            <div className={styles.clear}>
              <Button
                onClick={() => this.onRelate()}
                size={'small'}
                type={'primary'}
                className={styles.btn}
              >无关联</Button>
            </div>
            <div>
              {orderZjFacts && orderZjFacts.map((o, i) => {
                const msg = zjmergekeyList[o.mergekey] ? '已关联公诉阶段' + zjmergekeyList[o.mergekey] : '未关联';
                return (
                  <div className={styles.item} key={i}>
                    <p style={{fontWeight: 'bold'}}>
                      {o.mergekey}
                      <span style={{color: 'red', marginLeft: 20}}>
                        {msg}
                      </span>
                    </p>
                    <p>{o.rdss}</p>
                    <Button
                      onClick={() => this.onRelate(o)}
                      size={'small'}
                      type={'primary'}
                      className={styles.btn}
                    >关联</Button>
                  </div>
                )
              })}
            </div>
          </div>
        </Drawer>
      </Form>
    );
  }
}
