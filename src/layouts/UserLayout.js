import React from 'react';
import {Link} from 'dva/router';
import logo from '../assets/logo.png';
import classnames from 'classnames';
import styles from './UserLayout.less';
import {APP_NAME, PROVENCE_CODE, PROVENCE_NAME} from '../constant';

export default class UserLayout extends React.Component{
  render(){
    const {children} = this.props;
    if(PROVENCE_CODE === '530'){
      return (
        <div className={classnames(styles.container, 'cm-user-layout')}>
          <div className={styles.content}>
            <div className={styles.top}>
              <div className={styles.header}>
                <Link to="/">
                  <img alt="logo" className={styles.ynlogo} src={logo}/>
                </Link>
              </div>
              <div className={classnames(styles.yndesc, 'yndesc')}>{APP_NAME}</div>
            </div>
            {children}
          </div>
        </div>
      )
    }else{
      return (
        <div className={classnames(styles.container, 'cm-user-layout')}>
          <div className={styles.content}>
            <div className={styles.top}>
              <div className={styles.header}>
                <Link to="/">
                  <img alt="logo" className={styles.logo} src={logo}/>
                  <span className={classnames(styles.title,'title')}>{APP_NAME}</span>
                </Link>
              </div>
              <div className={classnames(styles.desc, 'desc')}>{/*{APP_NAME}*/}</div>
            </div>
            {children}
          </div>
        </div>
      )
    }

  }
}
