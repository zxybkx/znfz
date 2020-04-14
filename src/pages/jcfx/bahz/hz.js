import React, {PureComponent} from 'react';
import {Card} from 'antd';
import classnames from 'classnames';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import Frame from 'lib/Frame/Frame';
import {TOOLS_JC} from '../../../constant';
import {getFixScreenHeight} from '../../../utils/utils';
import styles from '../index.less';
import Authorized from 'utils/Authorized';

const {AuthorizedRoute} = Authorized;

class Page extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fullScreen: false,
    }
  }

  render() {
    return (
      <PageHeaderLayout wrapperClassName={styles.default}>
        <div className={classnames(styles.mask, this.state.fullScreen ? styles.fullScreen : '')}/>
        <Card className={classnames(styles.content, this.state.fullScreen ? styles.fullScreen : '')}>
          <Frame src={`${TOOLS_JC}/bahz/hz`} fixHeight={getFixScreenHeight(100)} trigger={true}/>
        </Card>
      </PageHeaderLayout>
    )
  }

}

export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Page {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}



