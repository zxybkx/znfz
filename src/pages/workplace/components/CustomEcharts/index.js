import React, {PureComponent} from 'react';
import echarts from "echarts";
import ReactEcharts from "echarts-for-react";
import _ from 'lodash';

export default class CustomEcharts extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentWillMount(){
    const {type} = this.props;
    if(type == "bar"){
      this.handleOption = this.handleOption4Bar;
    }else if(type == "pie"){
      this.handleOption = this.handleOption4Pie;
    }else if(type == "line"){
      this.handleOption = this.handleOption4Line;
    }
  }

  handleOption4Pie=()=>{
    const {showFlags,option} = this.props;
    const {series:[{data}]} = option;
    if(showFlags && showFlags.length > 0){
      const currentData = [];
      for(let i = 0;i< showFlags.length;i++){
        if(showFlags[i]){
          currentData.push(data[i]);
        }
      }
      option.series[0].data = currentData;
    }
    return option;
  };

  handleOption4Bar=()=>{
    const {showFlags,option} = this.props;
    const {series:defaultSeries} = option;
    if(showFlags && showFlags.length > 0){
      const currentSeries = [];
      for(let i = 0;i< showFlags.length;i++){
        if(showFlags[i]){
          currentSeries.push(defaultSeries[i]);
        }
      }
      option.series = currentSeries;
    }
    return option;
  };

  handleOption4Line=()=>{
    const {showFlags,option} = this.props;
    const {series:defaultSeries} = option;
    if(showFlags && showFlags.length > 0){
      const currentSeries = [];
      for(let i = 0;i< showFlags.length;i++){
        if(showFlags[i]){
          currentSeries.push(defaultSeries[i]);
        }
      }
      option.series = currentSeries;
    }
    return option;
  };

  render() {
    const option = this.handleOption();
    return (
        <ReactEcharts
          style={{ height:'100%'}}
          option={option}
          notMerge={true}
        />
    );
  }
}
