import React, {PureComponent} from 'react';
import _ from 'lodash';
import {Divider} from 'antd';
import styles from './index.less';

const Fragment = React.Fragment;

export default class SwitchTitle extends PureComponent {
  constructor(props) {
    super(props);
    const {defaultActiveKey=0} = this.props;
    this.state = {
      activeKey:defaultActiveKey
    };
  }

  handleClick=(key)=>{
    let {activeKey} = this.state;
    if(activeKey == key){
      return;
    }else{
      this.setState({activeKey:key});
    }
    this.props.callback && this.props.callback(key);
  };


  render() {
    const {titles=[],style={},keys=[],showUnderLine=true} = this.props;
    const {activeKey} = this.state;
    let {selectedTitle,title} = styles;
    if(!showUnderLine){
      selectedTitle = styles.selectedTitleWithoutUnderLine;
    }
    const children = [];
    titles.map((item,index)=>{
      if(!keys[index]){
        keys.push(index);
      }
      if(keys[index] == activeKey){
        children.push(<div onClick={()=>{this.handleClick(keys[index])}} style={style} key={index} className={selectedTitle}>{item}</div>);
      }else{
        children.push(<div onClick={()=>{this.handleClick(keys[index])}} style={style} key={index} className={title}>{item}</div>);
      }
      children.push(<Divider key={titles.length + index} type="vertical" />);
    });
    children.pop();

    return (
      <Fragment>
        {children}
      </Fragment>
    );
  }
}
