import React, { Component } from 'react';
import { Table } from 'antd';
import { buildEmptyData } from 'utils/utils';
import styles from './index.less';
import { Resizable } from 'react-resizable';

const ResizeableTitle = (props) => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable width={width} height={0} onResize={onResize}>
      <th {...restProps} />
    </Resizable>
  );
};

export default class TJTable extends Component {
   state={
      columns:this.props.columns
   }
  components = {
    header: {
      cell: ResizeableTitle,
    },
  };
  handleResize = index => (e, { size }) => {
    this.setState(({ columns }) => {
      const nextColumns = [...columns];
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
      };
      return { columns: nextColumns };
    });
  };
  render() {
    const columns = this.state.columns.map((col, index) => ({
      ...col,
      onHeaderCell: column => ({
        width: column.width,
        onResize: this.handleResize(index),
      }),
    }));
    const { list,scroll, pagination, loading, onChange, title, footer, width } = this.props;
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
              components={this.components}
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
                components={this.components}
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
                components={this.components}
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
