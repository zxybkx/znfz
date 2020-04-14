import React, {PureComponent} from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import $ from 'jquery';
import {Icon, Input} from 'antd';
import {StatusTab} from '../Tabs';
import styles from './index.less';

const Search = Input.Search;

export default class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      list: props.data || [],
      current: props.data || [],
      active: '',
      currentStatus: '全部',
      searchValue: ''
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.data, this.props.data) && !_.isEmpty(nextProps.data)) {
      const data = _.orderBy(nextProps.data, d => [d.znfz_icon.orderby, d.gzmc]);
      const {currentStatus, active} = this.state;
      const current = nextProps.currentStatus ?
        _.filter(data, d => d.dqzt === nextProps.currentStatus) :
        currentStatus === '全部' ? data : _.filter(data, d => d.dqzt === currentStatus);
      const activeExist = _.findIndex(current, d => d.keyid === active) >= 0;
      // console.log(nextProps.keyid);
      let _active = nextProps.keyid ? nextProps.keyid :
        activeExist ? active : current && _.get(current, '0.keyid');
      this.setState({
        list: data,
        currentStatus: nextProps.currentStatus,
        current,
        active: _active,
      }, () => {
        this.onClick(_active);
      });
    }
  }

  onClick = (keyid) => {
    if (_.isEmpty(keyid)) {
      return false;
    }
    this.setState({active: keyid}, () => {
      const {onClick} = this.props;
      const current = _.find(this.state.current, d => d.keyid === keyid);
      !_.isEmpty(current) && onClick && onClick(current);

      try {
        const offset = $(`a.${keyid.replace('/', '_')}`).offset();
        const parentOffset = $(this.container).offset();
        const height = $(this.container).height();
        if (offset.top - parentOffset.top > height) {
          this.container && this.container.scrollTo && this.container.scrollTo(0, offset.top - parentOffset.top);
        }
      } catch (e) {
      }
    });
  };


  changeStatus = (key) => {
    const {list} = this.state;
    const current = key === '全部' ? list : _.filter(list, d => d.dqzt === key);
    const active = current && _.get(current, '0.keyid');
    this.setState({
      currentStatus: key,
      current,
      active,
    }, () => {
      this.props.onProblemFilter && this.props.onProblemFilter(key);
      this.onClick(active);
    })
  };

  getStatusSet = (list) => {
    let _dqztSet = list.map(d => ({title: d.dqzt, iconConfig: d.znfz_icon}));
    _dqztSet = _.uniqBy(_dqztSet, 'title');
    _dqztSet = _dqztSet.map(zt => {
      zt.count = list.filter(d => d.dqzt === zt.title).length;
      return zt;
    });
    _dqztSet = _.sortBy(_dqztSet, d => d.iconConfig.orderby);
    return _dqztSet;
  };


  onChange = (e) => {
    const value = e.target.value;
    this.setState({
      searchValue: value,
    });
  };

  renderProblemList = (problemList) => {
    const {searchValue = ''} = this.state;
    const {active} = this.state;
    return problemList && problemList.map((o, i) => {
        const index = o.gzmc.search(searchValue);
        const beforeStr = o.gzmc.substr(0, index);
        const afterStr = o.gzmc.substr(index + searchValue && searchValue.length);

        if (index >= 0) {
          return (
            <div key={i} className={classnames(styles.problemItem, active === o.keyid ? styles.active : '')}>
              <div className={styles.left} style={{color: o.znfz_icon && o.znfz_icon.color}}>
                <Icon type={o.znfz_icon && o.znfz_icon.icon}/>
              </div>
              <div className={styles.right}>
                <a onClick={() => this.onClick(o.keyid)} className={`${o.keyid.replace('/', '_')}`}>
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

    const {list, current, currentStatus} = this.state;

    const statusList = this.getStatusSet(list);

    return (
      <div className={styles.default}>
        <StatusTab showTotal currentStatus={currentStatus} data={statusList} onClick={this.changeStatus}/>
        <Search style={{width: '90%', margin: '10px 0'}} placeholder="查找..." onChange={this.onChange}/>
        <div className={styles.list} ref={ c => this.container = c}>
          {this.renderProblemList(current)}
        </div>
      </div>
    )
  }
}
