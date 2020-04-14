import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Card} from 'antd';
import classnames from 'classnames';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import Frame from 'lib/Frame/Frame';
import FlowStep from 'components/Deal/FlowStep';
import Tools from 'components/Deal/Tools';
import styles from './factor.less';
import Authorized from 'utils/Authorized';

const {AuthorizedRoute} = Authorized;

const stage = 'GS';

class Factor extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      fullScreen: false,
    }
  }

  componentDidMount() {
    const {dispatch, match} = this.props;
    dispatch({
      type: 'gsjd/getAjxx',
      payload: {
        bmsah: match.params.id,
      },
    });
  }

  toggleFullScreen = () => {
    this.setState({fullScreen: !this.state.fullScreen});
  };


  render() {
    const {dispatch, match, gsjd} = this.props;
    const {params: {id}} = match;
    const {ajxx, coords} = gsjd;

    const params = {
      bmsah: ajxx.bmsah,
      status: stage,
    };

    const flowStep = (
      <div className={styles.flow}>
        <div className={styles.steps}>
          <FlowStep match={match} dispatch={dispatch} bmsah={id} ajxx={ajxx} stage={stage}/>
        </div>
        <div className={styles.tools}>
          <Tools stage={stage}
                 coords={coords}
                 dispatch={dispatch}
                 ajxx={ajxx}
          />
        </div>
      </div>
    );

    return (
      <PageHeaderLayout content={flowStep} wrapperClassName={styles.default}>
        <div className={classnames(styles.mask, this.state.fullScreen ? styles.fullScreen : '')}/>
        <Card className={classnames(styles.content, this.state.fullScreen ? styles.fullScreen : '')}>
          <Frame src={`/dzjz/xxbd`} params={params} trigger={true} fixHeight={'100%'}/>
        </Card>
      </PageHeaderLayout>
    );
  }
}

@connect(({gsjd, loading}) => ({
  gsjd,
  loading: loading.effects['gsjd/getAjxx'],
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Factor {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}
