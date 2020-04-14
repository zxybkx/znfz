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
    const {fullScreen} = this.props;
    return (
      <div className={classNames(styles.wrapper, className)} aria-label="rdw-export-control">
        <Tooltip placement="top" title={fullScreen ? "退出全屏编辑" : "全屏编辑"}>
          <Button icon={fullScreen ? "shrink" : "arrows-alt"}
            style={{height: '30px', marginRight: '5px', padding: '2px 10px'}}
            type={'default'}
            onClick={() => onClick()}>
            {fullScreen ? "退出全屏编辑" : "全屏编辑"}
          </Button>
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
