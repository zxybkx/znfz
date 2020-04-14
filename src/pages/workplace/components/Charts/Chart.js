import React from 'react';
import echarts from "echarts";
import ReactEcharts from "echarts-for-react";
echarts.registerTheme('chart_theme', {
  backgroundColor: 'transparent',
});

export default class Chart extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    const EventsDict = {
      'click': (e) => {this.props.onEvents(e)},
    };
    return (
      <ReactEcharts
        style={{
          width: '100%',
          height:'100%'
        }}
        option={this.props.option}
        notMerge={true}
        lazyUpdate={true}
        theme={"chart_theme"}
        onChartReady={() => {
        }}
         onEvents={EventsDict}
      />
    )
  }
}
