import React, {PureComponent} from 'react';
import {Col, Menu, Dropdown, Icon} from 'antd';
import _ from 'lodash';
import BooleanTag from 'lib/BooleanTag';
import styles from './FormComponent.less';

const {SubMenu} = Menu;
export default class BoolNlp extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      list: props.list,
      listWithProperty: _.filter(props.list, d => d.property && (d.content === '否' || d.content === '')),
      listWithoutProperty: _.filter(props.list, d => !d.property || d.content === '是'),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.list, nextProps.list)) {
      this.setState({
        list: nextProps.list,
        listWithProperty: _.filter(nextProps.list, d => d.property && (d.content === '否' || d.content === '')),
        listWithoutProperty: _.filter(nextProps.list, d => !d.property || d.content === '是'),
      });
    }
  }

  onMenuClick = (path) => {
    const {listWithProperty, listWithoutProperty} = this.state;
    const addItem = _.find(listWithProperty, d => d.path === path);
    addItem.content = '是';
    const _listWithProperty = _.omitBy(listWithProperty, d => d.path === path);
    const _listWithoutProperty = [];
    _listWithoutProperty.push(...listWithoutProperty, addItem);
    this.setState({
      listWithProperty: _listWithProperty,
      listWithoutProperty: _listWithoutProperty,
    }, () => {
      this.save(addItem, true);
    })
  };

  save = (item, value) => {
    delete item.property;
    this.props.onSave && this.props.onSave(item, value);
  };

  render = () => {
    const {listWithProperty, listWithoutProperty} = this.state;
    const {onlyBool} = this.props;
    let map = _.groupBy(listWithProperty, 'property.[1]');
    let _map = {};
    _.map(_.sortBy(_.keys(map)), k => _.set(_map, k, _.get(map, k)));
    const others = (
      <Menu onClick={({key}) => this.onMenuClick(key)}>
        {
          _.map(_map, (v, k) => {
            if (k === 'undefined') {
              return _.map(v, d => <Menu.Item key={d.path}>{d.label}</Menu.Item>)
            } else {
              const title = k.substr(k.indexOf('|') + 1);
              return (
                <SubMenu title={title} key={k}>
                  {
                    _.map(v, d => <Menu.Item key={d.path}>{d.label}</Menu.Item>)
                  }
                </SubMenu>
              )
            }
          })
        }
      </Menu>
    );
    return (
      <Col className={styles.formItem}>
        {onlyBool ? null : <div className={styles.label}>其它</div>}
        <div className={styles.content}>
          {
            listWithoutProperty && listWithoutProperty.map(d => (
              <BooleanTag onChange={(value) => this.save(d, value)} key={d.path}
                          checked={d.content === '是'}>
                {d.label}
              </BooleanTag>
            ))
          }
          {
            !_.isEmpty(listWithProperty) && (
              <Dropdown overlay={others}>
                <a style={{paddingLeft: 10}}><Icon type='plus-circle'/> 更多</a>
              </Dropdown>
            )
          }
        </div>
      </Col>
    )
  };
}
