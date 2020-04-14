import React, { Component } from 'react';
import _ from 'lodash';
import Chart from './Chart';
import styles from './Chart.less'
const SECONDS_PER_HOUR = 60 * 60;

class BazqChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonC: 1,
      oneName: '',
      num: 0
    };
  }

  currentIndex(index) {
    this.setState({
      buttonC: index
    })
  }
  actction(val) {
    this.setState({
      oneName: val
    })
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //     //不做渲染
  //     return false
  // }
  childMethod() {
    this.setState({
      oneName: ''
    })
  }
  render() {
    const { bascList } = this.props;
    const { buttonC, oneName } = this.state;
    const bascname2 = ['赌博罪', '盗窃罪', '故意伤害罪'];
    const bascname = bascList.ysay ? bascList.ysay : bascname2;
    console.log(bascname)
    // console.log(bascname[0])
    var newName = bascname[0];
    // this.setState({
    //   oneName:bascname?bascname[0]:'赌博罪'
    // })
    const i = '...'
    const bazq =
      <div className={styles.zq}>
        {
          bascname.length > 3 ? 
          bascname.slice(0,3).concat('. . .')
         .map((item) => {
              return <a
              onClick={() => { this.actction(item) }}
              style={{
                fontWeight: oneName === item ? 'bold' : 'normal',
                fontSize: 16, color: oneName === item  ? '#4976F7' : '#CCCCCC'
              }}
            >{item}</a>
          }): 
          bascname.map((item) => {
              return <a
              onClick={() => { this.actction(item) }}
              style={{
                fontWeight: oneName === item ? 'bold' : 'normal',
                fontSize: 16, color: oneName === item  ? '#4976F7' : '#CCCCCC'
              }}
            >{item}</a> 
          })
        }

        {/* <a style={{
          fontWeight: buttonC ? 'bold' : 'normal',
          fontSize: 16, color: buttonC ? '#4976F7' : '#CCCCCC'
        }}
          onClick={() => {
            this.setState({
              buttonC: true,
              buttonD: false,
              buttonE: false,
              buttonF: false
            });
          }}>盗窃罪</a>
        <span style={{ color: 'white' }}>&nbsp;|&nbsp;</span>
        <a style={{
          fontWeight: buttonD ? 'bold' : 'normal',
          fontSize: 16, color: buttonD ? '#4976F7' : '#CCCCCC'
        }}
          onClick={() => {
            this.setState({
              buttonD: true,
              buttonC: false,
              buttonE: false,
              buttonF: false
            });
          }}>故意伤害罪 </a>
        <span style={{ color: 'white' }}>&nbsp;|&nbsp;</span>
        <a style={{
          fotWeight: buttonE ? 'bold' : 'normal',
          fontSize: 16, color: buttonE ? '#4976F7' : '#CCCCCC'
        }}
          onClick={() => {
            this.setState({
              buttonE: true,
              buttonD: false,
              buttonC: false,
              buttonF: false
            });
          }}>危险驾驶罪</a>

        <span style={{ color: 'white' }}>&nbsp;|&nbsp;</span>
        <a style={{
          fotWeight: buttonF ? 'bold' : 'normal',
          fontSize: 16, color: buttonF ? '#4976F7' : '#CCCCCC'
        }}
          onClick={() => {
            this.setState({
              buttonD: false,
              buttonC: false,
              buttonE: false,
              buttonF: true
            });
          }}>交通肇事罪</a> */}

      </div>
    const pjbazqList = {
      onEvents: (e) => {
      },
      option: {
        title: {
          text: '在线办案时长（小时）',
          x: 'left',
          textStyle: {
            color: '#132C73',

          },
        },

        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        xAxis: {

          axisTick: {
            alignWithLabel: true

          },

          // data: bascList ? _.map(
          //   buttonC ? bascList['赌博罪'] :
          //     buttonE ? bascList['危险驾驶罪'] :
          //       buttonD ? bascList['故意伤害罪'] :
          //         buttonF ? bascList['交通肇事罪'] : '',
          //   (d, index) => {
          //     return d.xyrxm;
          //   }) : [],
          data: _.map(
            bascList[this.state.oneName || newName],
            (d, index) => {
              return d.xyrxm;
            }),
        },

        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            textStyle: {
              color: '#999999',
            },
          },
          splitLine: {
            show: true,

            lineStyle: {
              color: '#B1BAD2',
            },
          },
        },

        series: [{
          name: buttonC ? '盗窃罪' : '故意伤害罪',
          data: _.map(bascList[this.state.oneName || newName],
            (d) => (d.basc / SECONDS_PER_HOUR).toFixed(2)),
          // data: _.map(buttonC ? bascList['盗窃罪'] :
          //   buttonE ? bascList['危险驾驶罪'] :
          //     buttonD ? bascList['故意伤害罪'] :
          //       buttonF ? bascList['交通肇事罪'] : '',
          //   (d) => (d.basc / SECONDS_PER_HOUR).toFixed(2)),
          type: 'bar',
          barWidth: '18px',
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: '#6E94FF' // 0% 处的颜色
            }, {
              offset: 1, color: '#5C64FF' // 100% 处的颜色
            }],
            globalCoord: false // 缺省为 false
          }
        },
        ],
      },

    };

    return (
      <div className={styles.body}>
        <div className={styles.bodyleft}></div>
        {bazq}
        <Chart {...pjbazqList} />
      </div>
    );
  }
}

export default BazqChart;
