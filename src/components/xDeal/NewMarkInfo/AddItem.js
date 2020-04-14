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
      // showZl: this.props.item.wgs ? this.props.item.wgs === '供述' : false,
      subVisible: false,
    };
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

  onZlChange = (value) => {
    const {validateFields} = this.props.form;
    const {fileKey, obj, item, dealYczj} = this.props;
    const id = obj.id;
    validateFields((err, values) => {
      if (err) return;
      const data = {
        aqjxdata: item.aqjxdata,
        gszy: value,
        // wgs: values['wgs_' + fileKey + '_' + id] ? '无供述' : '供述',
        // brz: values['brz_' + fileKey + '_' + id] ? '不认罪' : '认罪',
        otherAnalysis: {
          brz: values['brz_' + fileKey + '_' + id] ? '是' : '否',
          fg: values['fg_' + fileKey + '_' + id] ? '是' : '否',
        },
        analysis: values['analysis_' + fileKey + '_' + id] || '',
        rdss: obj.rdss,
        mergekey: obj.id
      };
      dealYczj && dealYczj('add', data);
      this.props.getNLP && this.props.getNLP(value, data);
    });
  };

  saveNLP = (label, data, sublabel, subIndex) => {
    const {item, dealYczj} = this.props;
    const _item = _.cloneDeep(item);
    if (sublabel) {
      // 二级
      _.set(_item.aqjxdata[sublabel][subIndex], label, data);
    } else {
      // 一级
      _.set(_item.aqjxdata, label, data);
    }

    dealYczj && dealYczj('add', _item);
  };

  deleteNLP = (label, data, subIndex) => {

    const {item, dealYczj} = this.props;
    const _item = _.cloneDeep(item);
    // console.log(item.aqjxdata);
    // console.log('原始', item.aqjxdata[label]);
    // console.log('删除u', data);
    const arr = _.cloneDeep(_item.aqjxdata[label]);
    const i = Number(subIndex);
    // _.remove(arr, arr[i]);
    arr.splice(i, 1);
    _.set(_item.aqjxdata, label, arr);
    dealYczj && dealYczj('add', _item);
  };

  addNLP = (path, values, label) => {
    const type = label && label === '被害人' ? 'enume|bhrshuxing' :
      label && label === '参与人' ? 'enume|cyrshuxing' : 'string';
    const newitem = {
      '姓名': {
        content: values['姓名'],
        coords: [],
        // path: path,
        property: ['list'],
        type: 'string',
      },
      '属性': {
        content: values['属性'],
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
        // wgs: values['wgs_' + fileKey + '_' + id] ? '无供述' : '供述',
        // brz: values['brz_' + fileKey + '_' + id] ? '不认罪' : '认罪',
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
    return (
      <Form>

      </Form>
    );
  }
}
