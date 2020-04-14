import React, {PureComponent} from 'react';
import {Table, Input} from 'antd';
import _ from 'lodash';
import FrameModal from 'lib/Frame/FrameModal';
import FactDetailModal from '../FactDetailModal';
import styles from './index.less';
import Ellipsis from 'lib/Ellipsis';

const {TextArea} = Input;

export default class VerbalTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {}
  }

  getNormalData = (data) => {
    const tableData = [];
    _.map(data, (item) => {
      item.yczjs && _.map(item.yczjs, (o) => {
        const tableItem = {};
        _.set(tableItem, 'id', o.id);
        _.set(tableItem, 'type', o.type);
        _.set(tableItem, 'owner', o.owner);
        _.set(tableItem, '供述摘录', o.gszy);
        _.set(tableItem, 'cs', _.toNumber(o.cs.replace(/[^0-9]/ig, '')));
        _.set(tableItem, 'fxjl', o.fxjl || '');
        _.map(o.aqjxdata, (v, k) => {
          _.set(tableItem, k, v);
        });
        tableData.push(tableItem)
      })
    });
    return tableData.sort((item1, item2) => this.compare(item1.type) - this.compare(item2.type));
    // return _.orderBy(tableData, ['owner','cs'], ['asc','asc']);
  };

  compare = (type) => {
    const sourceArr = ["犯罪嫌疑人供述和辩解", "被害人陈述", "证人证言"];
    return sourceArr.indexOf(type)
  };

  render() {
    const {
      saveFxjl, ajxx, data, currentFact, dispatch, match, znfz,
      facts, stage, ysay, onClose, getFacts
    } = this.props;
    const {params: {id}} = match;
    let newYczj = currentFact.owners;

    const columns = [{
      title: '事实要素',
      dataIndex: 'owner',
      key: 'owner',
      width: 100,
      render: (text, record, index) => {
        let newYczjDetail = [];
        let currentList = {};
        let newIndex;

        if (newYczj && newYczj.length > 0) {
          currentList = _.find(newYczj, (o) => o.owner === record.owner);

          newYczjDetail = currentList.yczjs && currentList.yczjs.map((item, index) => {
              let orderCs = item.cs.replace(/[^0-9]/ig, "");
              return ({
                key: orderCs,
                title: `${item.type}（${item.owner}）${item.cs}`,
                type: item.type,
                filekey: item.filekey,
                owner: item.owner,
              })
            })
        }

        newIndex = _.find(currentList && currentList.yczjs, (o) => o.id === record.id);

        const YczjDetailProps = {
          data: {
            jsondata: {
              data: _.orderBy(newYczjDetail, ['key'], ['asc'])
            }
          },
          dispatch: dispatch,
          match: match,
          ajxx: ajxx,
          znfz: znfz,
          loading: false,
          id: id, facts, stage,
          ysay: ysay,
          onClose,
          getFacts,
        };

        let newDetail = currentList && currentList.yczjs ? currentList.yczjs.map((item, index) => {
          return ({
            ...item,
            cs: item.cs.replace(/[^0-9]/ig, "")
          })
        }) : [];

        return (
          <FactDetailModal {...YczjDetailProps} currentIndex={_.findIndex(_.orderBy(newDetail, ['cs'], ['asc']), {
            ...newIndex,
            cs: newIndex.cs.replace(/[^0-9]/ig, "")
          })}>
            <a>{text}</a>
          </FactDetailModal>
        )
      }
    }, {
      title: '次数',
      dataIndex: 'cs',
      key: 'cs',
      width: 50,
    }, {
      title: '案情解析',
      dataIndex: '案情解析',
      key: '案情解析',
      children: [
        {
          title: '时间',
          dataIndex: '时间',
          key: '时间',
          width: 120,
          render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={6}
                                              tooltip>{text && text.content}</Ellipsis>
        }, {
          title: '地点',
          dataIndex: '地点',
          key: '地点',
          width: 120,
          render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={6}
                                              tooltip>{text && text.content}</Ellipsis>
        }, {
          title: '被害人',
          dataIndex: '被害人',
          key: '被害人',
          width: 120,
          render: (text, record) => {
            const bhr = text && text[0] && _.get(text[0], '姓名') && _.get(text[0], '姓名').content;
            return <Ellipsis style={{display: 'inline', width: 'auto'}} length={6}
                             tooltip>{Array.isArray(bhr) ? _.join(bhr, '、') : bhr}</Ellipsis>
          }
        }, {
          title: '参与人',
          dataIndex: '参与人',
          key: '参与人',
          width: 120,
          render: (text, record) => {
            const cyr = text && text[0] && _.get(text[0], '姓名') && _.get(text[0], '姓名').content;
            return <Ellipsis style={{display: 'inline', width: 'auto'}} length={6}
                             tooltip>{Array.isArray(cyr) ? _.join(cyr, '、') : cyr}</Ellipsis>
          }
        }, {
          title: '盗窃手段',
          dataIndex: '盗窃手段',
          key: '盗窃手段',
          width: 120,
          render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={6}
                                              tooltip>{text && text.content}</Ellipsis>
        }, {
          title: '盗窃类型',
          dataIndex: '盗窃类型',
          key: '盗窃类型',
          width: 120,
          render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={6}
                                              tooltip>{text && text.content}</Ellipsis>
        }, {
          title: '财物',
          dataIndex: '财物',
          key: '财物',
          width: 120,
          render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={6}
                                              tooltip>{text && text.content}</Ellipsis>
        }, {
          title: '价值',
          dataIndex: '价值',
          key: '价值',
          width: 120,
          render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={6}
                                              tooltip>{text && text.content}</Ellipsis>
        }, {
          title: '分工作用',
          dataIndex: '分工作用',
          key: '分工作用',
          width: 120,
          render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={6}
                                              tooltip>{text && text.content}</Ellipsis>
        }, {
          title: '分赃及去向',
          dataIndex: '分赃及去向',
          key: '分赃及去向',
          width: 120,
          render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={6}
                                              tooltip>{text && text.content}</Ellipsis>
        },
      ],
    }, {
      title: '供述摘录',
      dataIndex: '供述摘录',
      key: '供述摘录',
      width: 200,
      render: (text, record) => <Ellipsis style={{display: 'inline', width: 'auto'}} length={48}
                                          tooltip>{text}</Ellipsis>
    }, {
      dataIndex: 'fxjl',
      title: '分析结论',
      width: 200,
      render: (text, record) =>
        <TextArea defaultValue={text}
                  onBlur={e => saveFxjl(e, record)} autosize={{minRows: 3, maxRows: 20}}/>
    }];

    return (
      <div className={styles.default}>
        <Table rowKey={() => Math.random()}
               columns={columns}
               bordered={true}
               pagination={false}
               dataSource={_.orderBy(this.getNormalData(data), ['owner', 'cs'], ['asc', 'asc'])}
               scroll={{x: 1750, y: 300}}
        />
      </div>
    )
  }
}


