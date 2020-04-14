

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {getSelectedBlocksMetadata, setBlockData} from 'draftjs-utils';

import LayoutComponent from './Component';

export default class Button extends Component {

  static propTypes = {
    editorState: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  state = {};

  componentWillMount() {
    const {modalHandler} = this.props;
    modalHandler.registerCallBack(this.expandCollapse);
  }

  componentWillReceiveProps(properties) {
  }

  componentWillUnmount() {
    const {modalHandler} = this.props;
    modalHandler.deregisterCallBack(this.expandCollapse);
  }

  expandCollapse = () => {
    this.setState({
      expanded: this.signalExpanded,
    });
    this.signalExpanded = false;
  };

  onExpandEvent = () => {
    this.signalExpanded = !this.state.expanded;
  };

  doExpand = () => {
    this.setState({
      expanded: true,
    });
  };

  doCollapse = () => {
    this.setState({
      expanded: false,
    });
  };

  onClick = () => {
    const {onClick} = this.props;
    onClick();
  };

  render() {
    const {config} = this.props;
    const {expanded} = this.state;
    return (
      <LayoutComponent
        config={config}
        expanded={expanded}
        onExpandEvent={this.onExpandEvent}
        doExpand={this.doExpand}
        doCollapse={this.doCollapse}
        currentState={{}}
        onClick={this.onClick}
      />
    );
  }
}
