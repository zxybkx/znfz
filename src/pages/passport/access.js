import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Spin} from 'antd';

@connect(({login, loading}) => ({
  login: login,
  submitting: loading.effects['login/access'],
}))
export default class Access extends PureComponent{

  componentDidMount(){
    const {dispatch, location: {query}} = this.props;
    dispatch({
      type: `login/access`,
      payload: {
        dwbm: query.dwbm,
        gh: query.gh,
      },
    }).then(({status})=>{
      if(status === 'ok'){
        dispatch(routerRedux.push("/"))
      }
    })
  }

  render(){
    return <Spin />;
  }
}
