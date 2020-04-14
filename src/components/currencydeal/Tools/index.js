import React, {PureComponent} from 'react';
import {Icon, Tooltip} from 'antd';
import FrameModal from 'lib/Frame/FrameModal';
import {connect} from 'dva';
import NewFrameModal from 'lib/Frame/NewFrameModal';
import AjxxModal from '../../Deal/AjxxModal';
import Session from 'utils/session';
import styles from './index.less';

const qs = require("querystring");
const context = process.env.NODE_ENV === 'production' ? '/cm' : '';

@connect(({global, znfz, zcjd, loading}) => ({
  global,
  znfz,
  zcjd
}))
export default class Tools extends PureComponent {
  constructor(props) {
    super(props)

  }

  componentDidMount() {

  }

  getMenus = () => {
    const {ajxx, stage} = this.props;
    const {znfz: {docTree}} = this.props;

    const params = {
      bmsah: ajxx.bmsah,
      ajxx: ajxx,
      tysah: ajxx.tysah,
      ysay: ajxx.ysay_aymc,
      stage,
      docTree: docTree,
      rightSource: `${context}/currencydeal/${ajxx.bmsah}/document`,
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
      <div className={styles.menu}>
        {
          this.props.znfz.tbflg.tbflag !== 'T' ?
            <div className={styles.item}>
              <NewFrameModal title="文书制作"
                             src={`${context}/currencydeal/${ajxx.bmsah}/document`}
                             params={params}
                             icon="form">
                <Tooltip placement="top" title='文书制作'>
                  <div><Icon type='form'/>文书制作</div>
                </Tooltip>
              </NewFrameModal>
            </div>
            : ''
        }

        <div className={styles.item}>
          <AjxxModal {...this.props}>
            <Tooltip placement="top" title='案件信息'>
              <div><Icon type='profile'/>案件信息</div>
            </Tooltip>
          </AjxxModal>
        </div>
        {
          electronEnv &&
          <div className={styles.item}>
            <Tooltip placement="top" title='打开案卡'>
              <a href={`akfile://completed?${qs.stringify(akParams)}`} onClick={() => {
                this.sendAKUser(akParams)
              }}>
                <div><Icon type="snippets"/></div>
              </a>
            </Tooltip>
          </div>
        }
      </div>
    );
  };

  sendAKUser = (data) => {
    this.props.dispatch({
      type: 'znfz/sendAKUser',
      payload: data
    })
  };

  render() {
    return (
      <div className={styles.default} ref={c => this.container = c}>
        {this.getMenus()}
      </div>
    )
  }
}
