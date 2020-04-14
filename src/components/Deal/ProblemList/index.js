import React from 'react';
import {Table, Tooltip} from 'antd';
import Fontawesome from 'react-fontawesome';
import DealModal from '../DealModal';
import moment from 'moment';

const getTableHeight = (fullScreen) => {
  const clientHeight = document.body.clientHeight;
  return clientHeight - (fullScreen ? 200 : 250);
};

export default ({ajxx, stage, dispatch, loading, list, docTree, fullScreen, refresh}) => {

  const dealModalProps = {
    ajxx, stage, dispatch, docTree, refresh
  };

  list = list && list.map((d, idx) => {
    d.no = idx + 1;
    return d;
  });

  const dataListProps = {
    option: {
      loading,
      dataSource: list,
      onChange: (page, filters, sorter) => {

      },
      columns: [{
        width: '5%',
        title: '序号',
        dataIndex: 'no',
        key: 'no',
      }, {
        width: '5%',
        title: '状态',
        dataIndex: 'dqzt',
        key: 'dqzt',
        render: (text, record) => {
          if ((record.dqzt === '已处理' || record.dqzt === '确认合法') && record.yszt) {
            return (
              <Tooltip title={record.yszt + '→' + record.dqzt}>
                <Fontawesome name={record.znfz_icon.icon} style={{color: record.znfz_icon.color}}/>
              </Tooltip>
            );
          } else if ((record.dqzt === '确认非法') && record.yszt) {
            if ((record.yjfl && (record.yjfl === '程序'))) {
              return (
                <Tooltip title={record.yszt + '→' + record.dqzt}>
                  <Fontawesome name={record.znfz_icon.icon} style={{color: record.znfz_icon.color}}/>
                </Tooltip>
              );
            } else {
              return (
                <Tooltip title={record.yszt + '→ 确认非法或特殊情节'}>
                  <Fontawesome name={record.znfz_icon.icon} style={{color: record.znfz_icon.color}}/>
                </Tooltip>
              );
            }
          } else {
            return (
              <Tooltip
                title={record.dqzt}>
                <Fontawesome name={record.znfz_icon.icon} style={{color: record.znfz_icon.color}}/>
              </Tooltip>
            )
          }
        },
      },
        {title: '审查项', dataIndex: 'gzmc', key: 'gzmc', width: '20%'},
        {
          title: '问题描述',
          dataIndex: 'wtms',
          key: 'wtms',
          render: (text, record) => {
            return (
              <DealModal problem={record} {...dealModalProps}>
                <a style={{color: '#108ee9'}}>
                  <div dangerouslySetInnerHTML={{__html: record.wtms}}></div>
                </a>
              </DealModal>
            );
          },
        }, {
          title: '修改时间',
          dataIndex: 'zhxgsj',
          key: 'zhxgsj',
          width: '12%',
          render: (text, record) => moment(record.zhxgsj).format('YYYY/MM/DD HH:mm'),
        }, {
          width: '5%',
          title: '  ',
          key: 'operation',
          render: (text, record) => {
            return (
              <DealModal problem={record} {...dealModalProps}>
                <a style={{color: '#108ee9'}}>处理</a>
              </DealModal>
            );
          },
        }],
    },
    tableOption: {
      expandedRowRender: problem => {
        const jsonData = problem.jsondata;
        let records = [];
        if (jsonData && jsonData.data) {
          jsonData.data.map(d => {
            d.id = Math.random();
            records.push(d);
          });
        }

        return (
          <dl>
            {
              records && records.map((r, idx) => {
                return [
                  <dt key={`dt-${idx}`}>{r.title}</dt>,
                  <dd key={`dd-${idx}`}>
                    <ul key={`ul-${idx}`}>
                      {
                        r.contents && r.contents.map((c, index) => <li
                          key={index}>{c.fieldname}: {c.fieldvalue}</li>)
                      }
                    </ul>
                  </dd>,
                ]

              })
            }
          </dl>
        );
      },
    },
  };

  return (
    <Table scroll={{y: getTableHeight(fullScreen)}}
           size="middle"
           bordered={true}
           pagination={false}
           rowKey={record => record.id}
           {...dataListProps.option}
           {...dataListProps.tableOption}
    />
  );
}

