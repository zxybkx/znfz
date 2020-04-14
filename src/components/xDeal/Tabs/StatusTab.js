import React, {PureComponent, Fragment} from 'react';
import {Icon, Divider} from 'antd';
import classnames from 'classnames';
import _ from 'lodash';
import styles from './StatusTab.less';


export default class StatusTab extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      active: props.showTotal ? props.currentStatus ? props.currentStatus : '全部' : '',
      showTotal: props.showTotal || false,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      active: nextProps.showTotal ? nextProps.currentStatus ? nextProps.currentStatus : '全部' : '',
    })
  }

  // 切换状态，向父组件返回key值
  onTabClick = (key) => {
    this.setState({active: key}, ()=> {
      const {onClick} = this.props;
      onClick && onClick(key);
    });
  };

  render() {
    const {data, className = '', style = {}, theme = 'dark'} = this.props;
    const {active, showTotal} = this.state;
    let _data = [];

    if(!_.isEmpty(data)) {
      if (showTotal) {
        _data.push({
          title: '全部',
          count: data.reduce((sum, v) => sum += v.count, 0),
          iconConfig: {},
        }, ...data);
      } else {
        _data.push(...data);
      }
    }

    return (
      <div className={classnames(styles.default, styles[theme], className)} style={style}>
        {
          _data && _data.map((o, i) => {
            return (
              <Fragment key={o.title}>
                <a className={classnames(styles.item, active === o.title ? styles.active : '')}
                   onClick={() => this.onTabClick(o.title)}>
                  <Icon type={o.title === '全部' ? 'profile' : o.iconConfig.icon}
                               style={{color: o.iconConfig.color}}/>
                  {o.title}({o.count})
                  </a>
                {
                  i !== _data.length -1 && <Divider type='vertical'/>
                }
              </Fragment>
            )
          })
        }
      </div>
    );
  }
}
