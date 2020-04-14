import React, {PureComponent} from 'react';
import {Scrollbars} from 'react-custom-scrollbars';
import styles from './index.less';

export default class CustomScrollbars extends PureComponent {
  render() {
    return (
      <Scrollbars {...this.props}
                  renderTrackHorizontal={props => <div {...props} className={styles.trackHorizontal}/>}
                  renderTrackVertical={props => <div {...props} className={styles.trackVertical}/>}
                  renderThumbHorizontal={props => <div {...props} className={styles.thumbHorizontal}/>}
                  renderThumbVertical={props => <div {...props} className={styles.thumbVertical}/>}
                  renderView={props => <div {...props} className={styles.view}/>}>
        {this.props.children}
      </Scrollbars>
    );
  }
}
