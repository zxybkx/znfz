import React, {Component} from 'react';
import {Alert, Row, Col, Button, Icon} from 'antd';
import {cursorPosition} from 'utils/utils';
import FrameModal from 'lib/Frame/FrameModal';
import _ from 'lodash';
import styles from './index.less';

export default class MarkInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {documents, match, ajxx, stage} = this.props;
    const {params: {id}} = match;
    const context = process.env.NODE_ENV === 'production' ? '/cm' : '';
    const base = stage === 'ZJ' ? 'zcjd' : 'gsjd';
    const {ajzt} = ajxx;


    const wsData = [];
    _.forEach(documents, (o) => {
      const wsdata = {};
      o.bgrs && o.bgrs.map(i => {
        const wsxx = o.znfz_doc_config.wsmbmc;
        const wss = {'wsmc': wsxx, 'bgr': i};
        wsData.push(wss);
      });
      if (!o.bgrs) {
        _.set(wsdata, 'wsmc', o.znfz_doc_config.wsmbmc);
      }
      wsData.push(wsdata);
    });

    const alertData = _.filter(wsData, obj => {
      return obj.wsmc
    });

    return (
      <div className={styles.default}>
        <Row gutter={16} type="flex"  align="middle">
          {
            alertData && alertData.map((o, i) => {

              const itemData = o.bgr ? {wsmbmc: o.wsmc, bgr: o.bgr} : {wsmbmc: o.wsmc};
              const description =
                <FrameModal title="文书制作"
                            src={`${context}/${base}/xdeal/${id}/document`}
                            params={itemData}
                >
                  <a><Icon type="file-word"
                           style={{marginRight: 10, fontSize: 18}}/>{o.bgr ? o.wsmc + '-' + o.bgr : o.wsmc}</a>
                </FrameModal>;

              return (
                <Col span={6} key={i} className={styles.item}>
                  <Alert
                    description={description}
                    type="info"
                  />
                </Col>
              )
            })
          }
        </Row>
        <div className={styles.sjaj}>
          <Button type='primary'
                  icon='check-circle'
                  disabled={ajzt && ajzt.zt === 9}
                  onClick={() => this.props.finish && this.props.finish()}>
            审结案件
          </Button>
        </div>
      </div>
    );
  }
}
