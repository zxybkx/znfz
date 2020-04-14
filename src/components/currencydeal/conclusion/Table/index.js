import React, { Component } from 'react';
import { Table } from 'antd';
import { buildEmptyData } from 'utils/utils';
import styles from './index.less';

export default class TJTable extends Component {

  render() {
    const { list, columns, scroll, pagination, loading, onChange, title, footer, width } = this.props;
    // const _list = list.concat(buildEmptyData(columns, 4 - list.length));
    const _scroll = scroll ? scroll : {};
    const _pagination = pagination ?
      {
        ...pagination,
        showSizeChanger: true,
        showTotal: () => `共 ${pagination.total} 个`,
        size: "normal",
      } : false;
    const _onChange = onChange ? onChange : ()=>{};
    return (
      <div className={styles.Home}>
        {
          title && footer ?
            <Table
              title={()=>title}
              style={{width: '100%'}}
              rowKey={record => record.id || record.key || Math.random()}
              rowClassName={styles.osh}
              bordered
              scroll={_scroll}
              pagination={_pagination}
              columns={columns}
              dataSource={list}
              loading={loading}
              onChange={_onChange}
              footer={footer}
            /> :
            title ?
              <Table
                title={()=>title}
                style={{width: '100%'}}
                rowKey={record => record.id || record.key || Math.random()}
                rowClassName={styles.osh}
                bordered
                scroll={_scroll}
                pagination={_pagination}
                columns={columns}
                dataSource={list}
                loading={loading}
                onChange={_onChange}
              /> :
              <Table
                style={{width: '100%'}}
                rowKey={record => record.id || record.key || Math.random()}
                rowClassName={styles.osh}
                bordered
                scroll={_scroll}
                pagination={_pagination}
                columns={columns}
                dataSource={list}
                loading={loading}
                onChange={_onChange}
              />
        }
      </div>
    );
  }
}
