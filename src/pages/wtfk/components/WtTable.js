import React, {PureComponent} from 'react';
import {Table} from 'antd';

export default class WtTable extends PureComponent {
  getTableHeight = () => {
    const clientHeight = document.body.clientHeight;
    return clientHeight - 300;
  };

  render() {
    const {columns, pagination, dataSource, onRowClick, onChange, loading} = this.props;

    return (
      <Table
             scroll={{y: this.getTableHeight()}}
             rowKey={() => Math.random()}
             loading={loading}
             bordered={true}
             columns={columns}
             dataSource={dataSource}
             onChange={onChange}
             pagination={pagination}
             onRow={(record) => {
               return {
                 onClick: () => {
                   onRowClick && onRowClick(record)
                 },
               };
             }}
      />
    );
  }
}
