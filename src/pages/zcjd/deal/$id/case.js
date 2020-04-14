import React, {PureComponent} from 'react';
import {connect} from 'dva';
import Authorized from 'utils/Authorized';
import Case from 'components/currencydeal/Case/Case';

const {AuthorizedRoute} = Authorized;

class Index extends PureComponent {

  render() {
    const {dispatch, match, znfz, nlpAdding, nlpDeleting} = this.props;
    const caseProps = {
      stage: 'ZJ', dispatch, match, znfz, nlpAdding, nlpDeleting
    };

    return (
      <Case {...caseProps} />
    );
  }
}

@connect(({global, znfz, xzcjd, loading}) => ({
  global,
  znfz,
  xzcjd,
  loading: loading.effects['xzcjd/getProblems'],
  nlpAdding: loading.effects['znfz/addNlpItem'],
  nlpDeleting: loading.effects['znfz/deleteNlpItem'],
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
