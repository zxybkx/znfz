import React, {Component} from 'react';
import {Tooltip} from 'antd';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Button} from 'antd';
import Fontawesome from 'react-fontawesome';
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
    const {config: {options, className}, onChange, currentState: {textIndent}} = this.props;
    return (
      <div className={classNames('rdw-text-indent-wrapper', className)} aria-label="rdw-textindent-control">
        <Tooltip placement="top" title="首行缩进">
          <Button
            style={{height: '30px', marginRight: '5px', padding: '2px 10px'}}
            type={textIndent !== 0 ? 'primary' : 'default'}
            onClick={() => onChange('2rem')}
          >
            <Fontawesome name="indent"/>
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
