import React, {PureComponent, Fragment} from 'react';
import {connect} from 'dva';
import {Row, Col, Button, Card, Alert} from 'antd';
import classnames from 'classnames';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import FlowStep from 'components/Deal/FlowStep';
import Tools from 'components/Deal/Tools';
import styles from './finish.less';
import Authorized from 'utils/Authorized';

const {AuthorizedRoute} = Authorized;

const stage = 'GS';

class Finish extends PureComponent {

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

  finish = () => {
    const {gsjd: {ajxx}, dispatch} = this.props;
    if (!ajxx || !ajxx.bmsah) {
      return;
    }
    dispatch({
      type: 'znfz/updateAJZT',
      payload: {
        bmsah: ajxx.bmsah,
        zt: 9,
      },
    }).then(() => {
      dispatch({
        type: 'gsjd/getAjxx',
        payload: {
          bmsah: ajxx.bmsah,
        },
      });
    })
  };


  render() {
    const {dispatch, match, gsjd, loading} = this.props;
    const {params: {id}} = match;
    const {ajxx, coords} = gsjd;
    const {ajzt} = ajxx;

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
          {
            (!ajzt || ajzt.zt !== 9) &&
            <Fragment>
              <Alert
                message="办结案件"
                description="办结案件，将切换案件当前办理状态到办结状态，并提交归档，该案件将不能再做变更。"
                type="info"
                showIcon
              />
              <Row type="flex" justify="space-around" style={{marginTop: '10px'}}>
                <Col span={4}>
                  <Button type='primary' icon='check-circle' onClick={this.finish} loading={loading}>确认办结</Button>
                </Col>
              </Row>
            </Fragment>
          }
          {
            (ajzt && ajzt.zt === 9) && (
              <Alert
                message="办结案件"
                description="该案件已办结。"
                type="success"
                showIcon
              />
            )
          }
        </Card>
      </PageHeaderLayout>
    );
  }
}

@connect(({gsjd, loading}) => ({
  gsjd,
  loading: loading.effects['znfz/updateAJZT'],
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Finish {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}
