import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {message, Button, Card, Collapse, Alert} from 'antd';
import {Link, routerRedux} from 'dva/router';
import moment from 'moment';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import FKForm from '../components/FKForm';
import AjxxInfo from '../components/AjxxInfo';
import XtwtInfo from '../components/XtwtInfo';
import DataViewTable from 'lib/DataViewTable';
import styles from './style.less';
import Authorized from 'utils/Authorized';

const {AuthorizedRoute} = Authorized;

const CollapsePanel = Collapse.Panel;

class XtwtReply extends PureComponent {

  componentDidMount() {
    const {dispatch, location: {query}} = this.props;
    dispatch({
      type: 'znfz/getAjxx',
      payload: {
        bmsah: query.bmsah,
      },
    });
    dispatch({
      type: 'wtfk/getXtwt',
      payload: {
        id: query.id,
      },
    })

  }

  onSave = (values) => {
    const {dispatch, wtfk: {model}} = this.props;
    dispatch({
      type: 'wtfk/saveXtwtdf',
      payload: {
        xtwt: model,
        ...values,
      },
    }).then(() => {
      message.success('问题答复操作成功！');
      this.goBack();
    });
  };

  goBack = () => {
    const {dispatch, location: {query}, wtfk: {model}} = this.props;
    if (query.mine) {
      dispatch(routerRedux.push({
        pathname: `/wtfk/mine`,
      }));
    } else {
      dispatch(routerRedux.push({
        pathname: `/wtfk/deal/ajxg`,
        query: {
          bmsah: model.bmsah,
        },
      }));
    }
  };

  render() {

    const {loading, znfz: {ajxx}, wtfk: {model}, location: {query}} = this.props;

    const tabExtra = <Button className={styles.return} type='ghost'
                             onClick={() => {
                               this.goBack();
                             }} icon='rollback'>返回</Button>;

    const tabList = [{
      key: '1',
      tab: '问题答复',
    }, {
      key: '',
      tab: '',
    }];

    return (
      <PageHeaderLayout wrapperClassName={styles.default}
                        tabBarExtraContent={tabExtra}
                        tabList={tabList}>
        <Card>
          <Collapse defaultActiveKey={['2', '3']}>
            <CollapsePanel header={<span style={{padding: '10px 20px', display: 'inline-block'}}>案件基本信息</span>} key='1'>
              <AjxxInfo ajxx={ajxx}/>
            </CollapsePanel>
            <CollapsePanel header={<span style={{padding: '10px 20px', display: 'inline-block'}}>问题详情</span>} key='2'>
              <XtwtInfo model={model}/>
            </CollapsePanel>
            <CollapsePanel header={<span style={{padding: '10px 20px', display: 'inline-block'}}>答复意见</span>} key='3'>
              {
                !query.view && model.dfzt === 0 && <FKForm onSave={this.onSave} loading={loading}/>
              }
              {
                query.view && model.dfzt === 0 && <Alert message="问题还未答复" type="info"/>
              }
              {
                model.dfzt === 1 && (
                  <DataViewTable>
                    <tbody>
                    {
                      model.dfs && model.dfs.map((d, idx) => {
                        return [
                          <tr className={styles.row} key={idx}>
                            <th>处理人</th>
                            <td>{d.clr}</td>
                            <th>处理时间</th>
                            <td>{moment(d.createdDate).format('YYYY-MM-DD  HH:mm:ss')}</td>
                          </tr>,
                          <tr className={styles.row} key={idx + 100}>
                            <th>答复内容</th>
                            <td colSpan={3}>{d.clnr}</td>
                          </tr>
                        ]
                      })
                    }
                    </tbody>
                  </DataViewTable>
                )
              }
            </CollapsePanel>
          </Collapse>
        </Card>
      </PageHeaderLayout>
    );
  }
}

@connect(({znfz, wtfk, loading}) => ({
  znfz,
  wtfk,
  loading: loading.effects['wtfk/saveXtwtdf'],
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <XtwtReply {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}

