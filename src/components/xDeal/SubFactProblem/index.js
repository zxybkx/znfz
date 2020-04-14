import React, {PureComponent} from 'react';
import {Alert, Icon} from 'antd';
import classnames from 'classnames';
import styles from './index.less';
import Ellipsis from 'lib/Ellipsis';

export default class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {}
  }

  onClick = (data) => {
    this.props.onSubFactClick && this.props.onSubFactClick(data);
  };

  render() {
    const {facts, currentFact} = this.props;

    return (
      <div className={styles.default}>
        {
          facts && facts.map((o, i) => {
            const status = o.dqzt === 1 ? `已审查${o.rdfs ? `,${o.rdfs}` : ''}` : '未审查';
            return (
              <div key={i}
                   onClick={() => this.onClick(o)}
                   className={classnames(styles.item, currentFact === o ? styles.active : '')}
              >
                <Alert
                  message={
                    <div>
                      <Icon type={status === '未审查' ? 'warning' : 'check-square-o'}
                            style={{marginRight: 10, color: status === '未审查' ? '#FF4500' : '#00a854'}}
                      />
                      {o.mergekey}
                      <span style={{marginLeft: 20}}>{status}</span>
                    </div>}
                  // description={<Ellipsis tooltip lines={4}>&emsp;&emsp;{o.rdss}</Ellipsis>}
                  description={o.rdss}
                  type={'info'}
                />
              </div>
            )
          })
        }
      </div>

    );
  }
}
