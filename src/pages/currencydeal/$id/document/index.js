import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Card, Modal} from 'antd';
import classnames from 'classnames';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import {getHttpHostPrefix} from 'utils/utils';
import styles from './index.less';
import Authorized from 'utils/Authorized';
import MainDocument from 'components/currencydeal/conclusion/MainDocument';

const {AuthorizedRoute} = Authorized;

class Document extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.loadedDoc = {};
  }

  componentDidMount() {
    const {dispatch, match, znfz} = this.props;
    const {params: {id}} = match;

    dispatch({
      type: 'znfz/getAjxx',
      payload: {
        bmsah: id,
      },
    });
  };

  render() {
    const {dispatch, match, history, location:{query:{stage}},znfz,znfz:{ajxx}} = this.props;
    const mainDocumentProps = {
       match, history, stage, znfz,dispatch,ajxx
    };

    return (
      <PageHeaderLayout wrapperClassName={styles.default}>
        <div className={classnames(styles.mask, this.state.fullScreen ? styles.fullScreen : '')}/>
        <div className={classnames(styles.content,  styles.fullScreen)}>
          <MainDocument {...mainDocumentProps}/>
        </div>
      </PageHeaderLayout>
    );
  }
}

@connect(({znfz, xgsjd, loading}) => ({
  znfz,
  xgsjd,
  loading: loading.effects['xgsjd/getProblems'],
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Document {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}
