import React, {PureComponent} from 'react';
import {Button} from 'antd';
import styles from './index.less';

export default class ToggleTrigger extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      active: false,
    }
  }

  trigger = () => {
    this.setState({active: !this.state.active}, () => {
      this.props.onClick && this.props.onClick();
    })
  };

  render() {
    const {active} = this.state;
    const {style = {}, position = 'left'} = this.props;
    return (
      <Button type="primary" size='small' shape="circle"
              onClick={this.trigger}
              className={styles.default}
              style={Object.assign({}, style, position === 'left' ? {left: 10} : {right: 10})}
              icon={active ? 'menu-unfold' : 'menu-fold'}/>
    );
  }
}
