import React, {PureComponent, Fragment} from 'react';
import {Icon, Tooltip, Divider} from 'antd';
import FrameModal from 'lib/Frame/FrameModal';
import Session from 'utils/session';
import AjxxModal from '../AjxxModal';
import styles from './index.less';
import {PROVENCE_CODE} from '../../../constant';
const qs = require("querystring");

export default class Tools extends PureComponent {

  render() {
    const {ajxx} = this.props;
    const params = {
      bmsah: ajxx.bmsah,
      tysah: ajxx.tysah,
      ysay: ajxx.ysay_aymc,
    };

    const tools = require('../../../common/tools.json');
    const lx = tools.lx;
    const la = tools.la;


    const electronEnv = navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0;
    const session = Session.get();
    const akParams = {
      bmsah: ajxx.bmsah,
      dwbm: session.dwbm,
      gh: session.gh
    };

    return (
      <div className={styles.default}>
        {
          PROVENCE_CODE === '530' && (
            <Fragment>
            <Tooltip title='编目调整'><a href={`/bm/main?bmsah=${ajxx.bmsah}&ajmc=${ajxx.ajmc}`} target={'_blank'}><Icon type='bars'/></a></Tooltip>
            <Divider type="vertical"/>
            </Fragment>
          )
        }
        <AjxxModal {...this.props}>
          <Tooltip title='案件信息'><a><Icon type='profile'/></a></Tooltip>
        </AjxxModal>
        <Divider type="vertical"/>
        {
          electronEnv &&
          <Fragment>
            <Tooltip title='打开案卡'><a href={`akfile://completed?${qs.stringify(akParams)}`}><Icon type='snippets'/></a></Tooltip>
            <Divider type="vertical"/>
          </Fragment>
        }
        <FrameModal title="量刑辅助"
                    src={`/lxfz/${lx[ajxx.ysay_aymc]}`}
                    params={params}
                    icon="api">
          <Tooltip title='量刑辅助'><a><Icon type='api'/></a></Tooltip>
        </FrameModal>
        <Divider type="vertical"/>
        <FrameModal src={`/latj/${la[ajxx.ysay_aymc]}`}
                    params={params}
                    title="类案推荐"
                    icon="share-alt">
          <Tooltip title='类案推荐'><a><Icon type='share-alt'/></a></Tooltip>
        </FrameModal>
      </div>
    )
  }
}
