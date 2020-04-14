import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Form, Input, Button, Icon, Checkbox, TreeSelect, Alert} from 'antd';
import _ from 'lodash';
import store from '../../utils/store';
import {PORTAL, PROVENCE_SHORT_CODE} from '../../constant';
import Session from '../../utils/session';
import styles from './sign-in.less';

const crypto = require('crypto');

const FormItem = Form.Item;
const {TreeNode} = TreeSelect;

@connect(({login, loading}) => ({
  login: login,
  submitting: loading.effects['login/login'],
}))
@Form.create()
export default class SignIn extends Component {

  constructor(props) {
    super(props);
    const localUser = store.get('__last_login_user');
    this.state = {
      count: 0,
      treeData: this.buildDepartmentTree(props.login.departments),
      department: (localUser && localUser.department) || '请选择所属部门',
      expandKeys: [],
    };
  }

  buildDepartmentTree = (departments) => {
    let treeNode = [];
    if (departments) {
      let nodeMap = {};
      departments.forEach(d => {
        let node = {
          title: d.dwmc,
          value: d.dwbm,
          key: d.dwbm,
        };
        nodeMap[node.value] = node;
      });

      departments.forEach(d => {
        let parent = nodeMap[d.fdwbm];
        let node = nodeMap[d.dwbm];
        if (parent) {
          node.parent = parent;
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(node);
        }

        if (d.dwjb === '2') {
          treeNode.push(node);
        }
      });

    }
    return treeNode;
  };

  componentDidMount() {
    const {dispatch} = this.props;
    dispatch({
      type: 'login/getAllDepartments',
      payload: {
        dwbm: `${PROVENCE_SHORT_CODE}`,
      },
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.submitting && nextProps.login.status === 'ok') {
      const {dispatch} = this.props;
      const session = Session.get();
      if (session) {
        const roles = session.roles;
        if (roles.indexOf('ROLE_SUPER_ADMIN') >= 0) {
          dispatch(routerRedux.push('/passport/chose-portal'));
        } else {
          dispatch(routerRedux.push(PORTAL));
        }
      } else {
        dispatch(routerRedux.push('/passport/sign-in'));
      }

      dispatch({
        type: 'user/fetchCurrent',
      });

    } else {
      const {departments} = nextProps.login;
      const localUser = store.get('__last_login_user');
      if (departments && !_.isEqual(this.props.login.departments, departments)) {
        const treeData = this.buildDepartmentTree(departments);
        let root = treeData ? treeData[0].value : '';
        this.setState({
          treeData: treeData,
          expandKeys: [root, localUser && localUser.parent],
        });
      } else {
        let root = !_.isEmpty(this.state.treeData) ? this.state.treeData[0].value : '';
        this.setState({
          expandKeys: [root, localUser && localUser.parent],
        });
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onSwitch = (key) => {
    this.setState({
      type: key,
    });
  };

  onGetCaptcha = () => {
    let count = 59;
    this.setState({count});
    this.interval = setInterval(() => {
      count -= 1;
      this.setState({count});
      if (count === 0) {
        clearInterval(this.interval);
      }
    }, 1000);
  };

  onChange = (value, label, extra) => {
    const {triggerNode: {props: {parent}}} = extra;
    const {setFieldsValue} = this.props.form;
    this.setState({department: value}, () => {
      setFieldsValue({
        'parent': parent && parent.value ? parent.value : '',
      })
    });
  };

  filterTreeNode = (input, child) => {
    return String(child.props.title).indexOf(input) === 0;
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const {type} = this.state;
    this.props.form.validateFields({force: true},
      (err, data) => {
        if (!err) {
          store.add('__last_login_user', {
            department: data.department,
            username: data.username,
            parent: data.parent,
          });
          data.type = type;
          data.password = crypto.createHash('md5').update(data.password).digest('hex');
          this.props.dispatch({
            type: `login/login`,
            payload: data,
          })
        }
      },
    );
  };

  renderMessage = (message) => {
    return (
      <Alert
        style={{marginBottom: 24}}
        message={message}
        type="error"
        showIcon
      />
    );
  };

  loopRenderTree = (treeData = []) => {
    return _.map(treeData, node => {
       if(!_.isEmpty(node.children)){
         return (
           <TreeNode value={node.value} title={node.title} key={node.key}>
             {
               this.loopRenderTree(node.children)
             }
           </TreeNode>
         )
       }
       return  <TreeNode value={node.value} title={node.title} key={node.key}/>;
    })
  };

  render() {
    const {form, login, submitting} = this.props;
    const {getFieldDecorator} = form;
    const localUser = store.get('__last_login_user');
    return (
      <div className={styles.main}>
        <Form onSubmit={this.handleSubmit}>
          {
            login.status === 'error' &&
            submitting === false &&
            this.renderMessage('账户或密码错误')
          }
          {getFieldDecorator('parent', {
            initialValue: (localUser && localUser.parent) || '',
          })(
            <Input type="hidden"/>,
          )}
          <FormItem>
            {getFieldDecorator('department', {
              initialValue: `${this.state.department}` || undefined,
              rules: [{required: true, message: '请选择所属部门'}],
            })(
              <TreeSelect
                showSearch
                getPopupContainer={() => this.treeContainer}
                dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                placeholder="请选择工作部门"
                searchPlaceholder="名称/拼音首字母"
                treeData={this.state.treeData}
                treeDefaultExpandedKeys={this.state.expandKeys}
                onChange={this.onChange}
                filterTreeNode={this.filterTreeNode}/>
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('username', {
              initialValue: (localUser && localUser.username) || '',
              rules: [{
                required: true, message: '请输入账户名！',
              }],
            })(
              <Input
                size="large"
                prefix={<Icon type="user" className={styles.prefixIcon}/>}
                placeholder="账户名"
              />,
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password', {
              rules: [{
                required: true, message: '请输入密码！',
              }],
            })(
              <Input
                size="large"
                prefix={<Icon type="lock" className={styles.prefixIcon}/>}
                type="password"
                placeholder="密码"
              />,
            )}
          </FormItem>
          <FormItem className={styles.additional}>
            {getFieldDecorator('rememberMe', {
              valuePropName: 'checked',
              initialValue: true,
            })(
              <Checkbox className={styles.autoLogin}>自动登录</Checkbox>,
            )}
            <Button size="large" loading={submitting} className={styles.submit} type="primary" htmlType="submit">
              登录
            </Button>
          </FormItem>
        </Form>
        <div className={styles.other}>
        </div>
        <div className={styles.tree} ref={c => this.treeContainer = c}></div>
      </div>
    );
  }
}
