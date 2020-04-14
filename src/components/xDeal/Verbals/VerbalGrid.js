import React, {PureComponent, Component} from 'react';
import {Select, Table, Input} from 'antd';
import classnames from 'classnames';
import _ from 'lodash';
import Ellipsis from 'lib/Ellipsis';
import styles from './VerbalGrid.less';

const {Option} = Select;
const {TextArea} = Input;

const notMdd = [
  '供述摘录',
];

class Mdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: '11',
    }
  }

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props.data, nextProps.data);
  }

  saveYczj = (data) => {
    const {dispatch} = this.props;
    data.dqzt = 1;
    dispatch({
      type: 'znfz/updateYczj',
      payload: {
        data: data,
      },
    });
  };

  onChange = (v, data) => {
    data.mdddata = v;
    this.saveYczj(data);
  };

  render() {
    const {data = {}, size = 'normal'} = this.props;

    return (
      <Select mode='multiple' defaultValue={data.mdddata || []}
              placeholder='请选择矛盾点'
              style={{width: '100%'}} onChange={v => this.onChange(v, data)}>
        {
          _.map(_.omit(data.aqjxdata, notMdd), (v, k) => <Option key={k} value={k}>{k}</Option>)
        }
      </Select>
    );

  }
}

export default class VerbalGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: '11',
    }
  }


  // shouldComponentUpdate(nextProps){
  //   return this.props.owner!==nextProps.owner;
  // }

  saveFactOwner = (currentOwner) => {
    const {dispatch} = this.props;
    currentOwner.dqzt = 1;
    dispatch({
      type: 'znfz/updateFactOwner',
      payload: {
        data: currentOwner,
      },
    });
  };

  onChange = (v, data) => {
    if (data) {
      data.yjjl = v;
      this.saveFactOwner(data);
    }
  };

  /**
   * 表格数据渲染
   * @param value string / znfz_fact_owner
   * @param row
   * @param index
   * @returns {string}
   */
  dataRender = (value, row, index) => {
    const {dispatch, type} = this.props;
    if (row.rowSpan === 0) {
      return _.isEmpty(value) ? `无${type}` : <Mdd key={index} dispatch={dispatch} data={value} size='small'/>;
    } else {
      return _.isEmpty(value) ? '无' :
        <Ellipsis style={{display: 'inline', width: 'auto'}} length={30} tooltip>{value}</Ellipsis>;
    }
  };

  getGridColumns = (verbals) => {
    const {dispatch} = this.props;
    const columns = [{
      title: (
        <div className={styles.lbiaotou}>
          <div className={styles.row}>事实</div>
          <div className={styles.col}>供述</div>
        </div>
      ),
      dataIndex: 'mergekey',
      key: 'mergekey',
      width: 100,
      render: (value, row, index) => {
        const obj = {
          children: value,
          props: {
            rowSpan: row.rowSpan,
          },
        };
        return obj;
      },
    }];
    const otherColumns = _.map(verbals, (v, k) => {
      return {
        title: k,
        dataIndex: k,
        key: k,
        render: this.dataRender,
        width: 200,
      };
    });

    columns.push(...otherColumns);

    columns.push({
      title: '阅卷结论',
      dataIndex: '阅卷结论',
      key: '阅卷结论',
      render: (value, row, index) => {
        const {type} = this.props;
        const obj = {
          children: _.isEmpty(value) ? null : (
            <div>
              <Select defaultValue={_.isEmpty(value.yjjl) ? undefined : value.yjjl}
                      style={{width: '100%'}}
                      placeholder='请选择阅卷结论'
                      onChange={ v => this.onChange(v, value)}>
                <Option value="无供述">无供述</Option>
                {type === '犯罪嫌疑人供述' ? <Option value="供述稳定">供述稳定</Option> : ''}
                {type === '证人证言' ? <Option value="证言稳定">证言稳定</Option> : ''}
                {type === '被害人陈述' ? <Option value="陈述稳定">陈述稳定</Option> : ''}
                {type === '其他言辞证据' ? <Option value="证言稳定">证言稳定</Option> : ''}
                <Option value="有反复，但基本稳定">有反复，但基本稳定</Option>
                <Option value="有矛盾">有矛盾</Option>
              </Select>
            </div>

          ),
          props: {
            rowSpan: row.rowSpan,
          },
        };
        return obj;
      },
    });

    columns.push({
      title: (
        <div className={styles.rbiaotou}>
          <div className={styles.row}>事实</div>
          <div className={styles.col}>供述</div>
        </div>
      ),
      dataIndex: 'mergekey1',
      key: 'mergekey1',
      width: 100,
      render: (value, row, index) => {
        const obj = {
          children: value,
          props: {
            rowSpan: row.rowSpan,
          },
        };
        return obj;
      },
    });

    return columns;
  };

  getGridData = (facts, verbals, owner) => {
    const data = [];
    _.map(facts, fact => {
      const row1 = {
        mergekey: fact.mergekey,
        mergekey1: fact.mergekey,
        rowSpan: 2,
      };
      const row2 = {
        mergekey: fact.mergekey,
        mergekey1: fact.mergekey,
        rowSpan: 0,
      };

      let currentOwner = _.find(fact.owners, o => o.owner === owner);
      let yczjs = currentOwner && currentOwner.id ? currentOwner.yczjs : [];
      _.forEach(verbals, (v, k) => {
        let yczj = _.find(yczjs, v => v.cs === k);
        _.set(row1, k, yczj ? (yczj.gszy || '') : '');
        _.set(row2, k, yczj ? yczj : {});
      });

      _.set(row1, '阅卷结论', !_.isEmpty(yczjs) ? currentOwner : {});

      data.push(row1);
      data.push(row2);
    });

    return data;
  };

  getTableHeight = () => {
    const clientHeight = document.body.clientHeight;
    return clientHeight - 240;
  };

  render() {
    const {verbals, facts, owner, type} = this.props;
    let _verbals = _.get(verbals, `${type}.${owner}`);
    const _facts = _.orderBy(facts, v => _.toNumber(v.mergekey.replace(/[^0-9]/ig, '')));
    const scrollX = _verbals ? _.size(_verbals) * 200 + 400 : '130%';
    return (
      <div className={styles.default}>
        <Table rowKey={() => Math.random()}
               bordered={true}
               pagination={false}
               columns={this.getGridColumns(_verbals)}
               dataSource={this.getGridData(_facts, _verbals, owner)}
               scroll={{x: scrollX, y: this.getTableHeight()}}/>
      </div>
    );
  }
}

