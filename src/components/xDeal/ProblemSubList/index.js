import React, {PureComponent} from 'react';
import {Table, Icon, Tooltip} from 'antd';
import _ from 'lodash';
import Window from 'lib/Window';
import styles from './index.less';
import DealForm from 'components/xDeal/DealForm';
import Ellipsis from 'lib/Ellipsis';
import {StatusTab} from '../Tabs';

export default class ProblemSubList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      noteVisible: false,
      problem: {},
      list: props.data,
      key: '全部',
      current: props.data,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.data, this.props.data)) {
      this.setState({
        list: nextProps.data,
        current: nextProps.data,
      },()=>{
        this.onStatusClick(this.state.key);
      });
    }
  }

  getColumns = () => {
    const columns = [
      {
        title: '',
        dataIndex: 'znfz_icon',
        key: 'znfz_icon',
        width: '58px',
        render: (text) => {
          return (
            <Tooltip title={text.name}>
              <Icon type={text.icon}
                    style={{fontWeight: 'blod', color: text.color, fontSize: 18, marginLeft: 5}}/>
            </Tooltip>
          )
        },
      }, {
        title: '规则',
        dataIndex: 'gzmc',
        key: 'gzmc',
        width: '24%',
        render: (text) => {
          return (
            <Ellipsis style={{display: 'inline', width: 'auto'}} length={14} tooltip>{text}</Ellipsis>
          )
        },
      }, {
        title: '类别',
        dataIndex: 'yjfl',
        key: 'yjfl',
        width: '58px'
      }, {
        title: '问题描述',
        dataIndex: 'wtms',
        key: 'wtms',
        render: (text) => {
          return (
            <Ellipsis style={{display: 'inline', width: 'auto'}} length={14} tooltip>{text}</Ellipsis>
          )
        },
      }, {
        title: '时间',
        dataIndex: 'zhxgsj',
        key: 'zhxgsj',
        width: '20%',
        render: (text) => {
          return (
            <span>{text.split('T')[0]}</span>
          )
        },
      }];

    return columns;
  };

  getStatusSet = (list) => {
    let _dqztSet = list&&list.map(d => ({title: d.dqzt, iconConfig: d.znfz_icon}));
    _dqztSet = _.uniqBy(_dqztSet, 'title');
    _dqztSet = _dqztSet.map(zt => {
      zt.count = list&&list.filter(d => d.dqzt === zt.title).length;
      return zt;
    });
    _dqztSet = _.sortBy(_dqztSet, d => d.iconConfig.orderby);
    return _dqztSet;
  };

  onStatusClick = (key) => {
    const {list} = this.state;
    this.setState({
      key: key,
      current: key === '全部' ? list : _.filter(list, d => d.dqzt === key)
    });
  };

  getTableHeight = () => {
    const clientHeight = document.body.clientHeight;
    return clientHeight - 220;
  };

  reload = () => {
    const {reload} = this.props;
    reload();
    this.setState({noteVisible: false})
  };

  render() {
    const {dispatch, stage, ajxx} = this.props;
    const {list, current, noteVisible, problem} = this.state;

    const statusList = this.getStatusSet(list);

    const _current = _.sortBy(current, d => d.znfz_icon.orderby);

    return (
      <div className={styles.default}>
        <StatusTab showTotal data={statusList} style={{textAlign: 'right'}} onClick={this.onStatusClick} theme='light'/>
        <Table dataSource={_current}
               columns={this.getColumns()}
               size='small'
               pagination={false}
               rowKey={() => Math.random()}
               rowClassName={styles.row}
               scroll={{x: false, y: this.getTableHeight()}}
               onRow={(record) => {
                 return {
                   onClick: () => {
                     this.setState({noteVisible: true, problem: record})
                   },
                 };
               }}
        />
        <Window width={600}
                height={450}
                x={400}
                y={100}
                onClose={() => this.setState({noteVisible: false})}
                visible={noteVisible}
                title={<Ellipsis style={{display: 'inline', width: 'auto'}} length={20}
                                 tooltip>{problem && problem.wtms}</Ellipsis>}
                icon="edit">
          <DealForm dispatch={dispatch} ajxx={ajxx} stage={stage} problem={problem} reload={this.reload}/>
        </Window>
      </div>
    );
  }
}
