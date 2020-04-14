import React, {PureComponent} from 'react';
import {Input, Button, Icon, Row, Col, message} from 'antd';
import styles from './index.less';
import moment from 'moment';
import _ from 'lodash';

const data = ['年', '月', '日', '时', '分', '秒'];
const _data = ['year', 'month', 'day', 'hour', 'min', 'sec'];
const formatRule = ['YYYY', 'MM', 'DD', 'HH', 'mm', 'ss'];

export default class Time extends PureComponent {
  constructor(props) {
    super(props);
    let currentParms = this.dealValue(props);
    this.state = {
      name: currentParms.name,
      show: currentParms.show,
      valueList: currentParms.valueList,
      value: currentParms.value
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.initialValue !== nextProps.initialValue) {
      let currentParms = this.dealValue(nextProps);
      this.setState({
        name: currentParms.name,
        show: currentParms.show,
        valueList: currentParms.valueList,
        value: currentParms.value
      })
    }
  }

  dealValue = (props) => {
    const idx = _.indexOf(_data, props.type);
    const name = _.dropRight(data, (5 - idx));
    const valueList = this.dealListByValue(props.initialValue, name);
    const value1 = _.map(valueList, (v, k) => v + k);
    const value = props.initialValue && props.initialValue.split('-').length === 3 && idx === 2 ? moment(props.initialValue, 'YYYY-MM-DD').format('YYYY年MM月DD日') : _.join(value1, '');

    const indx = _.indexOf(_data, props.type);
    const splitData = 'YYYY-MM-DD HH:mm:ss';
    const splitFormat = 'YYYY年MM月DD日HH时mm分ss秒';
    const tishi = splitData.split(formatRule[indx]);
    const formattishi = splitFormat.split(data[indx]);
    const formatValue = moment(value, tishi[0] + formatRule[indx]).format(formattishi[0] + data[indx]);

    return ({
      name: name,
      show: false,
      valueList: valueList,
      value: props.initialValue === '无' ? '无' : value1.length > 0 ? formatValue === 'Invalid date' || value1.length < idx + 1 ? value : formatValue : value
    })
  }

  dealListByValue = (value, name) => {
    // const validateTime = new RegExp(/^((\d{4})(年)|(\d{4})(年)(\d{1,2})(月)|(\d{4})(年)(\d{1,2})(月)(\d{1,2})(日)|(\d{4})(年)(\d{1,2})(月)(\d{1,2})(日)(\d{1,2})(时)|(\d{4})(年)(\d{1,2})(月)(\d{1,2})(日)(\d{1,2})(时)(\d{1,2})(分)|(\d{4})(年)(\d{1,2})(月)(\d{1,2})(日)(\d{1,2})(时)(\d{1,2})(分)(\d{1,2})(秒)|(\d{1,2})(月)|(\d{1,2})(月)(\d{1,2})(日)|(\d{1,2})(月)(\d{1,2})(日)(\d{1,2})(时)|(\d{1,2})(月)(\d{1,2})(日)(\d{1,2})(时)(\d{1,2})(分)|(\d{1,2})(月)(\d{1,2})(日)(\d{1,2})(时)(\d{1,2})(分)(\d{1,2})(秒)|(\d{1,2})(日)|(\d{1,2})(日)(\d{1,2})(时)|(\d{1,2})(日)(\d{1,2})(时)(\d{1,2})(分)|(\d{1,2})(日)(\d{1,2})(时)(\d{1,2})(分)(\d{1,2})(秒)|(\d{1,2})(时)|(\d{1,2})(时)(\d{1,2})(分)|(\d{1,2})(时)(\d{1,2})(分)(\d{1,2})(秒)|(\d{1,2})(分)|(\d{1,2})(分)(\d{1,2})(秒)|(\d{1,2})(秒)|(无))$/);
    // const initialV = validateTime.test(value);
    let valueList = {};
    // if (initialV) {
    _.map(name, (o) => {
      if (o === '年') {
        if (value && value.indexOf('年') > -1) {
          _.set(valueList, o, value.split('年')[0]);
        }
      } else {
        if (value && value.indexOf(o) > -1) {
          const first = value.split(o)[0].slice(-2, -1) == Number(value.split(o)[0].slice(-2, -1)) ? value.split(o)[0].slice(-2, -1) : '';
          const second = value.split(o)[0].slice(-1) == Number(value.split(o)[0].slice(-1)) ? value.split(o)[0].slice(-1) : '';
          const num = first + second;
          _.set(valueList, o, num);
        }
      }
    });
    // }
    return valueList;
  };

  onClick = () => {
    this.setState({
      show: true
    })
  };


  onMouseDown = (e) => {
    e.preventDefault();
  };

