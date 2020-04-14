import React, {PureComponent} from 'react';
import {connect} from 'dva';
import Redirect from 'umi/redirect';
import Authorized from 'utils/Authorized';

const {AuthorizedRoute} = Authorized;

class Index extends PureComponent {

  componentDidMount() {
    const {match, dispatch} = this.props;
    dispatch({
      type: 'znfz/saveLatestBmsah',
      payload: {
        latest_bmsah: match.params.id,
        latest_stage: 'SP',
      },
    })
  }

  render() {
    const {match, location: {search}} = this.props;
    return (
      <Redirect to={`/spjd/spdeal/${match.params.id}/file${/^\?.*/.test(search) ? search : '?' + search}`}/>
    )
  }
}

@connect(({znfz}) => ({
  znfz,
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Index {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}

