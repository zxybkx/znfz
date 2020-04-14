import React, {Component} from 'react';
import {Tooltip} from 'antd';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Button} from 'antd';
import styles from './styles.css';

export default class Layout extends Component {

  static propTypes = {
    expanded: PropTypes.bool,
    doExpand: PropTypes.func,
    doCollapse: PropTypes.func,
    onExpandEvent: PropTypes.func,
    config: PropTypes.object,
    onChange: PropTypes.func,
    currentState: PropTypes.object,
  };

  renderInFlatList() {
    const {config: {className}, onClick} = this.props;
    return (
      <div className={classNames(styles.wrapper, className)} aria-label="rdw-save-control">
        <Tooltip placement="top" title="粘贴">
          <Button icon='file-ppt'
            style={{height: '30px', marginRight: '5px', padding: '2px 10px'}}
            type={'default'}
            onClick={() => onClick()}/>
        </Tooltip>
      </div>
    );
  }

  renderInDropDown() {
    return this.renderInFlatList();
  }

  render() {
    const {config: {inDropdown}} = this.props;
    if (inDropdown) {
      return this.renderInDropDown();
    }
    return this.renderInFlatList();
  }
}
