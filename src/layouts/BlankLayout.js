import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Tooltip, Icon} from 'antd';
import ReactDOM from 'react-dom';
import {LocaleProvider} from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import Feedback from 'lib/Feedback';
import withRouter from 'umi/withRouter';
import _ from 'lodash';
import styles from './BlankLayout.less';

class BlankLayout extends PureComponent {
  componentDidMount() {
    const {dispatch, location} = this.props;
    this.props.dispatch({
      type: 'user/fetchCurrent',
    });
    ReactDOM.render(<Feedback dispatch={dispatch} location={location}
                              ref={c => this.feedback = c}/>, document.getElementById('feedback'));
  }

  componentDidUpdate(prevProps) {
    const {dispatch, location, currentUser} = this.props;
    if (!_.isEqual(location.pathname, prevProps.location.pathname)) {
      ReactDOM.render(<Feedback dispatch={dispatch} location={location}
                                ref={c => this.feedback = c}/>, document.getElementById('feedback'));
    }
  }

  onFeedback = () => {
    if (this.feedback) {
      this.feedback.feedback();
    }
  };

  logout = () => {
    this.props.dispatch({
      type: 'login/logout',
    });
  };

  render() {
    const {children, currentUser, showHeader = true} = this.props;
    return (
      <LocaleProvider locale={zhCN}>
        <div className={styles.default} style={{ border: 'none'}}>
          {
            showHeader && (
              <div className={styles.header}>
            <span className={styles.user}>
              {currentUser.dwmc}·{currentUser.dlbm}
            </span>
                {/* <Tooltip title="问题反馈">
                  <a onClick={this.onFeedback}
                     href="javascript:void(0)"
                     rel="noopener noreferrer"
                     className={styles.action}>
                    <Icon type="question-circle-o"/>
                  </a>
                </Tooltip> */}
                <Tooltip title="注销">
             <span>
               <a className={styles.action} style={{marginLeft: 8}} onClick={this.logout}><Icon type="poweroff"/></a>
               </span>
                </Tooltip>
              </div>
            )
          }
          {children}
        </div>
      </LocaleProvider>
    )
  }
}

export default withRouter(connect(({user}) => ({
  currentUser: user.currentUser,
}))(BlankLayout));

