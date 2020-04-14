/**
 * 非公用文书多条配置的Table*/

import React, {Component} from 'react';
import {Table} from 'antd';

export default class TableData extends Component {

  TableFooter = () => {
    const {info} = this.props;
    return (
      <p style={{color: 'red'}}>{info}</p>
    )
  };

  /***
   * table第一列点击回调
   */
  render() {
    const {selectData, info} = this.props;

    const columns = [{
      title: <p style={{fontWeight: 'bold'}}>流程节点名称</p>,
      dataIndex: 'lcjdmc',
      key: 'lcjdmc',
      align: 'center'
    }, {
      title: <p style={{fontWeight: 'bold'}}>文书模板名称</p>,
      dataIndex: 'wsmbmc',
      key: 'wsmbmc',
      align: 'center'
    }];

    const TableList = {
      dataSource: selectData,
      columns,
    };

    const rowSelection = {
      onChange: (selectRowKey, selectRows) => {
        this.props.onClick(selectRows[0]);
      },
      type: 'radio',
    };

    return (
      <div>
        <Table{...TableList}
              rowSelection={rowSelection}
              footer={info && this.TableFooter}
              pagination={false}
              bordered
        />
      </div>
    )
  }
}
