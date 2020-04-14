import React, {PureComponent} from 'react';
import {Form, Input, Button, Icon, Popconfirm, Tooltip, message} from 'antd';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import classnames from 'classnames';
import _ from 'lodash';
import StatusTab from './StatusTab';
import CategoryTab from './CategoryTab';

import styles from './index.less';

const {Group: InputGroup} = Input;

@Form.create()
class Index extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      addVisible: false,
      triggerVisible: false,
      activeTab: props.activeTab ? props.activeTab : props.tabs && props.tabs[0] && props.tabs[0].key,
      tabs: props.tabs,
    };
  }

  componentWillReceiveProps = (nextProps) => {
    if (!_.isEqual(nextProps.tabs, this.props.tabs) || !_.isEqual(nextProps.activeTab, this.props.activeTab)) {
      this.setState({
        tabs: nextProps.tabs,
        activeTab: nextProps.activeTab ? nextProps.activeTab : nextProps.tabs && nextProps.tabs[0] && nextProps.tabs[0].key,
      });
    }
  };

  componentDidMount = () => {
    window.addEventListener('resize', this._resize, false);
    this._resize();
  };

  componentDidUpdate = () => {
    this._resize();
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this._resize);
  };

  onTabClick = (key) => {
    const {onTabChange} = this.props;
    this.setState({activeTab: key}, () => {
      onTabChange && onTabChange(key);
    })
  };

  scrollTab = (flag) => {
    this.tabContainer.scrollLeft += flag ? 500 : -500;
  };

  switchPlus = () => {
    this.setState({addVisible: !this.state.addVisible});
  };

  addTabWithoutInput = (e) => {
    e.preventDefault();
    const {onAdd} = this.props;
  
    const {tabs} = this.state;
    onAdd && onAdd(null, `${_.size(tabs)}`); 

  };

  addTab = (e) => {
    e.preventDefault();
    const {form, type = '内容', onAdd} = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const values = {
        ...fieldsValue,
      };
      const {tabs} = this.state;
      const {tabName} = values;
      if (_.findIndex(tabs, d => d.key === tabName) >= 0) {
        message.warn(`${type}名称不能相同`);
        return false;
      }
      const _tabs = _.cloneDeep(tabs);
      _tabs.push({key: tabName, label: tabName});
      this.setState({tabs: _tabs, activeTab: tabName, addVisible: false}, () => {
        this._resize();
        this.scrollTab(true);
        form.setFieldsValue({tabName: ''});
        onAdd && onAdd(tabName, `${_.size(_tabs) - 1}`, _tabs);
      })
    });
  };

  deleteTab = (key) => {
    const {onDelete} = this.props;
    const {tabs} = this.state;
    _.remove(tabs, v => v.key === key);
    const _tabs = _.cloneDeep(tabs);
    this.setState({tabs: _tabs, activeTab: _tabs[0] ? _tabs[0].key : ''}, () => {
      this._resize();
      this.scrollTab(false);
      onDelete && onDelete(key, '0', _tabs);
    });
  };

  renameTab = (key, newName) => {
    const {tabs} = this.state;
    const index = _.findIndex(tabs, v => v.key === key);
    if (index >= 0) {
      _.set(tabs[index], `label`, newName);
      this.setState({tabs: _.cloneDeep(tabs), activeTab: key})
    }
  };

  close = () => {
    const {form: {resetFields}} = this.props;
    this.setState({addVisible: false}, () => {
      resetFields();
    });
  };

  @Bind()
  @Debounce(400)
  _resize = () => {
    let {offsetWidth: w} = this.container;
    let width = 0;
    this.tabContainer && _.forEach(this.tabContainer.childNodes,(tab)=>width += tab.offsetWidth);
    // this.tabContainer.childNodes.forEach(tab => width += tab.offsetWidth);
    if (width > w - 100) {
      this.setState({triggerVisible: true})
    } else {
      this.setState({triggerVisible: false})
    }
  };

  render() {
    const {tabs, activeTab, addVisible, triggerVisible} = this.state;
    const {form: {getFieldDecorator}, type = '内容', editable = true} = this.props;
    return (
      <div className={styles.default} ref={c => this.container = c}>
        <div className={styles.tabs} ref={c => this.tabContainer = c}>
          {
            tabs && tabs.map(d => {
              return (
                <div key={d.key} className={classnames(styles.item, activeTab === d.key ? styles.active : '')}>
                  <a onClick={() => this.onTabClick(d.key)}>
                    {d.iconConfig ? <Tooltip title={d.iconConfig.name}>
                                      <Icon type={d.iconConfig.icon}
                                            style={{color: d.iconConfig.color}}/>
                                    </Tooltip> : null} {d.label}</a>
                  {
                    editable && (
                      <Popconfirm title={`确认要删除${d.label}吗?`} onConfirm={() => this.deleteTab(d.key)} okText="是"
                                  cancelText="否">
                        <a className={styles.delete}><Icon type='close'/></a>
                      </Popconfirm>
                    )
                  }
                </div>
              );
            })
          }
        </div>
        {
          editable && (
            <div className={styles.plus} style={{paddingRight: triggerVisible ? 2 : 20}}>
              <a onClick={this.addTabWithoutInput}>
                <Icon type='plus'/>
              </a>
              <div ref={c => this.input = c} className={styles.input} style={{display: addVisible ? 'block' : 'none'}}>
                <InputGroup compact>
                  {getFieldDecorator('tabName', {
                    initialValue: '',
                    rules: [
                      {required: true, message: `请输入要添加的${type}`},
                    ],
                  })(
                    <Input placeholer={`添加的${type}`}/>,
                  )}
                  <Button type='primary' icon='save' onClick={this.addTab}/>
                  <Button icon='close' onClick={this.close}/>
                </InputGroup>
              </div>
            </div>
          )
        }
        <div className={styles.trigger} style={{display: triggerVisible ? 'flex' : 'none'}}>
          <div>
            <a onClick={() => this.scrollTab(false)}><Icon type='left'/></a>
          </div>
          <div>
            <a onClick={() => this.scrollTab(true)}><Icon type='right'/></a>
          </div>
        </div>
      </div>
    );
  }
}

export default Index;
export {StatusTab, CategoryTab};
