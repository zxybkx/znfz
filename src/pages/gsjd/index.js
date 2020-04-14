import React, {PureComponent, Fragment} from 'react';
import {connect} from 'dva';
import { Form, Select, DatePicker} from 'antd';
import _ from 'lodash';
import Authorized from 'utils/Authorized';
import MainList from '../../components/currencydeal/MainList';

const {AuthorizedRoute} = Authorized;

@Form.create({
  mapPropsToFields(props) {
    const {znfz: {taskQueryCondition}} = props;
    return _.mapValues(taskQueryCondition, (v, k) => Form.createFormField({k, value: v}));
  },
})
class Tasks extends PureComponent {
  constructor(props){
    super(props);
    this.state= {
      dqjd: 'GS',
    };
  }

  componentDidMount() {

  }

  render() {
    const {dqjd} = this.state;

    const tabList = [{
      key: 'GS',
      tab: '审查起诉',
    }, {
      key: '',
      tab: '',
    }];

    return (
      <Fragment>
        <MainList tabList={tabList} stage='GS' pathname="gsjd" dqjd={dqjd} {...this.props} />
      </Fragment>
    );
  }
}

@connect(({global, zcjd, znfz, loading}) => ({
  global,
  zcjd,
  znfz,
  loading: loading.effects['znfz/getTasks'],
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Tasks {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}


