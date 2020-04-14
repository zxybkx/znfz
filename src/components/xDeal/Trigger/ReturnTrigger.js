import React, {PureComponent} from 'react';
import {Button} from 'antd';
import styles from './index.less';

export default class ReturnTrigger extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {}
  }

  return = () => {
    this.props.onClick && this.props.onClick();
  };

  render = () => {
    const {style = {}, position = 'left'} = this.props;
    return (
      <Button type="primary" size='small' shape="circle" icon="left"
              style={Object.assign({}, style, position === 'left' ? {left: 10} : {right: 10})}
              className={styles.default}
              onClick={this.return}/>
    )
  }
}
