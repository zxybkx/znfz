import React, {PureComponent} from 'react';
import {Modal, Button, Icon, Tooltip} from 'antd';
import _ from 'lodash';
import ReactTable from 'react-table';
import { ReactTableDefaults } from "react-table";
import "react-table/react-table.css";
import Detail from './Detail';
import styles from './FileGrid.less';

Object.assign(ReactTableDefaults, {
  previousText: '上一页',
  nextText: '下一页',
  loadingText: '加载中...',
  noDataText: '暂无数据',
  pageText: '',
  ofText: '/',
});

export default class FileGrid extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      currentIndex: 0,
    }
  }

  onClick = (index) => {
    this.setState({visible: true, currentIndex: index});
  };

  hideModelHandler = () => {
    this.setState({visible: false}, ()=> {
      this.props.onClose && this.props.onClose();
    });
  };

  getGridColumns = (list) => {
    const {data} = this.props;
    const columns = [{
      Header: props => {
        return (
          <div className={styles.biaotou}>
            <div className={styles.row}>审查要素</div>
            <div className={styles.col}>涉及文书</div>
          </div>
        )
      },
      headerStyle: {
        padding: 0
      },
      accessor: 'title',
      width: 200,
      resizable: false,
      Cell: ({value,original,index}) => {
        const exist = _.get(original,'文书存在') === '是';
        return (
          <Tooltip placement='right' title={exist ? value : `${value}(文书不存在)`} tooltip>
            <a onClick={() => exist ? this.onClick(index) : null} style={{color: exist ? '#1890ff' : 'red'}}>{exist ? value : `${value}(文书不存在)`}</a>
          </Tooltip>
        );
      },
    }];

    let otherColumns = [];
    if(!_.isEmpty(list)){
      _.map(list, file => {
        if(file && file.contents){
          _.map(file.contents, obj => {
            if(obj.fieldname) {
              if (obj.fieldname !== '文书存在') {
                otherColumns.push(obj.fieldname);
              }
            }else{
              const mergekey = data.mergekey;
              _.forEach(obj, v => {
                _.forEach(v, item => {
                  const person = _.find(item, (p, k) => k.indexOf(mergekey) >= 0);
                  _.forEach(person, (p, idx)=> {
                    if(p.fieldname){
                      otherColumns.push(p.fieldname);
                    }else{
                      _.forEach(p, (arr, key) => {
                        otherColumns.push(key);
                      })
                    }
                  })
                })
              });
            }
          });
        }
      });
    }

    otherColumns = _.uniq(otherColumns);
    _.forEach(otherColumns, c => {
      columns.push({
        Header: props => c,
        headerStyle: {
          backgroundColor: '#e6f7ff',
          color: '#444',
          borderRight: '1px solid #e8e8e8',
          fontWeight: 'bold',
        },
        accessor: c,
        width: 240,
        Cell: ({value,original}) => {
          const has = _.has(original,c);
          if(has) {
            if(value && value.length > 0) {
              return (
                <span>{value}</span>
              )
            }else {
              return <span style={{color: 'red'}}>未提取到</span>
            }
          }else {
            return <span>—</span>
          }
        },
      })
    });

    return columns;
  };

  getGridData = (list) => {
    const data = [];
    _.map(list, file => {
      const row = {};
      _.set(row, 'title', file.title);
      _.map(file.contents,(item)=>{
        if(item.fieldvalue && Array.isArray(item.fieldvalue)) {
          const content = item.fieldvalue.length > 0 ? '有' : '无';
          _.set(row, item.fieldname, content);
        }else {
          _.set(row, item.fieldname, item.fieldvalue);
        }
      });
      data.push(row);
    });
    return data;
  };

  render() {
    const {data, title} = this.props;
    const {visible, currentIndex} = this.state;

    const list = data.jsondata ? (data.jsondata.data || []) : [];

    const columns = this.getGridColumns(list);
    const tableData = this.getGridData(list);

    return (
      <div className={styles.default}>
        <ReactTable
          data={tableData}
          columns={columns}
          sortable={false}
          showPagination={false}
          page={0}
          pageSize={tableData.length}
          style={{width: (columns.length - 1) * 240 + 202,maxWidth: '100%',height: tableData.length > 0 ? tableData.length * 38 + 40 : '200px',maxHeight: '400px' }}
        />
        <Modal width='calc(100vw - 20px)'
               className={styles.modal}
               title={
                 <span>
                   <span><Icon type='form' /> 文书及关联审查项处理-{title}</span>
                   <Button className="modal-close"
                           icon="close"
                           onClick={this.hideModelHandler}
                           type='ghost'>关闭</Button>
                 </span>
               }
               visible={visible}
               maskClosable={false}
               closable={false}
               onCancel={this.hideModelHandler}
               footer={null}>
          <Detail {...this.props} currentIndex={currentIndex}/>
        </Modal>
      </div>
    );
  }
}
