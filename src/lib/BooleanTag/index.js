import React, {PureComponent} from 'react';
import {Tag} from 'antd';
import classnames from 'classnames';
import styles from './index.less';

export default class BooleanTag extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {checked: props.checked};
  }


  /*componentWillReceiveProps(nextProps) {
    this.setState({
      checked: nextProps.checked
    })
  }*/

  /*shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !_.isEqual(this.props, nextProps)||!_.isEqual(this.state, nextState);
  }*/

  handleChange = (checked) => {
    this.setState({checked}, () => {
      this.props.onChange && this.props.onChange(checked);
    });
  };

  render() {
    const {CheckableTag} = Tag;
    const {size = 'default'} = this.props;
    return <CheckableTag className={classnames(styles.default, styles[size])} {...this.props}
                         checked={this.state.checked} onChange={this.handleChange}/>;
  }
}
