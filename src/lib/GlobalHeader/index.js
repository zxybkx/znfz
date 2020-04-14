import React, {PureComponent, createElement} from 'react';
import PropTypes from 'prop-types';
import {Breadcrumb, Menu, Icon, Spin, Tag, Dropdown, Avatar, Divider, Tooltip} from 'antd';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
import Debounce from 'lodash-decorators/debounce';
import {Link} from 'dva/router';
import classnames from 'classnames';
import NoticeIcon from '../NoticeIcon';
import styles from './index.less';
import {urlToList} from '../utils/pathTools';
import {getBreadcrumb} from '../PageHeader';
import {STATIC_CONTEXT} from '../../constant';

export default class GlobalHeader extends PureComponent {
  static contextTypes = {
    routes: PropTypes.array,
    params: PropTypes.object,
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };

  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }

  getBreadcrumbProps = () => {
    return {
      routes: this.props.routes || this.context.routes,
      params: this.props.params || this.context.params,
      routerLocation: this.props.location || this.context.location,
      breadcrumbNameMap:
      this.props.breadcrumbNameMap || this.context.breadcrumbNameMap,
    };
  };

  // Generated according to props
  conversionFromProps = () => {
    const {
      breadcrumbList,
      breadcrumbSeparator,
      linkElement = 'a',
    } = this.props;
    return (
      <Breadcrumb className={styles.breadcrumb} separator={breadcrumbSeparator}>
        {breadcrumbList.map(item => (
          <Breadcrumb.Item key={item.title}>
            {item.href
              ? createElement(
                linkElement,
                {
                  [linkElement === 'a' ? 'href' : 'to']: item.href,
                },
                item.title,
              )
              : item.title}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    );
  };

  conversionFromLocation = (routerLocation, breadcrumbNameMap) => {
    const {breadcrumbSeparator, linkElement = 'a'} = this.props;
    // Convert the url to an array
    const pathSnippets = urlToList(routerLocation.pathname);
    // Loop data mosaic routing
    const extraBreadcrumbItems = pathSnippets.map((url, index) => {
      const currentBreadcrumb = getBreadcrumb(breadcrumbNameMap, url);
      const isLinkable =
        index !== pathSnippets.length - 1 && currentBreadcrumb.component;
      return currentBreadcrumb.name && !currentBreadcrumb.hideInBreadcrumb ? (
        <Breadcrumb.Item key={url}>
          {createElement(
            isLinkable ? linkElement : 'span',
            {[linkElement === 'a' ? 'href' : 'to']: url},
            currentBreadcrumb.name,
          )}
        </Breadcrumb.Item>
      ) : null;
    });
    // Add home breadcrumbs to your head
    extraBreadcrumbItems.unshift(
      <Breadcrumb.Item key="home">
        {createElement(
          linkElement,
          {
            [linkElement === 'a' ? 'href' : 'to']: '/',
          },
          '首页',
        )}
      </Breadcrumb.Item>,
    );
    return (
      <Breadcrumb className={styles.breadcrumb} separator={breadcrumbSeparator}>
        {extraBreadcrumbItems}
      </Breadcrumb>
    );
  };

  getNoticeData() {
    const {notices = []} = this.props;
    if (!notices || notices.length === 0) {
      return {};
    }
    const newNotices = notices.map((notice) => {
      const newNotice = {...notice};
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      // transform id to item key
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = ({
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        })[newNotice.status];
        newNotice.extra = <Tag color={color} style={{marginRight: 0}}>{newNotice.extra}</Tag>;
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  }

  toggle = () => {
    const {collapsed, onCollapse} = this.props;
    onCollapse(!collapsed);
    this.triggerResizeEvent();
  }

  @Debounce(600)
  triggerResizeEvent() { // eslint-disable-line
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }

  render() {
    const {
      currentUser, collapsed, fetchingNotices, isMobile, logo, appName,
      onNoticeVisibleChange, onNoticeItemClick,
      onMenuClick, onNoticeClear, onLogout, onFeedback,
    } = this.props;
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
        <Menu.Item disabled><Icon type="user"/>个人中心</Menu.Item>
        <Menu.Item disabled><Icon type="setting"/>设置</Menu.Item>
        <Menu.Divider/>
        <Menu.Item key="logout"><Icon type="logout"/>退出登录</Menu.Item>
      </Menu>
    );
    const noticeData = this.getNoticeData();
    return (
      <div className={classnames(styles.header, 'global-header')}>
        {isMobile && (
          [
            (
              <Link to="/" className={styles.logo} key="logo">
                <img src={logo} alt="logo" width="32"/>
              </Link>
            ),
            <Divider type="vertical" key="line"/>,
          ]
        )}
        <Icon
          className={styles.trigger}
          type={collapsed ? 'menu-unfold' : 'menu-fold'}
          onClick={this.toggle}
        />
        {
          !isMobile && <h2 style={{color: '#ffffff'}}>{appName}</h2>
        }
        <div className={styles.right}>
          <Tooltip title="问题反馈">
            <a onClick={onFeedback}
              href="javascript:void(0)"
              rel="noopener noreferrer"
              className={styles.action}
            >
              <Icon type="question-circle-o" />
            </a>
          </Tooltip>
          <NoticeIcon
            className={styles.actionx}
            count={currentUser.notifyCount}
            onItemClick={onNoticeItemClick}
            onClear={onNoticeClear}
            onPopupVisibleChange={onNoticeVisibleChange}
            loading={fetchingNotices}
            popupAlign={{offset: [20, -16]}}
          >
            <NoticeIcon.Tab
              list={noticeData['消息']}
              title="消息"
              emptyText="您已读完所有消息"
              emptyImage={`${STATIC_CONTEXT}/images/sAuJeJzSKbUmHfBQRzmZ.svg`}
            />
          </NoticeIcon>
          <Tooltip title="锁定屏幕">
            <a rel="noopener noreferrer"
               className={styles.action}
               onClick={onLogout}
            >
              <Icon type="lock"/>
            </a>
          </Tooltip>
          {currentUser.name ? (
            <Dropdown overlay={menu}>
              <span className={`${styles.action} ${styles.account}`}>
                <Avatar className={styles.avatar} style={{backgroundColor: '#1890ff', verticalAlign: 'middle'}}>
                  {currentUser.name.length > 3 ? currentUser.name.substr(2) : currentUser.name.substr(1)}</Avatar>
                <span className={styles.dept}>{currentUser.dwmc}</span>
                <span className={styles.name}>·{currentUser.name}</span>
              </span>
            </Dropdown>
          ) : <a size="small" style={{marginLeft: 8}} onClick={onLogout}><Icon type='logout'/> 注销</a>}
        </div>
      </div>
    );
  }
}
