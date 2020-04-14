

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {getSelectedBlocksMetadata, setBlockData} from 'draftjs-utils';

import LayoutComponent from './Component';

export default class Button extends Component {

  static propTypes = {
    editorState: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    modalHandler: PropTypes.object,
    config: PropTypes.object,
  };

  state = {
    currentTextIndent: 0,
  };

  componentWillMount() {
    const {modalHandler} = this.props;
    modalHandler.registerCallBack(this.expandCollapse);
  }

  componentWillReceiveProps(properties) {
    if (properties.editorState !== this.props.editorState) {
      this.setState({
        currentTextIndent: getSelectedBlocksMetadata(properties.editorState).get('text-indent') || 0,
      });
    }
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

  addBlockIndentData = (value) => {
    const {editorState, onChange} = this.props;
    const {currentTextIndent} = this.state;
    if (currentTextIndent !== value) {
      onChange(setBlockData(editorState, {'text-indent': value}));
    } else {
      onChange(setBlockData(editorState, {'text-indent': 0}));
    }
  };

  render() {
    const {config} = this.props;
    const {expanded, currentTextIndent} = this.state;
    return (
      <LayoutComponent
        config={config}
        expanded={expanded}
        onExpandEvent={this.onExpandEvent}
        doExpand={this.doExpand}
        doCollapse={this.doCollapse}
        currentState={{textIndent: currentTextIndent}}
        onChange={this.addBlockIndentData}
      />
    );
  }
}
