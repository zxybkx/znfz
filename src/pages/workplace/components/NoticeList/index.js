import React, {PureComponent} from 'react';
import {Icon} from 'antd';
import Ellipsis from 'lib/Ellipsis';
import style from './index.less';


export default class NoticeList extends PureComponent {

  render() {
    //讲this.props转换成数组
    const {download} = Array.from(this.props);
    return (
      <div className={style.downloadCard}>
        {
          download&&download.map((obj, index) => {
            const date = obj.creat_time.split('T');
            return (
              <div className={style.file} key={index}>
                <a target='_blank' href={`${obj.url}`}>
                  {obj.view_type === 'new' && <Icon type='notification' className='color-red'/>}&nbsp;
                  {obj.view_type !== 'new' && <Icon type='right-square-o'/>}&nbsp;
                  <Ellipsis style={{display: 'inline', width: 'auto'}} length={14} tooltip>{obj.title}</Ellipsis>
                  <span style={{float: 'right'}}>{date[0]}</span>
                </a>
              </div>
            );
          })
        }
      </div>
    );
  }
}


