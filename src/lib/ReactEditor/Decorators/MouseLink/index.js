import React, { Component } from 'react';
import PropTypes from 'prop-types';

function findLinkEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'MouseLink'
      );
    },
    callback,
  );
}

function getMouseLinkComponent(config) {
  return class MouseLink extends Component {

    static propTypes = {
      entityKey: PropTypes.string.isRequired,
      children: PropTypes.array,
      contentState: PropTypes.object,
    };

    state = {
    };

    render() {
      const { children, entityKey, contentState } = this.props;
      const { key } = contentState.getEntity(entityKey).getData();
      const {linkClickHandler} = config;
      return (
        <span data-offset-key={this.props.offsetkey} className="rdw-link-decorator-wrapper">
          <a  href="javascript:void(0)"
              onDoubleClick={() => linkClickHandler(key.name, key.coords)}>{children}</a>
        </span>
      );
    }
  };
}

export default config => ({
  strategy: findLinkEntities,
  component: getMouseLinkComponent(config),
});
