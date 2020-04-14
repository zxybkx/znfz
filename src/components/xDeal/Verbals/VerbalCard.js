import React, {PureComponent, Fragment} from 'react';
import {Row, Col, Card, Form, Tooltip, Button, Icon, Divider, Table, Input, Switch, Radio} from 'antd';
import classnames from 'classnames';
import _ from 'lodash';
import Ellipsis from 'lib/Ellipsis';
import BooleanTag from 'lib/BooleanTag';
import styles from './VerbalCard.less';

const {TextArea} = Input;
const {Group: RadioGroup, Button: RadioButton} = Radio;

@Form.create({
  onFieldsChange: (props, fields) => {
    const {item: {owners}, owner, dispatch} = props;
    let currentOwner = _.find(owners, o => o.owner === owner);
    if (currentOwner && currentOwner.id) {
      const mdxq = _.get(fields, 'mdxq');
      if (mdxq) {
        const {name, value} = mdxq;
        _.set(currentOwner, name, value);
        currentOwner.dqzt = 1;
        dispatch({
          type: 'znfz/updateFactOwner',
          payload: {
            data: currentOwner,
          },
        });
      }
    }
  },
})
class Item extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      current: '11',
    }
  }

  getColumns = (currentOwner, list) => {

    const onOwnerMddChange = (key, flag) => {
      const {form: {setFieldsValue}} = this.props;
      if (!_.isEmpty(currentOwner.mdddata)) {
        _.set(currentOwner.mdddata, key, flag ? '是' : '否');

        let mdxq = '';
        _.forEach(currentOwner.mdddata, (v, k) => {
          if (v === '是') {
            mdxq += `【${k}】有矛盾; `;
          }
        });
        setFieldsValue({'mdxq': mdxq})
      }
    };

    const Mdd = ({data}) => {
      //owner表不存在mdd数据的时候，加载数据时初始化
      if (_.isEmpty(currentOwner.mdddata) && data.aqjxdata) {
        currentOwner.mdddata = {};
        _.map(data.aqjxdata, (v, k) => _.set(currentOwner.mdddata, k, '否'));
      }

      return (
        <div className={styles.mdd}>
          {
            _.map(currentOwner.mdddata, (v, k) => <BooleanTag key={k} checked={v !== '否'}
                                                              onChange={(flag) => onOwnerMddChange(k, flag)}>{k}</BooleanTag>)
          }
        </div>
      )
    };

    const onYcFgChange = (flag, data) => {
      const {dispatch} = this.props;
      data.sffg = flag ? 1 : 0;
      dispatch({
        type: 'znfz/updateYczj',
        payload: {
          data,
        },
      });
    };
    const columns = [{
      title: '次数',
      dataIndex: 'cs',
      key: 'cs',
      width: '8%',
    }, {
      title: '供述摘录',
      dataIndex: 'gszy',
      key: 'gszy',
    }, {
      title: '矛盾点',
      dataIndex: 'mdd',
      key: 'mdd',
      width: '30%',
      render: (value, row, index) => {
        const obj = {
          children: <Mdd data={row}/>,
          props: {},
        };
        if (index === 0) {
          obj.props.rowSpan = list.length;
        } else {
          obj.props.rowSpan = 0;
        }
        if (list.length > 1) {
          return obj;
        } else {
          return null;
        }
      },
    }, {
      title: '翻供',
      dataIndex: 'sffg',
      key: 'sffg',
      width: '8%',
      render: (text, record) => <Switch onChange={(flag) => onYcFgChange(flag, record)} checkedChildren="是"
                                        unCheckedChildren="否" defaultChecked={record.sffg === 1}/>,
    }];

    return columns;
  };

  onOwnerFgChange = (flag, data) => {
    data.sffg = flag ? 1 : 0;
    this.saveFactOwner(data);
  };

  saveFactOwner = (currentOwner) => {
    const {dispatch} = this.props;
    currentOwner.dqzt = 1;
    dispatch({
      type: 'znfz/updateFactOwner',
      payload: {
        data: currentOwner,
      },
    });
  };

  render() {
    const {item: {mergekey, rdss, owners}, owner, type, form: {getFieldDecorator}} = this.props;
    let yczjs = [];
    let hasGS = false;
    let currentOwner = _.find(owners, o => o.owner === owner);
    if (currentOwner && currentOwner.id) {
      hasGS = true;
      yczjs = _.orderBy(currentOwner.yczjs, v => _.toNumber(v.cs.replace(/[^0-9]/ig, '')));
    }

    return (
      <div className={styles.item} id={mergekey}>
        {
          !hasGS && (
            <div className={styles.card}>
              <div className={styles.title}>
                <Tooltip title={`无${type}`}>
                  <Icon className={classnames(styles.Icon, 'color-orange')}
                        type={'question-circle'}/> {mergekey}
                </Tooltip>
                <Divider type="vertical"/>
                <span className={styles.fact}>
                  <Ellipsis style={{display: 'inline', width: 'auto'}} length={80} tooltip>{rdss}</Ellipsis>
                </span>
              </div>
            </div>
          )
        }
        {
          hasGS && currentOwner && (
            <Fragment>
              <Button className={styles.trigger} type="primary" icon="save" shape={'circle'}
                      onClick={() => this.saveFactOwner(currentOwner)}>
              </Button>
              <div className={styles.card}>
                <div className={styles.title}>
                  <Tooltip title={currentOwner.dqzt === 0 ? '待处理' : '已处理'}>
                    <Icon className={classnames(styles.Icon, currentOwner.dqzt === 0 ? 'color-blue' : 'color-green')}
                          type={currentOwner.dqzt === 0 ? 'clock-circle' : 'check-circle'}/> {mergekey}
                  </Tooltip>
                  <Divider type="vertical"/>
                  <span className={styles.fact}>
                    <Ellipsis style={{display: 'inline', width: 'auto'}} length={80} tooltip>{rdss}</Ellipsis>
                  </span>
                </div>
                <div className={styles.body}>
                  <Table rowkey={record => record.id || Math.random()}
                         columns={this.getColumns(currentOwner, yczjs)}
                         bordered={true}
                         pagination={false}
                         dataSource={yczjs}
                         scroll={{x: false, y: 250}}/>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Card title='矛盾详情'
                            extra={<BooleanTag checked={currentOwner.sffg === 1}
                                               onChange={(flag) => this.onOwnerFgChange(flag, currentOwner)}>翻供</BooleanTag>}>
                        {
                          getFieldDecorator(`mdxq`, {
                            initialValue: currentOwner && currentOwner.mdxq || '',
                          })(<TextArea style={{height: '100%'}}/>)
                        }
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card title='阅卷结论'>
                        <RadioGroup defaultValue={currentOwner.yjjl}
                                    buttonStyle="solid"
                                    onChange={e => {
                                      currentOwner.yjjl = e.target.value;
                                      this.saveFactOwner(currentOwner);
                                    }}>
                          <RadioButton value="无供述">无供述</RadioButton>
                          <RadioButton value="供述稳定">供述稳定</RadioButton>
                          <RadioButton value="有反复，但基本稳定">有反复，但基本稳定</RadioButton>
                          <RadioButton value="有矛盾">有矛盾</RadioButton>
                        </RadioGroup>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </div>
            </Fragment>
          )
        }

      </div>
    )
  }
}

export default class VerbalCard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      current: '11',
    }
  }

  render() {

    const {dispatch, data, owner, type} = this.props;
    const _data = _.orderBy(data, v => _.toNumber(v.mergekey.replace(/[^0-9]/ig, '')));

    return (
      <div className={styles.default}>
        {
          _data && _data.map((d, idx) => <Item key={idx} item={d} owner={owner} type={type} dispatch={dispatch}/>)
        }
      </div>
    );
  }
}

