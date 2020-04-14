import React, {PureComponent} from 'react';
import {Alert, Icon} from 'antd';
import classnames from 'classnames'
import styles from './index.less';
import _ from 'lodash';


export default class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {}
  }

  onClick = (data) => {
    this.props.onSubClick && this.props.onSubClick(data);
  };

  render() {
    let {subProblemList, mergekey} = this.props;
    const unHandle = _.filter(subProblemList, o => o && o.znfz_icon.color === '#f04134');
    const warn = _.filter(subProblemList, o => o && o.znfz_icon.color === '#ffbf00');
    const illegal = _.filter(subProblemList, o => o && o.znfz_icon.color === '#02d80c');
    const legal = _.filter(subProblemList, o => o && o.znfz_icon.color === '#0efdff');
    const confirmExit = _.filter(subProblemList, o => o && o.znfz_icon.color === '#21aeff');
    const autoPass = _.filter(subProblemList , o => o && o.znfz_icon.color === '#00a854');
    //const handled = _.filter(subProblemList, o => o && o.znfz_icon.color === '#00e5f9');

    subProblemList = [...unHandle, ...warn, ...illegal, ...legal, ...confirmExit, ...autoPass];

    return (
      <div className={styles.default}>
        {
          subProblemList && subProblemList.map((o, i) => {
            const icon = o.znfz_icon.name;

            const newWtms = o.wtms.split('<br/>');
            let description = newWtms && newWtms.length > 1 ? newWtms.map((item, index) => {
              return <span key={index}>{item}<br/></span>
            }) : <span>
              {o.wtms}
            </span>;

            const type = icon === '疑点' ? 'error' : icon === '重点' ? 'warning' : icon === '确认非法' ? 'info' : 'success';
            return (
              <div key={i}
                   onClick={() => this.onClick(o)}
                   className={classnames(styles.item, mergekey === o.mergekey ? styles.active : '')}
              >
                <Alert
                  message={<div>
                    <Icon type={o.znfz_icon.icon} style={{color: o.znfz_icon.color, marginRight: 10}}/>
                    {o.mergekey}
                  </div>}
                  description={description}
                  type={type}
                  // showIcon
                />
              </div>
            )
          })
        }
      </div>

    );
  }
}
