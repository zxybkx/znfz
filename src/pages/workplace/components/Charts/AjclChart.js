import React, { Component } from 'react';
import { Divider } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import Chart from './Chart';
import styles from './Chart.less';
import ajclImg from '../../../../assets/workPlace/ajcl.png';
import HsModal from './Modal';

class AjclChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
    const { dispatch, ajlb, ajclList } = this.props;
    const { visible, detailData } = this.state;

    const ajclListProps = {
      onEvents: (e) => {
        if (e.value > 0) {
          const myDate = new Date();
          // const endDate = moment(myDate).format('YYYY-MM-DD');
          let column = '';
          switch (e.name) {
            case '相对不诉':
              column = 'xdbs';
              break;
            case '存疑不诉':
              column = 'cybs';
              break;
            case '绝对不诉':
              column = 'jdbs';
              break;
            case '不构罪不捕':
              column = 'bgz';
              break;
            case '事实不清证据不足不捕':
              column = 'cybb';
              break;
            case '无逮捕必要不捕':
              column = 'wdbby';
              break;
          }
          dispatch({
            type: 'portal/countAjclDetail',
            payload: {
             startDate: this.startDate,
        endDate: this.endDate,
              ajlb: ajlb,
              column: column
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
          text: '案件处理',
          x: 'left',
          textStyle: {
            color: '#132C73',
          },
        },
        color: ['#2768B9', '#DD541E'],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        // legend: {
        //   //orient: 'vertical',
        //   left: 'right',
        //   data: ajclList ? _.map(ajclList['饼图'], (d) => {
        //     return d.name;
        //   }) : [],
        // },
        // series: [
        //   {
        //     name: ajlb === 'ZJ' ? '不捕情形占比':'不诉情形占比',
        //     type: 'pie',
        //     radius: ['0', '55%'],
        //     center : ['25%', '50%'],
        //     roseType : 'radius',
        //     data: ajclList ? _.map(ajclList['饼图'], (d) => {
        //       _.assignIn(d, {
        //         label: {show: d.value ? true : false,normal: {show: true},formatter: '{c}件\n{d}%'},
        //         labelLine: {normal: {show: true}, emphasis: {show: true}},
        //       });
        //       return d;
        //     }) : [],
        //   },
        // ],
        series: [
          {
            name: ajclList && ajclList['占比'] ? '逮捕情形占比' : '诉求情形占比',
            type: 'pie',
            radius: ['0', '55%'],
            center: ['30%', '50%'],
            roseType: 'radius',
            color: ['#2768B9', '#66A9FC', '#3E7ECD'],
            data:
              ajclList && ajclList['占比'] ? _.map(ajclList['占比'], (d) => {
                _.assignIn(d, {
                  label: {
                    show: d.value ? true : false,
                    formatter: '{c}件\n{d}%', normal: { show: true }
                  },
                  labelLine: { normal: { show: true }, emphasis: { show: true } },
                });
                return d;
              }) : [],
            // itemStyle: {
            //   normal: {
            //     shadowBlur: 200,
            //     shadowColor: 'rgba(26, 107, 255, 0.3)',
            //   },
            // },
          },
          {
            name: ajlb === 'ZJ' ? '不捕情形占比' : '不诉情形占比',
            type: 'pie',
            radius: ['0', '55%'],
            center: ['75%', '50%'],
            roseType: 'radius',
            data: ajclList ? _.map(ajclList['饼图'], (d) => {
              _.assignIn(d, {
                label: {
                  show: d.value ? true : false,
                  formatter: '{c}件\n{d}%', normal: { show: true },
                },
                labelLine: { normal: { show: true }, emphasis: { show: true } },
              });
              return d;
            }) : [],
            itemStyle: {
              normal: {
                shadowBlur: 200,
                shadowColor: 'rgba(26, 107, 255, 0.3)',
              },
            },
          }
        ]
      },

    };

    const modalList = {
      visible, dispatch, detailData,
      hideModal: this.hideModal,
      ajlb
    };

    return (
      <div className={styles.body}>
        <Divider className={styles.ajcldivider} />
        <div className={styles.bodyleft}></div>
        <div className={styles.ajcl}>
          {/* <img src={ajclImg} className={styles.ajclImg}/> */}
          {/* {ajclList && ajclList['占比'] ?
            <div className={styles.ajclsjzt}>
              <div className={styles.ajclsjTop}>
                <p className={styles.ajclsj}>{ajclList['占比'][0].name}</p>
                <p className={styles.ajclsj}>{ajclList['占比'][0].percentage}</p>
                <p className={styles.ajclsj}>{ajclList['占比'][0].value}&nbsp;件</p>
              </div>
              <div className={styles.ajclsjBottom}>
                <p className={styles.ajclsj}>{ajclList['占比'][1].name}</p>
                <p className={styles.ajclsj}>{ajclList['占比'][1].percentage}</p>
                <p className={styles.ajclsj}>{ajclList['占比'][1].value}&nbsp;件</p>
              </div>
            </div>
            : ''} */}
        </div>
        <Chart {...ajclListProps} />
        {
          !ajclList ? <HsModal {...modalList} /> : ''
        }
      </div>
    );
  }
}

export default AjclChart;
