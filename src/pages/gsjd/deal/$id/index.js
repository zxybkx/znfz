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
        latest_stage: 'GS',
      },
    })
  }

  render() {
    const {match, location: {search}} = this.props;
    return (
      <Redirect to={`/gsjd/deal/${match.params.id}/question${/^\?.*/.test(search) ? search : '?' + search}`}/>
    )
  }
}

@connect(({znfz, gsjd}) => ({
  znfz,
  gsjd,
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

