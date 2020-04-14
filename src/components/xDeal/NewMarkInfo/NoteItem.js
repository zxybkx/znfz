import React, {Component} from 'react';
import {Button, Icon, Row, Col, Form, Input, Popconfirm, Tooltip, Select, Tag} from 'antd';
import Bind from 'lodash-decorators/bind';
import Debounce from 'lodash-decorators/debounce';
import OcrWrapper from 'lib/OcrWrapper';
import _ from 'lodash';
import {cursorPosition} from 'utils/utils';
import styles from './Item.less';

const FormItem = Form.Item;
const {TextArea} = Input;
const Option = Select.Option;
const {CheckableTag} = Tag;
const initlxqj = [{'自动投案': '否'}, {'检举揭发': '否'}];

@Form.create()
export default class MarkInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }


  saveMark = (id, attribute, lxqj = initlxqj) => {
    const {validateFields} = this.props.form;
    const {fileKey, filename, fileCategory} = this.props;
    validateFields(
      [
        'title_' + fileKey + '_' + id,
        'attribute_' + fileKey + '_' + id,
        'excerpt_' + fileKey + '_' + id,
        'analysis_' + fileKey + '_' + id
      ], (err, values) => {
        if (err) return;
        const data = {
          title: filename,
          category: fileCategory,
          attribute: values['attribute_' + fileKey + '_' + id] ? values['attribute_' + fileKey + '_' + id] : [],
          excerpt: values['excerpt_' + fileKey + '_' + id],
          analysis: values['analysis_' + fileKey + '_' + id],
          lxqj: lxqj
        };

        if (id) {
          this.props.saveMark && this.props.saveMark(data, id, attribute);
        } else {
          if (
            values['excerpt_' + fileKey + '_' + id] ||
            values['analysis_' + fileKey + '_' + id] ||
            values['attribute_' + fileKey + '_' + id] && values['attribute_' + fileKey + '_' + id].length > 0
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

  handleBooleanChange = (value, currentTag, index, list) => {
    const {item} = this.props;

    const newTagValue = {
      ...currentTag,
      [_.keys(currentTag)]: value === true ? '是' : '否'
    }

    list.splice(index, 1, newTagValue)

    this.saveMark(item.id, null, list)
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    const {fileKey, facts, filename, item} = this.props;
    const show = _.startsWith(filename, '讯问笔录');
    let newLxqj = item && item.lxqj || initlxqj;

    return (
      <Form className={styles.default}>
        <div className={styles.main}>
          <div className={styles.top} style={{borderBottom: '1px solid grey'}}>
            <div className={styles.left}><span className={styles.zl}>摘录</span></div>
            <div className={styles.right}>
              <FormItem className={styles.item}>
                <OcrWrapper onClick={() => this.onOcrClick('excerpt_' + fileKey + '_' + item.id)}>
                  {
                    getFieldDecorator('excerpt_' + fileKey + '_' + item.id,
                      {
                        initialValue: item.excerpt,

                      })(
                      <TextArea rows={6}
                                onClick={this.onInputClick}
                                onBlur={() => this.saveMark(item.id)}
                                placeholder={show ?  "核对嫌疑人基本情况  执行强制措施  综合性供述  检举揭发":undefined}
                      />,
                    )}
                </OcrWrapper>
                {
                  show && newLxqj && newLxqj.map((d, index) => (
                    <CheckableTag onChange={(value) => this.handleBooleanChange(value, d, index, newLxqj)} key={index}
                                  style={{marginTop: '8px'}}
                                  checked={d[_.keys(d)] === '是'}>
                      {_.keys(d)}
                    </CheckableTag>
                  ))
                }
              </FormItem>
            </div>
          </div>
          <div className={styles.top}>
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
          </div>
        </div>
      </Form>
    );
  }
}
