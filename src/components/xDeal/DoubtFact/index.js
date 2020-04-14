import React, {PureComponent} from 'react';
import {Tooltip} from 'antd';
import classnames from 'classnames';
import Ellipsis from 'lib/Ellipsis';
import _ from 'lodash';
import FactDetailModal from "../Fact/FactDetailModal";
import styles from './index.less';
import TJTable from "../Fact/Table";

class DoubtFact extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      currentRecord: {}
    }
  }

  comparisionFunction = (catalog) => {
    const sourceArr = ["诉讼程序文书", "物证", "书证", "证人证言、被害人陈述", "犯罪嫌疑人供述和辩解", "鉴定意见", "勘验、检查、辨认、侦查实验等笔录", "视听资料、电子数据", "其他"];
    return sourceArr.indexOf(catalog)
  };

  handleClick = (record) => {
    this.setState({
      visible: true,
      currentRecord: record
    });
  };

  renderColumn = () => {
    const columns = [
      {
        title: '证据名称',
        dataIndex: 'label',
        key: 'label',
        render: (text, record) => {
          return (
            <a onClick={() => this.handleClick(record)}>{text}</a>
          )
        }
      }, {
        title: '分析',
        dataIndex: 'fx',
        key: 'fx',
        render: (text, record) => {
          return <Ellipsis tooltip
                           lines={4}>&emsp;&emsp;{record.bqnr && record.bqnr.analysis ? record.bqnr.analysis : ''}</Ellipsis>
        }
      }
    ];
    return columns;
  };

  handleCancel = () => {
    this.props.reload();
    this.setState({
      visible: false
    })
  };

  render() {
    const {currentFact, factMaterials, dispatch, match, ajxx, znfz, facts, stage, ysay, getFacts} = this.props;
    const {params: {id}} = match;
    const {currentRecord, visible} = this.state;
    // 筛选出当前事实关联的证据文书
    const newBalZj = _.filter(factMaterials, item => {
      if (!_.isEmpty(currentFact)) {
        if (item.bqnr && _.indexOf(item.bqnr.attribute, currentFact.id) > -1) {
          return true
        }
      }
    });
    newBalZj.sort((item1, item2) => this.comparisionFunction(item1.bqnr.category) - this.comparisionFunction(item2.bqnr.category));
    const bdlNewData = newBalZj && newBalZj.length > 0 ? newBalZj.map((item, index) => {
      return ({
        title: item.label,
        type: item.label,
        filekey: item.tplj,
        catalog: item.bqnr.category
      })
    }) : [];

    const column = this.renderColumn();

    const FactBdlNewDetailProps = {
      data: {
        jsondata: {
          data: bdlNewData
        }
      },
      dispatch, match, ajxx, znfz, ysay, loading: false, visible, record: currentRecord,
      id, facts, stage, onClose: this.handleCancel, getFacts, newBalZj
    };

    return (
      <div style={{marginTop: 20}}>
        <TJTable columns={column}
                 list={newBalZj}
                 scroll={{x: (column.length - 2) * 320 + 500}}
        />
        <FactDetailModal {...FactBdlNewDetailProps}/>
      </div>
    )
  }
}

export default DoubtFact;
