import React from 'react';
import {Link} from 'dva/router';
import Ellipsis from 'lib/Ellipsis';
import styles from './index.less';

export default class Dxal extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      dxal: true,
    }
  }

  render() {
    const {dxalList, flfgList} = this.props;
    const {dxal} = this.state;
    const arr = Array.from(dxal ? dxalList : flfgList);
 

    return (
      <div>
        <p>
          <a style={{color: dxal ? '#424242' : 'grey', fontWeight: dxal ? 'bold' : 'normal'}}
             onClick={() => {
               this.setState({
                 dxal: true,
               });
             }}
          >典型案例学习</a>&nbsp;&nbsp;|&nbsp;&nbsp;
          <a style={{color: dxal ? 'grey' : '#424242', fontWeight: !dxal ? 'bold' : 'normal'}}
             onClick={() => {
               this.setState({
                 dxal: false,
               });
             }}
          >法律法规</a>
          <span style={{float: 'right', marginRight: 10}}>
                  {this.state.dxal ?
                    <Link to='/tzgg?type=3'><span style={{color: '#b0b0b0',fontWeight:'bold'}}>更多</span></Link> :
                    <Link to='/tzgg?type=4'><span style={{color: '#b0b0b0',fontWeight:'bold'}}>更多</span></Link>
                  }
                </span>
        </p>
        <div className={styles.rightBottomBody}>
          {
            //循环到页面
            arr.map((obj, index) => {
              return (
                <div key={index} className={styles.line}>
                  <a target='_blank' href={`${obj.url}`}>
                    <Ellipsis style={{display: 'inline', width: 'auto'}} length={14}
                              tooltip>{obj.title}</Ellipsis>
                    <span style={{float: 'right'}}>{obj.create_time}</span>
                  </a>
                </div>
              );
            })
          }
        </div>
      </div>
    )
  }
}
