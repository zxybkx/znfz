import React, {PureComponent} from 'react';
import {connect} from 'dva';
import Authorized from 'utils/Authorized';
import {
  Card,
  Form,
  Spin,
} from 'antd';
import classnames from 'classnames';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import FlowStep from 'components/currencydeal/FlowStep';
import Tools from 'components/currencydeal/Tools';
import styles from './index.less';
import MainConclusion from 'components/currencydeal/conclusion';

const {AuthorizedRoute} = Authorized;

@Form.create()
class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fullScreen: false,
    }
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
    const {dispatch, location: {query: {stage, ysay}}, match, znfz, loading} = this.props;
    const {getFieldDecorator, validateFields, setFieldsValue} = this.props.form;
    const {params: {id}} = match;
    const {ajxx, viewDocTree, coords} = znfz;

    const flowStep = (
      <div className={styles.flow}>
        <div className={styles.steps}>
          <FlowStep match={match} dispatch={dispatch} bmsah={id} stage={stage} ajxx={ajxx} ysay={ysay}/>
        </div>
        <div className={styles.tools}>
          <Tools stage={stage}
                 coords={coords}
                 dispatch={dispatch}
                 ajxx={ajxx}
                 docTree={viewDocTree}/>
        </div>
      </div>
    );

    const conclusionProps = {
      dispatch,
      match,
      stage,
      getFieldDecorator,
      validateFields,
      setFieldsValue,
      znfz,
      ysay
    };

    return (
      <PageHeaderLayout content={flowStep} wrapperClassName={styles.default}>
        <Spin spinning={loading} size='large' className={styles.spin}/>
        <div className={classnames(styles.mask, this.state.fullScreen ? styles.fullScreen : '')}/>
        <Card className={classnames(styles.content, this.state.fullScreen ? styles.fullScreen : '')}>
          <div className={styles.main}>
            <div className={styles.right}>
              <div className={styles.bottom}>
                <MainConclusion {...conclusionProps}/>
              </div>
            </div>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}

@connect(({global, znfz, xgsjd, loading}) => ({
  global,
  znfz,
  xgsjd,
  loading: loading.effects['znfz/getConclusionData'],
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
