import React, {PureComponent} from 'react';
import style from './index.less';
import _ from 'lodash';

export default class CardExtra extends PureComponent {
  constructor(props) {
    super(props);
    const colorFlags=[],resetFlags = [];
    for(let i = 0;i < props.titles.length; i++){
      colorFlags.push(true);
      resetFlags.push(true);
    }
    this.state = {
      colors:this.props.colors && this.props.colors.length > 0 ? this.props.colors : ['blue'],
      titles:this.props.titles ? this.props.titles : [],
      colorFlags:colorFlags,
      resetFlags:resetFlags,
    };
  }

  handleClick=(index)=>{
    const {flags:colorFlags = this.state.colorFlags} = this.props;
    colorFlags[index] = !colorFlags[index];
    const newColorFlags = _.cloneDeep(colorFlags);
    this.setState({colorFlags:newColorFlags});
    this.props.onClick && this.props.onClick(newColorFlags);
  };

  componentWillReceiveProps(nextProps){
    if(nextProps.titles.length != this.state.colorFlags.length){
      const newColorFlags = [],resetFlags = [];
      for(let i = 0;i < nextProps.titles.length; i++){
        newColorFlags.push(true);
        resetFlags.push(true);
      }
      this.setState({colorFlags:newColorFlags,resetFlags:resetFlags});
      return;
    }
    let reset = false;
    for(let i = 0;i< nextProps.titles.length;i++){
      if(nextProps.titles[i] != this.props.titles[i]){
        reset = true;
        break;
      }
    }
    if(reset){
      const newColorFlags = _.cloneDeep(this.state.resetFlags);
      this.setState({colorFlags:newColorFlags});
    }
  }

  render() {
    const {colors,titles} = this.props;
    const {flags:colorFlags = this.state.colorFlags} = this.props;
    const children = [];
    titles.map((item,index)=>{
      children.push(
        <div className={style.item} onClick={()=>{this.handleClick(index)}} key={index}>
          <span className={style.title} style={{color: colorFlags[index] ? "black" : "grey"}}>{item}</span>
          <div className={style.icon} style={{backgroundColor: colorFlags[index] ? colors[index % colors.length] : "grey"}}></div>
        </div>
      );
    });

    return (
      <div>
        <div style={{display:"table"}}>
          {children}
        </div>
      </div>
    );
  }
}