  onSure = () => {
    this.setState({
      show: false
    });

    let {value} = this.state;
    const idx = _.indexOf(_data, this.props.type);
    const name = _.dropRight(data, (5 - idx));
    const valueList = this.dealListByValue(value, name);
    const value1 = _.map(valueList, (v, k) => v + k);
    const currentValue = _.join(value1, '');
    const tips = this.dealPlaceholder();
    const splitData = 'YYYY-MM-DD HH:mm:ss';
    const tishi = splitData.split(formatRule[idx]);

    if (currentValue === value || value === '无') {
      const {item} = this.props;
      _.set(item, 'content', value);
      if (value && value !== '无') {
        if (moment(value, tishi[0] + formatRule[idx]).isValid()) {
          item && this.props.onSave && this.props.onSave(item, undefined);
        } else {
          if (this.props.timeType && this.props.timeType === 'sccl') {
            item && this.props.onSave && this.props.onSave(item, undefined);
          }else{
            message.error(`日期格式不正确！${tips}`);
            _.set(item, 'content', '');
            item && this.props.onSave && this.props.onSave(item, undefined,tips);
          }
        }
      } else {
        item && this.props.onSave && this.props.onSave(item, undefined);
      }
    } else {
      const {item} = this.props;
      _.set(item, 'content', value);
      if (this.props.timeType && this.props.timeType === 'sccl') {
        item && this.props.onSave && this.props.onSave(item, undefined);
      }else{
        message.error(`日期格式不正确！${tips}`)
        _.set(item, 'content', '');
        item && this.props.onSave && this.props.onSave(item, undefined,tips);
      }
    }
  };


  onBlur = (e) => {
    e.stopPropagation();
    this.onSure();
  };

  onChange = (value) => {
    const valueList = value === '无' ? {} : this.dealListByValue(value, this.state.name);
    this.setState({
      valueList: valueList,
      value: value
    })
  };

  onClickLi = (cs, value) => {
    let _valueList = _.cloneDeep(this.state.valueList);
    _.set(_valueList, cs, value);

    // 排序
    let n = {};
    _.map(data, (o) => {
      if (_valueList[o]) {
        _.set(n, o, _valueList[o]);
      }
    });

    const value1 = _.map(n, (v, k) => v + k);
    const _value = _.join(value1, '');

    this.setState({
      valueList: n,
      value: _value
    })
  };

  dealdate = (cs) => {
    let initYear = new Date().getFullYear();
    const {limitYear} = this.props;
    const list = {
      '年': limitYear ? limitYear : [Number(initYear), Number(initYear) - 100],
      '月': [1, 12],
      '日': [1, this.dealday()],
      '时': [0, 23],
      '分': [0, 59],
      '秒': [0, 59]
    };

    const _list = list[cs];

    let data = [];

    if (cs === '年') {
      for (let i = _list[0]; i >= _list[1]; i--) {
        data.push(
          <div id={i}
               key={i}
               onClick={() => this.onClickLi(cs, i)}
               className={styles.li}
          >
            {i}
          </div>)
      }
    } else {
      for (let i = _list[0]; i <= _list[1]; i++) {
        const value = cs !== '年' && i < 10 ? '0' + i : i;
        data.push(
          <div id={i}
               key={value}
               onClick={() => this.onClickLi(cs, value)}
               className={styles.li}
          >
            {value}
          </div>)
      }
    }
    return data;
  };

  dealday = () => {
    const {valueList} = this.state;
    const year = Number(valueList['年']);
    const mon = Number(valueList['月']);
    const idx = _.indexOf([4, 6, 9, 11], mon);

    if (mon === 2) {
      if (((year % 4) === 0) && ((year % 100) !== 0) || ((year % 400) === 0)) {
        return 29;
      } else {
        return 28;
      }
    } else if (idx > -1) {
      return 30
    } else {
      return 31
    }
  };

  // 根据type处理placeholder提示的时间格式
  dealPlaceholder = () => {
    const {type} = this.props;
    const idx = _.indexOf(_data, type);
    const splitData = '2018年01月01日01时30分59秒';
    const tishi = splitData.split(data[idx]);
    return data[idx] ? '时间格式示例:' + tishi[0] + data[idx] : '时间格式示例:' + tishi[0];
  };

  render() {
    const {show, name} = this.state;
    const placeholder = this.dealPlaceholder();
    // const _suffix = {}

    const tabs = (
        <div style={{display: show ? 'block' : 'none'}}
             className={styles.dateModal}
             onMouseDown={this.onMouseDown}
        >
          <Row className={styles.date}>
            {
              _.map(name, (o, i) => {
                return (
                  <Col key={i} span={4} className={styles.item}>
                    <div className={styles.top}>{o}</div>
                    <div className={styles.bom}>
                      {this.dealdate(o)}
                    </div>
                  </Col>
                )
              })
            }
          </Row>
          <div className={styles.bottom}>
            <Button size={'small'}
                    type={'primary'}
                    className={styles.btn}
                    onClick={() => this.onChange('无')}
            >无</ Button >
            <Button size={'small'}
                    type={'primary'}
                    className={styles.btn}
                    onClick={() => this.onSure()}
            >确定</Button>
          </div>
        </div>
      )
    ;


    return (
      <div className={styles.container}>
        <Input className={styles.input}
               onClick={this.onClick}
               placeholder={placeholder}
               value={this.state.value}
               onBlur={(e) => this.onBlur(e)}
               suffix={<div><Icon type="calendar"/>{this.props.suffix}</div>}
               onChange={(e) => this.onChange(e.target.value)}
        />
        {tabs}
      </div>
    )
  }
}

