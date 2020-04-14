import React, {PureComponent, Fragment} from 'react';
import {Icon} from 'antd';
import styles from './index.less';

export default class Index extends PureComponent{

  render(){
    const {title,content,onClick} = this.props;
    return (
      <div className={styles.fileItem} onClick={onClick}>
        <div className={styles.title}><Icon type='file' /> {title}</div>
      </div>
    )
  }
}
