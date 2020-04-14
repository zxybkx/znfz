import React, {PureComponent} from 'react';
import {Icon, Tooltip, Menu, Dropdown} from 'antd';
import _ from 'lodash';
import styles from './index.less';

const SubMenu = Menu.SubMenu;

export default class NlpWrapper extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      active: false,
      visible: false,
    }
  }

  componentDidMount() {
    this.mounted = true;
    if(this.nlpwrapper) {
      this.nlpwrapper.addEventListener('click', this.onClick, true);
      this.nlpwrapper.addEventListener('focus', this.onClick, true);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    if(this.nlpwrapper) {
      this.nlpwrapper.removeEventListener('click', this.onClick, false);
      this.nlpwrapper.removeEventListener('focus', this.onClick, false);
    }
  }

  onClick = () => {
    if(!this.mounted){
      return false;
    }
    if(!_.isEqual(this, window.activeOcrObject)){
      window.activeOcrObject && window.activeOcrObject.blur();
      window.activeOcrObject = this;
    }

    this.setState({active: true, visible: true}, () => {
      this.props.onOcrClick && this.props.onOcrClick();
      window.ocrCancel = () => {
        window.ocrListener = null;
        this.setState({active: false, visible: false});
      };
    });
  };

  focus = () => {
    this.onClick();
  };

  blur = () => {
    if(!this.mounted){
      return false;
    }
    this.setState({visible: false}, ()=> {
      window._currentCursorTarget = null;
      window._currentCursorPosition = null;
    });
  };

  onDropdownClick = () => {
    this.props.onDropdownClick();
  };

  onMenuClick = ({ item, key, keyPath }) => {
    this.props.onMenuClick(keyPath);
  };

  handleMenuList = (data) => {
    const groupList = _.groupBy(data, (o)=>{
      return o.owner
    });

    const dropList = [];
    const ss = [];
    const gs = [];
    let owner = '';
    _.map(groupList,(v,k)=>{
      if(k !== 'null') {
        owner = k;
        const list = _.groupBy(v, (o)=>{
          return o.mergekey
        });

        _.map(list,(value,key)=>{
          const gsItem = {};
          _.set(gsItem,'name',key);
          const gsContent = [];
          _.map(value,(d)=>{
            const csItem = {};
            _.set(csItem,'name',d.cs);
            _.set(csItem,'content',d);
            gsContent.push(csItem);
          });
          _.set(gsItem,'content',_.orderBy(gsContent, v => _.toNumber(v.name.replace(/[^0-9]/ig, ''))));
          gs.push(gsItem);
        })
      }else {
        _.map(v,(value,index)=>{
          const ssItem = {};
          _.set(ssItem,'name',value.mergekey);
          _.set(ssItem,'content',value);
          ss.push(ssItem);
        })
      }
    });

    dropList.push({name:'认定事实',content: _.orderBy(ss, v => _.toNumber(v.name.replace(/[^0-9]/ig, '')))});
    _.map(gs,o=>dropList.push(o));
    return dropList;
  };

  render() {
    const {children,importVisible,dropData} = this.props;
    const loop = data => data.map((v) => {
      if(Array.isArray(v.content)) {
        return (
          <SubMenu title={v.name} key={v.name}>
            {loop(v.content)}
          </SubMenu>
        )
      }else {
        const tooltip = v.content && v.content.nlpdata && _.get(v.content.nlpdata,'案情摘要') ? _.get(v.content.nlpdata,'案情摘要').content : _.get(v.content.nlpdata,'供述摘录') ? _.get(v.content.nlpdata,'供述摘录').content : '未提取到';
        return (
          <Menu.Item key={v.name}>
            <Tooltip placement="right" title={tooltip}>
              <a>{v.name}</a>
            </Tooltip>
          </Menu.Item>
        )
      }
    });

    const menu = (
      <Menu onClick={this.onMenuClick}>
        {loop(this.handleMenuList(dropData))}
      </Menu>
    );

    return (
      <div tabIndex={-1} className={styles.default}
           ref={c => this.nlpwrapper = c}>
        <Tooltip title={'从图片解析'}>
          <span style={{display: this.state.visible ? 'block' : 'none'}}
                className={styles.rightTrigger}>
            <Icon type='select'/>
          </span>
        </Tooltip>

        <Dropdown overlay={menu} trigger={['click']} placement="bottomLeft" onClick={this.onDropdownClick}>
          <Tooltip placement="left" title={'导入事实数据'}>
            <a style={{display: this.state.visible && importVisible ? 'block' : 'none'}}
               className={styles.leftTrigger}>
              导入<Icon type="right-circle" style={{fontSize: '14px'}}/>
            </a>
          </Tooltip>
        </Dropdown>
        {children}
      </div>
    )
  }
}
