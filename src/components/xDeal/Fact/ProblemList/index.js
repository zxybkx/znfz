import React, {PureComponent} from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import {Icon} from 'antd';
import styles from './index.less';

export default class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      current: props.data || [],
      searchValue: ''
    }
  }

  componentWillReceiveProps(nextProps) {
    let current = nextProps.data;
    this.setState({
      current: current,
    });
  }

  onClick = (o) => {
    this.props.onListClick && this.props.onListClick(o);
  };

  renderProblemList = (problemList) => {
    const {searchValue = ''} = this.state;
    return problemList && problemList.map((o, i) => {
        const index = o.gzmc.search(searchValue);
        const beforeStr = o.gzmc.substr(0, index);
        const afterStr = o.gzmc.substr(index + searchValue && searchValue.length);

        if (index >= 0) {
          return (
            <div key={i} className={classnames(styles.problemItem, this.props.active === o.keyid ? styles.active : '')}>
              <div className={styles.left} 
              style={{color:o.znfz_icon.color}}>
                <Icon type={o.znfz_icon && o.znfz_icon.icon}/>
              </div>
              <div className={styles.middle}>
                <a onClick={() => this.onClick(o)} className={`${o.keyid.replace('/', '_')}`}>
                  {beforeStr}
                  <span style={{color: 'red'}}>{searchValue}</span>
                  {afterStr}
                </a>
              </div>
            </div>
          )
        }

      });
  };

  render() {

    const {current} = this.state;

    return (
      <div className={styles.default}>
        <div className={styles.list} ref={ c => this.container = c}>
          {this.renderProblemList(current)}
        </div>
      </div>
    )
  }
}
