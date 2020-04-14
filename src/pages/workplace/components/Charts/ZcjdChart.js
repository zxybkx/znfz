import React, {Component} from 'react';
import { Divider } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import Chart from './Chart';
import styles from './Chart.less'
import HsModal from './Modal';

class ZcjdChart extends Component {

  constructor(props) {
    super(props);
    this.state = {
      buttonA: true,
      visible: false,
      detailData: [],
    };
  }

  hideModal = () => {
    this.setState({
      visible: false
    })
  };


  render() {
    const {dispatch, ajlb, zcjdList} = this.props;
    const {buttonA, visible, detailData} = this.state;
    const label = {
      normal: {
        color: '#fff',
        position: 'inside',
        show: true,
        formatter: (params)=>{
          if(params.value>0){
            return params.value
          }else {
            return ''
          }
        },
      }
    };

    const zjName = ajlb === 'ZJ' ?
      <span className={styles.zj} style={{fontWeight: 'bold', fontSize: 18, color: 'white'}}></span> :
      <div className={styles.zj}>
       {/* <a
          style={{fontWeight: buttonA ? 'bold' : 'normal', fontSize: 18, color: buttonA ? 'white' : 'grey'}}
          onClick={() => {
            this.setState({
              buttonA: true,
            });
          }}
        >侦查监督</a>
        <span style={{color: 'white'}}>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <a
          style={{fontWeight: !buttonA ? 'bold' : 'normal', fontSize: 18, color: !buttonA ? 'white' : 'grey'}}
          onClick={() => {
            this.setState({
              buttonA: false,
            });
          }}
        >审判监督</a>*/}
      </div>;

    const zcjdListProps = {
      onEvents: (e) => {
        if (e.value > 0) {
          const column = ajlb === 'ZJ' ? 'db_zcjd_' : buttonA ? 'qs_zcjd_' : 'qs_spjd_';
          let detail = '';
          switch (e.seriesName) {
            case '书面纠违':
              detail = 'smjw';
              break;
            case '检察建议':
              detail = 'jcjy';
              break;
            case '书面回复':
              detail = 'smhf';
              break;
            case '抗诉':
              detail = 'ks';
              break;
            case '口头纠违':
              detail = 'ktjz';
              break;
          }
          dispatch({
            type: 'portal/countZcjdDetail',
            payload: {
              date: e.name,
              ajlb: ajlb,
              column: column + detail
            }
          }).then((data) => {
            this.setState({
              visible: true,
              detailData: data,
            })
          });
        }
      },
      option: {
        title: {
          text: '侦查监督',
          x: 'left',
          textStyle: {
            color: '#132C73',
          },
        },
        toolbox: {
         
       },
        grid: {
        left: '3%',
        right: '4%',
        bottom: '4%',
        containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#FFD5C2',
            },
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap : false,
          data: _.map(zcjdList['侦查监督'] && zcjdList['侦查监督']['检察建议'], (d) => {
            const mon = moment(d.month).format("MM月");
            return mon;
          }),
        },
        yAxis: {
          type: 'value',
          minInterval: 1,
          max: function (value) {
            if (value.max < 8) {
              return 8;
            } else {
              return value.max;
            }
          },
          axisLine:{
            show:false
          },
          axisTick:{
            show:false
          },
          axisLabel: {
            textStyle: {
              color: '#999999'
            },
          },
          splitLine: {
            show: true,

            lineStyle: {
              color: '#B1BAD2',
            },
          },
        },
        series: ajlb === 'ZJ' ? 
          [
            {
              name: '书面纠违',
              data: zcjdList['侦查监督'] ? _.map(zcjdList['侦查监督']['书面纠违'], (d) => {
                return d.value;
              }) : [],
              label: label,
              type: 'line',
              areaStyle: {
                color:'#FF9566'
            },
            smooth: true,
              stack: 'one',
              color: ['#FF9566'],
            }, 
            {
            name: '检察建议',
            data: zcjdList['侦查监督'] ? _.map(zcjdList['侦查监督']['检察建议'], (d) => {
              return d.value;
            }) : [],
            label: label,
            areaStyle: {
              color:'#4976F7',
            },
            type: 'line',
            stack: 'one',
            smooth: true,
            color: ['#4976F7'],
          }, {
            name: '口头纠违',
            data: zcjdList['侦查监督'] ? _.map(zcjdList['侦查监督']['口头纠违'], (d) => {
              return d.value;
            }) : [],
            label: label,
            areaStyle: {
              color:'#FF9566',
            },
            type: 'line',
            stack: 'two',
            smooth: true,
            color: ['#f6fb11'],
          },
          ] :
          buttonA ?
            [
              {
                name: '书面纠违',
                data: zcjdList['侦查监督'] ? _.map(zcjdList['侦查监督']['书面纠违'], (d) => {
                  return d.value;
                }) : [],
                label: label,
                areaStyle: {
                  color:'#FF9566',
                },
                type: 'line',
                smooth: true,
                stack: 'one',
                color: ['#FF9566'],
              }, {
              name: '检察建议',
              data: zcjdList['侦查监督'] ? _.map(zcjdList['侦查监督']['检察建议'], (d) => {
                return d.value;
              }) : [],
              label: label,
              areaStyle:{
                color:'#DEE9FF'

              },
              type: 'line',
              smooth: true,
              stack: 'one',
              color: ['#4976F7'],
            }, {
              name: '书面回复',
              data: zcjdList['侦查监督'] ? _.map(zcjdList['侦查监督']['书面回复'], (d) => {
                return d.value;
              }) : [],
              label: label,
              type: 'line',
              smooth: true,
              areaStyle: {
                color:'#FFCE38'
              },
              stack: 'two',
              color: ['#FFCE38'],
            }] :
            [
              {
                name: '书面纠违',
                data: zcjdList['审判监督'] ? _.map(zcjdList['审判监督']['书面纠违'], (d) => {
                  return d.value;
                }) : [],
                label: label,
                type: 'line',
                stack: 'one',
                smooth: true,
                areaStyle: {
                  color:'#FF9566',
                },
                color: ['#FF9566'],
              }, {
              name: '检察建议',
              data: zcjdList['审判监督'] ? _.map(zcjdList['审判监督']['检察建议'], (d) => {
                return d.value;
              }) : [],
              label: label,
              type: 'line',
              smooth: true,
              areaStyle:{
                color:'#DEE9FF'

              },
              stack: 'one',
              color: ['DEE9FF'],
            }, {
              name: '书面回复',
              data: zcjdList['审判监督'] ? _.map(zcjdList['审判监督']['书面回复'], (d) => {
                return d.value;
              }) : [],
              label: label,
              type: 'line',
              smooth: true,
              areaStyle: {
                color:'#FFCE38',
              },
              stack: 'two',
              color: ['#FFCE38'],
            }, {
              name: '抗诉',
              data: zcjdList['审判监督'] ? _.map(zcjdList['审判监督']['抗诉'], (d) => {
                return d.value;
              }) : [],
              label: label,
              type: 'line',
              stack: 'three',
              smooth: true,
              areaStyle: {
                color:'#FFCE38',
              },
              color: ['FFCE38'],
            },
            ],
        legend: {
          data: _.map(ajlb === 'ZJ' || buttonA ? 
          zcjdList['侦查监督'] : zcjdList['审判监督'], (value, key) => {
            return key;
          }),
          align: 'right',
          itemHeight:10,
          itemWidth:10,
          align:'left',
          itemGap:10,
          right: 10,
          radius: ['75%', '75%'],
          icon:'circle',
          textStyle: {
           borderColor:'#E5E5E5',
           backgroundColor:'rgba(255,255,255,1)',
           padding:8,
          },
        },
      },
    };

    const modalList = {
      visible, dispatch, detailData,
      hideModal: this.hideModal,
      ajlb, buttonA
    };

    return (
      <div className={styles.body}>
        <div className={styles.bodyleft}></div>
        <Divider className={styles.zcjddivider}/>
        {zjName}
        <div className={styles.zcjd}>
          <Chart {...zcjdListProps} />
        </div>
        <HsModal {...modalList} />
      </div>
    );
  }
}

export default ZcjdChart;
