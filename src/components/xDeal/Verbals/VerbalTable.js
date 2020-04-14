import React, {PureComponent} from 'react';
import {Table, Tooltip} from 'antd';
import _ from 'lodash';
import {aqjxColumns} from './config';
import styles from './VerbalTable.less';
import Ellipsis from 'lib/Ellipsis';

export default class VerbalTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      current: '11',
    }
  }

  getColumns = () => {
    //todo aqjx should config by ysay
    const columns = [{
      title: '事实要素',
      dataIndex: 'mergekey',
      key: 'mergekey',
      width: 100,
      render: (value, row, index) => {
        const obj = {
          children: <Tooltip title={row.rdss}>{value}</Tooltip>,
          props: {
            rowSpan: row.rowspan
          },
        };
        return obj;
      },
    }, {
      title: '次数',
      dataIndex: '次数',
      key: '次数',
      width: 50,
    }, {
      title: '摘录',
      dataIndex: '摘录',
      key: '摘录',
      width: 200,
      render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={30} tooltip>{text}</Ellipsis>
    }, {
      title: '案情解析',
      dataIndex: '案情解析',
      key: '案情解析',
      children: [
        {
          title: '时间',
          dataIndex: '时间',
          key: '时间',
          width: 120,
          render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={30} tooltip>{text.content}</Ellipsis>
        }, {
          title: '地点',
          dataIndex: '地点',
          key: '地点',
          width: 120,
          render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={30} tooltip>{text.content}</Ellipsis>
        }, {
          title: '被害人',
          dataIndex: '被害人',
          key: '被害人',
          width: 120,
          render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={30} tooltip>{text.content}</Ellipsis>
        }, {
          title: '参与人',
          dataIndex: '参与人',
          key: '参与人',
          width: 120,
          render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={30} tooltip>{text.content}</Ellipsis>
        }, {
          title: '盗窃手段',
          dataIndex: '盗窃手段',
          key: '盗窃手段',
          width: 120,
          render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={30} tooltip>{text.content}</Ellipsis>
        }, {
          title: '盗窃类型',
          dataIndex: '盗窃类型',
          key: '盗窃类型',
          width: 120,
          render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={30} tooltip>{text.content}</Ellipsis>
        }, {
          title: '财物',
          dataIndex: '财物',
          key: '财物',
          width: 120,
          render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={20} tooltip>{text.content}</Ellipsis>
        }, {
          title: '价值',
          dataIndex: '价值',
          key: '价值',
          width: 120,
          render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={20} tooltip>{text.content}</Ellipsis>
        }, {
          title: '分工作用',
          dataIndex: '分工作用',
          key: '分工作用',
          width: 120,
          render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={20} tooltip>{text.content}</Ellipsis>
        }, {
          title: '分赃及去向',
          dataIndex: '分赃及去向',
          key: '分赃及去向',
          width: 120,
          render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={20} tooltip>{text.content}</Ellipsis>
        },
      ],
    },{
      title: '事实要素',
      dataIndex: 'mergekey2',
      key: 'mergekey2',
      width: 100,
      render: (value, row, index) => {
        const obj = {
          children: <Tooltip title={row.rdss}>{value}</Tooltip>,
          props: {
            rowSpan: row.rowspan
          },
        };
        return obj;
      },
    }];

    return columns;
  };

  getOwnerFacts = () => {
    const {data, owner} = this.props;
    let _facts = _.cloneDeep(data);
    let ownerFacts = _.filter(_facts, d => _.filter(d.owners, o => o.owner === owner).length > 0);
    _.map(ownerFacts, o => o.hasGS = true);
    // _facts = _.orderBy(_facts, v => _.toNumber(v.mergekey.replace(/[^0-9]/ig, '')));
    return _facts;
  };

  getNormalData = () => {
    let normalData = [];
    const {ysay, type} = this.props;
    const aqjx = _.get(aqjxColumns, ysay);
    const {data, owner} = this.props;
    let facts = _.cloneDeep(data);
    let ownerFacts = _.filter(facts, d => _.filter(d.owners, o => o.owner === owner).length > 0);
    _.map(ownerFacts, o => o.hasGS = true);


    _.forEach(facts, fact => {
      if (!fact.hasGS) {
        _.map(aqjx, v => _.set(fact, v, `-`));
        _.set(fact, '摘录', `无${type}`);
        _.set(fact, '次数', ``);
        _.set(fact, 'rowspan', 1);
        _.set(fact, 'mergekey2', _.get(fact, 'mergekey'));
        normalData.push(fact);
      }
    });


    _.map(ownerFacts, fact=> {
      const currentOwner = _.find(fact.owners, o => o.owner === owner);
      let yczjs = _.orderBy(currentOwner.yczjs, v => _.toNumber(v.cs.replace(/[^0-9]/ig, '')));
      _.map(yczjs, (v, idx) => {
        const _newFact = _.omit(_.clone(fact), ['yczjs','aqjxdata', 'nlpdata', 'owners']);
        _.map(aqjx, k => _.set(_newFact, k, _.get(v.aqjxdata, k)));
        _.set(_newFact, '摘录', v.gszy);
        _.set(_newFact, '次数', v.cs.replace(/[^0-9]/ig, ''));
        _.set(_newFact, 'rowspan', idx === 0 ? yczjs.length : 0);
        _.set(_newFact, 'mergekey2', _.get(fact, 'mergekey'));
        normalData.push(_newFact);
      })
    });

    normalData = _.orderBy(normalData, v => v.mergekey);

    return normalData;
  };

  getTableHeight = () => {
    const clientHeight = document.body.clientHeight;
    return clientHeight - 240;
  };

  render() {
    console.log('data',this.getNormalData());
    return (
      <div className={styles.default}>
        <Table rowkey={() => Math.random()}
               columns={this.getColumns()}
               bordered={true}
               pagination={false}
               dataSource={this.getNormalData()}
               scroll={{x:1680, y: this.getTableHeight()}}/>
      </div>
    )
  }
}


