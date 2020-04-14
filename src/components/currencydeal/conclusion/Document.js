import React, {Component} from 'react';
import {Alert, Row, Col, Button, Icon, Collapse} from 'antd';
import NewFrameModal from 'lib/Frame/NewFrameModal';
import _ from 'lodash';
import {PROVENCE_SHORT_CODE} from '../../../constant';
import styles from './index.less';

const {Panel} = Collapse;
export default class MarkInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      documents: []
    };
  }

  componentDidMount() {
    const {dispatch, match, znfz, stage} = this.props;
    const {params: {id}} = match;
    dispatch({//通版
    type: 'znfz/tbflg',
    payload: {
      bmsah: id,
    },
    });

    this.getDocuments();
  }


  onCloseWS = () => {
    this.getDocuments();
  };

  getDocuments = () => {
    const {dispatch, match, stage} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: 'znfz/getWsInfo',
      payload: {
        bmsah: match.params.id,
        dwbm: PROVENCE_SHORT_CODE,
        stage,
      }
    }).then(({success, data}) => {
      if (success && data) {
        const wsData = [];
        _.forEach(data, (o) => {
          const wsdata = {};

          o.bgrs && o.bgrs.map(i => {
            _.set(wsdata, 'bgr', i);
            _.set(wsdata, 'wsmc', o.znfz_doc_config.wsmbmc);
            wsData.push(wsdata);
          });

          o.bgrs ? '' : _.set(wsdata, 'wsmc', o.znfz_doc_config.wsmbmc);

          wsData.push(wsdata);
        });
        this.setState({
          documents: data
        })
      }
    });

    dispatch({
      type: 'znfz/getAjxx',
      payload: {
        bmsah: id,
      },
    });

    dispatch({
      type: `znfz/getTree`,
      payload: {
        bmsah: id,
      },
    });

    dispatch({
      type: `znfz/changeState`,
      payload: {
        stage,
      },
    });
  };


  handleWsData = (data) => {
    const wsData = [];
    _.forEach(data, (o) => {
      const wsdata = {};
      o.bgrs && o.bgrs.map(i => {
        const wsxx = o.znfz_doc_config.wsmbmc;
        const wss = {'wsmc': wsxx, 'bgr': i, type: o.types};
        wsData.push(wss);
      });
      if (!o.bgrs) {
        _.set(wsdata, 'wsmc', o.znfz_doc_config.wsmbmc);
        _.set(wsdata, 'type', o.types);
      }
      wsData.push(wsdata);
    });
    return wsData;
  };

  renderWsRow = (wsData) => {
    const {match, ajxx, stage} = this.props;
    const {znfz: {docTree}} = this.props;
    const {params: {id}} = match;
    const context = process.env.NODE_ENV === 'production' ? '/cm' : '';


    const alertData = _.filter(this.handleWsData(wsData), obj => {
      return obj.wsmc
    });

    return (
      <Row gutter={16} type="flex" align="middle">
        {
          alertData && alertData.map((o, i) => {
            const itemData = o.bgr ? {wsmbmc: o.wsmc, bgr: o.bgr, stage: stage, ajxx: ajxx} : {
              wsmbmc: o.wsmc,
              stage: stage,
              ajxx: ajxx,
              type: 'jl',
              bmsah: ajxx.bmsah,
              docTree: docTree,
              rightSource: `${context}/currencydeal/${ajxx.bmsah}/document`
            };
            const description =
              <NewFrameModal title="文书制作"
                             onClose={this.onCloseWS}
                             params={itemData}
                             src={`${context}/currencydeal/${id}/document`}
              >

                {o.type === '1' ? <a style={{color: 'green'}}><Icon type="file-word"
                                                                    style={{
                                                                      marginRight: 10,
                                                                      fontSize: 18
                                                                    }}/>{o.bgr ? o.wsmc + '-' + o.bgr : o.wsmc}
                </a> :
                  <a style={{color: 'blue'}}><Icon type="file-word"
                                                   style={{
                                                     marginRight: 10,
                                                     fontSize: 18
                                                   }}/>{o.bgr ? o.wsmc + '-' + o.bgr : o.wsmc}</a>}
              </NewFrameModal>;

            return (
              <Col span={6} key={i} className={styles.item}>
                <Alert
                  description={description}
                  type={o.type === '1' ? "success" : "info"}
                />
              </Col>
            )
          })
        }
      </Row>
    )
  };

  render() {
    const {ajxx, stage, jlzt, ysay} = this.props;
    const {documents} = this.state;
    const {ajzt} = ajxx;

    const factGroup = _.filter(documents, o => {
      return o && (o.znfz_doc_config.proof === 'fact' || o.znfz_doc_config.proof === 'fact-evi')
    });
    const evidenceGroup = _.filter(documents, o => {
      return o && (o.znfz_doc_config.proof === 'evi' || o.znfz_doc_config.proof === 'fact-evi')
    });

    const alertData = this.renderWsRow(documents);
    const factAlertData = this.renderWsRow(factGroup);
    const evidenceAlertData = this.renderWsRow(evidenceGroup);

    const customPanelStyle = {
      background: '#e3e3e3',
      borderRadius: 4,
      marginBottom: 14,
      border: 0,
      overflow: 'hidden',
    };

    return (
      <div className={styles.default}>
        {
          //如果ysay是盗窃罪，则显示这个pannel，否则显示alertData
          // ysay === '盗窃罪' && this.props.znfz.tbflg.tbflag !== 'T'? 
          //   <Collapse defaultActiveKey={['1']} className={styles.coll}>
          //     <Panel header={<span>事实分组式举证</span>} style={customPanelStyle} 
          //     key="1">
          //       {factAlertData}
          //     </Panel>
          //     <Panel header={<span>证据罗列式举证</span>} key="2" >
          //       {evidenceAlertData}
          //     </Panel>
          //   </Collapse>
          //   :
            <Collapse defaultActiveKey={['1']} className={styles.coll}>
              <Panel header={<span>文书列表</span>} key="1" >
                {alertData}
              </Panel>
            </Collapse>
        }
        {stage === 'SP' ?
          <div className={styles.sjaj}>
            <Button type='primary'
                    icon='check-circle'
                    disabled={jlzt && jlzt === 9}
                    onClick={() => this.props.spFinish && this.props.spFinish()}>
              审结案件
            </Button>
          </div>
          :
          <div className={styles.sjaj}>
            <Button type='primary'
                    icon='check-circle'
                    disabled={ajzt && ajzt.zt === 9}
                    onClick={() => this.props.finish && this.props.finish()}>
              审结案件
            </Button>
          </div>
        }
      </div>
    );

  }
}
