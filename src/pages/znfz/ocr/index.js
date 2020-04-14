import React, {PureComponent} from 'react';
import {connect} from 'dva';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import Authorized from 'utils/Authorized';
import styles from './index.less';

const {AuthorizedRoute} = Authorized;

class Index extends PureComponent {


  render() {


    return (
      <PageHeaderLayout wrapperClassName={styles.default}>

      </PageHeaderLayout>
    );
  }
}

@connect(({global, znfz, xgsjd, loading}) => ({
  global,
  znfz,
  xgsjd,
  loading: loading.effects['xgsjd/getProblems'],
  nlpLoading: loading.effects['znfz/getNlpByBmsahAndWsmc'],
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
