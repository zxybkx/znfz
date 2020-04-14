import React, { PureComponent } from 'react';
import { Table } from 'antd';
import style from './index.less';

export default class LoopDisplayTable extends PureComponent {

  constructor(props) {
    super(props);
    this.state={
      startIndex:0,
      showData:[],
    };
  }

  componentDidMount() {
    this.setState({
      showData:this.props.data,
    });
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.pageSize != 0){
      if(nextProps.data === this.props.data && this.timer){
        return;
      }
      if(nextProps.data !== this.props.data ){
        this.timer && clearInterval(this.timer);
      }
      let {startIndex} = this.state;
      const {pageSize,data} = nextProps;
      if(data && data.length > pageSize){
        this.timer = setInterval(
          () => {
            const showData = [];
            for(let i = 0;i<pageSize;i++){
              showData.push(data[(startIndex + i + pageSize)%data.length]);
            }
            startIndex = (startIndex + pageSize)%data.length;
            this.setState({
              startIndex:startIndex,
              showData:showData,
            });
          },
          5000
        );
      }
      this.setState({
        showData:data,
      });
    }else{
      const {data} = nextProps;
      this.setState({
        showData:data,
      });
    }
  }

  componentWillUnmount() {
    this.timer && clearInterval(this.timer);
  }

  render() {

    const pagination = {
      pageSize: this.props.pageSize,
      simple:true,
      size:"small",
      position: 'none',
    };

    return(
      <Table pagination={pagination}
             rowKey={this.props.rowKey}
             columns={this.props.columns}
             size="small"
             className={style.table}
             dataSource={this.state.showData}
             loading={this.props.loading}
             onChange={(page, filters, sorter) => {
             }}/>
    );
  }
}
