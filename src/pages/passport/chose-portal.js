import React, {PureComponent, Fragment} from 'react';
import {connect} from 'dva';
import {routerRedux, Link} from 'dva/router';
import {Row, Col, Card, Icon} from 'antd';
import {PORTAL} from '../../constant';
import styles from './chose-portal.less';
import Session from '../../utils/session';
import Authorized from '../../utils/Authorized';

const {AuthorizedRoute} = Authorized;


class ChosePortal extends PureComponent {
  state = {};

  componentWillReceiveProps(nextProps) {
  }

  componentWillUnmount() {
  }

  onSwitch = (key) => {
    const {dispatch} = this.props;
    if (key === 'dashboard') {
      dispatch(routerRedux.push('/'));
    } else {
      dispatch(routerRedux.push(PORTAL));
    }
  };

  logout = () => {
    const {dispatch} = this.props;
    dispatch({
      type: 'login/logout',
    })
  };

  render() {
    const session = Session.get();
    return (
      <div className={styles.main}>
        <Row align={'middle'} justify={'center'} gutter={16} style={{padding: '8px 16px'}}>
          <Fragment>
            欢迎使用, <span style={{color: '#d14735', margin: '0 5px'}}>{session && session.firstName}</span>
            <a onClick={this.logout}>注销</a>
          </Fragment>
        </Row>
        <Row align={'middle'} justify={'center'} gutter={16}>
          <Col span={12}>
            <Card>
              <div className={styles.menuItem}>
                <a onClick={() => this.onSwitch('dashboard')}>
                  <Icon type={'dashboard'} className={styles.icon}/>
                  <div>管理控制台</div>
                </a>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <div className={styles.menuItem}>
                <a onClick={() => this.onSwitch('portal')}>
                  <Icon type={'user'} className={styles.icon}/>
                  <div>应用系统</div>
                </a>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

@connect(state => ({
  login: state.login,
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <ChosePortal {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}
