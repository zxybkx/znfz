import React, {PureComponent, createElement} from 'react';
import {connect} from 'dva';
import {Link, routerRedux} from 'dva/router';
import {Button} from 'antd';
import Exception from 'lib/Exception';

@connect()
export default class extends PureComponent {
  render() {
    const {dispatch} = this.props;
    return (
      <Exception type="403"
                 style={{minHeight: 500, height: '80vh'}}
                 actions={createElement('a', {
                   onClick: () => {
                     dispatch(routerRedux.push('/passport/sign-in'));
                   },
                 }, <Button type="primary">重新登录</Button>)}/>
    );
  }
}
