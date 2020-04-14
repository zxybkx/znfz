import React, {PureComponent} from 'react';
import {connect} from 'dva';
import Authorized from 'utils/Authorized';
import Case from 'components/currencydeal/Case';

const {AuthorizedRoute} = Authorized;

class Index extends PureComponent {
  componentWillMount() {
    const {dispatch, match, location: {query: {stage}}} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: 'znfz/getAjxx',
      payload: {
        bmsah: id,
      },
    });

    dispatch({
      type: `znfz/getTree`,
      payload: {
        bmsah: id,
      },
    });

    dispatch({
      type: `znfz/changeState`,
      payload: {
        stage,
      },
    });
  };

  render() {
    const {dispatch, location: {query: {stage, ysay, bmsah}}, match, znfz, nlpAdding, nlpDeleting} = this.props;

    const caseProps = {
      stage, ysay, dispatch, match, znfz, nlpAdding, nlpDeleting, bmsah
    };

    return (
      <Case {...caseProps} />
    );
  }
}

@connect(({global, znfz, xgsjd, loading}) => ({
  global,
  znfz,
  xgsjd,
  nlpAdding: loading.effects['znfz/addNlpItem'],
  nlpDeleting: loading.effects['znfz/deleteNlpItem'],
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Index {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="passport/sign-in"
      />
    )
  }
}
