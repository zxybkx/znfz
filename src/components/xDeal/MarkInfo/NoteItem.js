import React, {Component} from 'react';
import {Button, Icon, Row, Col, Form, Input, Popconfirm, Tooltip, Select, Timeline} from 'antd';
import Bind from 'lodash-decorators/bind';
import Debounce from 'lodash-decorators/debounce';
import OcrWrapper from 'lib/OcrWrapper';
import {cursorPosition} from 'utils/utils';
import styles from './Item.less';

const FormItem = Form.Item;
const {TextArea} = Input;
const Option = Select.Option;

@Form.create()
export default class MarkInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  saveMark = (id, attribute) => {
    const {validateFields} = this.props.form;
    const {fileKey, filename, fileCategory, imageSource, currentPage} = this.props;
    validateFields(
      [
        'title_' + fileKey + '_' + id,
        'attribute_' + fileKey + '_' + id,
        'excerpt_' + fileKey + '_' + id,
        'analysis_' + fileKey + '_' + id
      ], (err, values) => {
        if (err) return;
        const _attribute = attribute ? attribute : values['attribute_' + fileKey + '_' + id] ? values['attribute_' + fileKey + '_' + id] : [];
        const data = {
          title: filename,
          category: fileCategory,
          attribute: _attribute,
          excerpt: values['excerpt_' + fileKey + '_' + id],
          analysis: values['analysis_' + fileKey + '_' + id],
        };

        // 判断是否摘录,是则为文书添加标记
        // if(!_.isEmpty(data.attribute) || !_.isEmpty(data.analysis) || !_.isEmpty(data.excerpt)) {
        //   this.props.addWsMark(currentPage, filename, imageSource, fileCategory, '2')
        // }
        //id存在时，失去焦点保存
        //id不存在时，数据不为空才触发保存，避免表单改变无法框选文字
        if (id) {
          this.props.saveMark && this.props.saveMark(data, id, attribute);
        } else {
          if (
            values['excerpt_' + fileKey + '_' + id] ||
            values['analysis_' + fileKey + '_' + id] ||
            _attribute.length > 0
        ) {
            this.props.saveMark && this.props.saveMark(data, id, attribute);
          }
        }

      });
  };

  deleteMark = (id) => {
    const {deleteMark, fileKey} = this.props;
    if (id) {
      deleteMark && deleteMark(id);
    } else {
      const {setFieldsValue} = this.props.form;
      setFieldsValue({
        [`title_${fileKey}_`]: '',
        [`attribute_${fileKey}_`]: [],
        [`excerpt_${fileKey}_`]: '',
        [`analysis_${fileKey}_`]: '',
      });
    }
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

  render() {
    const {getFieldDecorator} = this.props.form;
    const {fileKey, facts, item} = this.props;
    const getTooltip = (data) => (
      <div className={styles.tooltip}>
        {
          _.map(data, (v, k) => {
            if (k === '案情摘要') {
              return (<p key={k}><span>{k}</span> : <span>{v}</span></p>)
            }
          })
        }
      </div>
    );

    return (
      <div className={styles.default}>
        <div className={styles.content}>
          <Row className={styles.main}>
            <Col span={24} className={styles.part}>
              <div className={styles.left}>关联</div>
              <div className={styles.right}>
                <Icon type="down" className={styles.icon}/>
                <FormItem className={styles.item} style={{paddingRight: 11}}>
                  {
                    getFieldDecorator('attribute_' + fileKey + '_' + item.id, {initialValue: item.attribute})(
                      <Select style={{width: '100%'}}
                              onChange={(value) => this.saveMark(item.id, value)}
                              mode="multiple"
                      >
                        {
                          facts && facts.map((obj, index) => {
                            return (
                              <Option key={index} value={obj.id}>
                                <Tooltip placement='left' title={getTooltip(obj.aqjxdata)} tooltip>
                                  {obj.mergekey}：{`${obj.aqjxdata['案情摘要']}`}
                                </Tooltip>
                              </Option>
                            )
                          })
                        }
                      </Select>,
                    )}
                </FormItem>
              </div>
            </Col>
            <Col span={24} className={styles.part}>
              <div className={styles.left}>摘录</div>
              <div className={styles.right}>
                <FormItem className={styles.item}>
                  <OcrWrapper onClick={() => this.onOcrClick('excerpt_' + fileKey + '_' + item.id)}>
                    {
                      getFieldDecorator('excerpt_' + fileKey + '_' + item.id,
                        {
                          initialValue: item.excerpt,
                          // rules: [{required: true, message: '摘录不可为空！'}],
                        })(
                        <TextArea rows={8}
                                  onClick={this.onInputClick}
                                  onBlur={() => this.saveMark(item.id)}
                        />,
                      )}
                  </OcrWrapper>
                </FormItem>
              </div>
            </Col>
            <Col span={24} className={styles.part}>
              <div className={styles.left}><span className={styles.fx}>分析</span></div>
              <div className={styles.right}>
                <FormItem className={styles.item}>
                  <OcrWrapper onClick={() => this.onOcrClick('analysis_' + fileKey + '_' + item.id)}>
                    {
                      getFieldDecorator('analysis_' + fileKey + '_' + item.id, {initialValue: item.analysis})(
                        <TextArea rows={3}
                                  onClick={this.onInputClick}
                                  onBlur={() => this.saveMark(item.id)}
                        />,
                      )}
                  </OcrWrapper>
                </FormItem>
              </div>
            </Col>
          </Row>
          <Row className={styles.bottom}>
            <Popconfirm title="确认删除？"
                        okText="是"
                        cancelText="否"
                        onConfirm={() => this.deleteMark(item.id)}>
              <Button className={styles.delete}
                      size={'small'}
                      type={'primary'}>
                删除
              </Button>
            </Popconfirm>
          </Row>
        </div>
      </div>
    );
  }
}
