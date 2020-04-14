import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {LocaleProvider, Layout, message} from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import DocumentTitle from 'react-document-title';
import {connect} from 'dva';
import {Link, routerRedux} from 'dva/router';
import withRouter from 'umi/withRouter';
import {ContainerQuery} from 'react-container-query';
import classNames from 'classnames';
import {enquireScreen} from 'enquire-js';
import GlobalHeader from 'lib/GlobalHeader';
import SiderMenu from 'lib/SiderMenu';
import Feedback from 'lib/Feedback';
import _ from 'lodash';
import Authorized from '../utils/Authorized';
import logo from '../assets/logo.png';
import {APP_CODE, APP_NAME} from '../constant';
import Session from '../utils/session';

const {Content, Header} = Layout;

/**
 * 根据菜单取得重定向地址.
 */
const redirectData = [];
const getRedirect = (item) => {
  if (item && item.children) {
    if (item.children[0] && item.children[0].path) {
      redirectData.push({
        from: `${item.path}`,
        to: `${item.children[0].path}`,
      });
      item.children.forEach((children) => {
        getRedirect(children);
      });
    }
  }
};

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};

let isMobile;
enquireScreen((b) => {
  isMobile = b;
});

class BasicLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };
  state = {
    isMobile,
  };

  getChildContext() {
    const {location} = this.props;
    const authorizedMenu = this.authorizedMenu || this.getMenuData();
    const breadcrumbNameMap = {};
    authorizedMenu.forEach((item) => {
      let breadcrumbName = '';
      if (item.name) {
        breadcrumbName = item.name;
      } else {
        breadcrumbName = item.remark ? item.remark : '';
      }

      breadcrumbNameMap[item.path] = {
        name: breadcrumbName,
        component: item.component,
      };
    });
    return {
      location,
      breadcrumbNameMap: breadcrumbNameMap,
    };
  }

  componentDidMount() {
    enquireScreen((mobile) => {
      this.setState({
        isMobile: mobile,
      });
    });
    this.props.dispatch({
      type: 'user/fetchCurrent',
    });
    const {dispatch, location} = this.props;
    ReactDOM.render(<Feedback dispatch={dispatch} location={location} ref={c => this.feedback = c}/>, document.getElementById("feedback"));
  }

  componentDidUpdate(prevProps){
    const {dispatch, location} = this.props;
    if(!_.isEqual(location.pathname, prevProps.location.pathname)){
      ReactDOM.render(<Feedback dispatch={dispatch}  location={location} ref={c => this.feedback = c}/>, document.getElementById("feedback"));
    }
  }

  getPageTitle() {
    const {location} = this.props;
    const authorizedMenu = this.authorizedMenu || this.getMenuData();
    const {pathname} = location;
    let title = APP_NAME;
    if (authorizedMenu[pathname] && authorizedMenu[pathname].name) {
      title = `${authorizedMenu[pathname].name} - ${APP_NAME}`;
    }
    return title;
  }

  getAppData = () => {
    const session = Session.get();
    if(!session){
      return [];
    }
    let applications = session.applications;
    return applications || [];
  };

  getMenuData = () =>{
    const ret = [];

    const session = Session.get();
    if(!session){
      return ret;
    }

    const map = {};
    let resources = session.resources;
    if(resources){
      resources = resources.filter(res => res.module === APP_CODE);
      resources = _.orderBy(resources, "orderBy");
      resources.forEach(res => {
        map[res.id] = res;
        if(!res.pid || res.pid === 0 || res.pid === '0'){
          ret.push(res);
        }
      });

      resources.forEach(res => {
        let parent = map[res.pid];
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(res);
        }
      });
    }

    ret.forEach(getRedirect);
    this.authorizedMenu = ret;//左侧sider的数据
    return ret;
  };

  handleMenuCollapse = (collapsed) => {
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  }
  handleNoticeClear = (type) => {
    message.success(`清空了${type}`);
    this.props.dispatch({
      type: 'global/clearNotices',
      payload: type,
    });
  }

  logout = () => {
    this.props.dispatch({
      type: 'login/logout',
    });
  };

  handleMenuClick = ({key}) => {
    if (key === 'triggerError') {
      this.props.dispatch(routerRedux.push('/exception/trigger'));
      return;
    }
    if (key === 'logout') {
      this.logout();
    }
  }
  handleNoticeVisibleChange = (visible) => {
    if (visible) {
      this.props.dispatch({
        type: 'global/fetchNotices',
      });
    }
  }

  onFeedback = () => {
    if(this.feedback){
      this.feedback.feedback();
    }
  };

  render() {
    const {
      currentUser, collapsed, fetchingNotices, notices, children, location,
    } = this.props;

    const authorizedMenu = this.getMenuData();
    const authorizedApps = this.getAppData();

    const layout = (
      <Layout>
        <SiderMenu logo={logo}
          // 不带Authorized参数的情况下如果没有权限,会强制跳到403界面
          // If you do not have the Authorized parameter
          // you will be forced to jump to the 403 interface without permission
                   Authorized={Authorized}
                   menuData={authorizedMenu}
                   collapsed={collapsed}
                   location={location}
                   isMobile={this.state.isMobile}
                   onCollapse={this.handleMenuCollapse}
        />
        <Layout>
          <Header style={{padding: 0}}>
            <GlobalHeader
              logo={logo}
              appName={APP_NAME}
              location={location}
              authorizedApps={authorizedApps}
              menuData={authorizedMenu}
              currentUser={currentUser}
              fetchingNotices={fetchingNotices}
              notices={notices}
              collapsed={collapsed}
              isMobile={this.state.isMobile}
              onNoticeClear={this.handleNoticeClear}
              onCollapse={this.handleMenuCollapse}
              onMenuClick={this.handleMenuClick}
              onNoticeVisibleChange={this.handleNoticeVisibleChange}
              onLogout={this.logout}
              onFeedback={this.onFeedback}
            />
          </Header>
          <Content style={{margin: '16px 24px 0', border: 'none'}}>
            {children}
          </Content>
        </Layout>
      </Layout>
    );

    return (
      <LocaleProvider locale={zhCN}>
        <DocumentTitle title={this.getPageTitle()}>
          <ContainerQuery query={query}>
            {params => <div className={classNames(params)}>{layout}</div>}
          </ContainerQuery>
        </DocumentTitle>
      </LocaleProvider>
    );
  }
}

export default withRouter(connect(({user, global, loading}) => ({
  currentUser: user.currentUser,
  authorizedMenu: user.authorizedMenu,
  collapsed: global.collapsed,
  fetchingNotices: loading.effects['global/fetchNotices'],
  notices: global.notices,
}))(BasicLayout));
