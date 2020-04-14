import React, {Component} from 'react';
import {Card, Spin, Button, message} from 'antd';
import classnames from 'classnames';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import FlowStep from 'components/currencydeal/FlowStep';
import DocPreview from 'components/xDeal/DocPreview';
import NlpInfo from 'components/xDeal/NlpInfo';
import FactInfo from 'components/xDeal/FactInfo';
import SelectFile from 'components/xDeal/SelectFile';
import Tools from 'components/currencydeal/Tools';
import _ from 'lodash';
import styles from './index.less';

export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      facts: [],
      fullScreen: false,
      docNlp: {},
      elseSave: true,
      btnLoading: false,
      visible: '',
      fileImages: [],
      showBtn: false,
      fzdata: {},
      nlpInfoKey: 0,
    }
  }

  componentDidMount = () => {
    const {dispatch, match} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: 'znfz/getNlpConfig',
      payload: {
        name: 'NLP_TITLE',
      },
    });
    dispatch({
      type: 'znfz/getAjxx',
      payload: {
        bmsah: id,
      },
    });
    this.getFileImage()
  };

  getFileImage = () => {
    const {dispatch, match} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: 'znfz/getFilekeyAndChoosed',
      payload: {
        bmsah: id,
      }
    }).then((result) => {
      const {success, data} = result;
      if (success && data) {
        this.setState({
          fileImages: data.filekey,
        });

        if (!data.choosed && data.filekey.length > 1) {
          this.setState({
            visible: 'true',
          })
        } else {
          this.setState({
            visible: 'false',
          });
          this.loadData();

          if (data.filekey.length > 1) {
            this.setState({
              showBtn: true,
            })
          }
        }
      }
    }).catch((error) => {
      message.warning('数据获取失败!')
    });
  };

  loadData = () => {
    const {dispatch, match, stage} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: 'znfz/getNlpByBmsahAndWsmc',
      payload: {
        wsmc: stage === 'ZJ' ? '提请批准逮捕书' : '起诉意见书',
        bmsah: id,
      },
    }).then(({success, data: docNlp}) => {
      if (success && docNlp) {
        dispatch({
          type: 'znfz/getFactListByType',
          payload: {
            bmsah: id,
            type: 0,
          },
        }).then(({success, data}) => {
          if (success && data) {
            this.setState({
              facts: data,
              docNlp: docNlp,
            });
          }
        });
      }
    })
  };

  onCopy = (params) => {
    const {dispatch} = this.props;
    dispatch({
      type: `global/getTextFromOcr`,
      payload: {
        ...params,
      },
    });
  };

  dealFacts = (zjList) => {
    const _facts = _.cloneDeep(this.state.facts);
    _.map(zjList, (o) => {
      const index = _.findIndex(_facts, (f) => f.mergekey === o.mergekey);
      _.set(_facts[index], 'zjdata', o.zjdata)
    });
    this.setState({
      facts: _facts
    })
  };

  ifSave = (data, fzdata) => {
    this.setState({
      elseSave: data,
      fzdata: fzdata
    })
  };

  doLoading = () => {
    this.setState({
      btnLoading: true
    }, () => {
      this.refresh = setTimeout(() => {
        this.setState({
          btnLoading: false
        })
      }, 2000);
    })
  };


  changeFileClick = () => {
    this.setState({
      visible: 'true'
    });
  };


  onOkClick = (item) => {
    const {dispatch, match} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: 'znfz/chooseWs',
      payload: {
        filekey: item.image,
        bmsah: id,
      }
    }).then(() => {
      this.setState({
        visible: 'false',
        showBtn: true
      });
      this.loadData();
    });
  };

  onStepClick = () => {
    this.refs.factInfo.doSave(false);
  };

  //nlpInfoKey
  getNlpInfoKey = (key) => {
    this.setState({
      nlpInfoKey: key
    })
  };

  render() {
    const {dispatch, match, znfz, nlpAdding, nlpDeleting, stage, ysay} = this.props;
    const {params: {id}} = match;
    const {nlpConfig = {}, ajxx, coords} = znfz;
    const {elseSave, docNlp, btnLoading, visible, showBtn, fileImages, fzdata, nlpInfoKey} = this.state;
    const currentNlpData = docNlp.content && docNlp.content['侦查机关认定的犯罪嫌疑人基本情况'].length > 0 ? docNlp.content['侦查机关认定的犯罪嫌疑人基本情况'][nlpInfoKey]: {};

    const flowStep = (
      <div className={styles.flow}>
        <div className={styles.steps}>
          <FlowStep match={match}
                    dispatch={dispatch}
                    bmsah={id}
                    stage={stage}
                    ysay={ysay}
                    ajxx={ajxx}
                    onStepClick={this.onStepClick}
          />
        </div>
        <div className={styles.tools}>
          <Tools stage={stage}
                 coords={coords}
                 dispatch={dispatch}
                 ajxx={ajxx}
          />
        </div>
      </div>
    );

    const images = docNlp.images || [];
    const source = images.map(image => ({image}));
    const imgSource = fileImages.map(image => ({image}));

    const nlpTitle = nlpConfig ? nlpConfig.jsondata : {};
    // let factsData = nlpTitle && _.get(docNlp.content, `${nlpTitle.zcfzqj}`);
    // const otherFactsData = stage === 'ZJ' ?
    //   {listname: {path: '提请批准逮捕书_犯罪情节_0_listname'}, orderBy: 1} :
    //   {listname: {path: '起诉意见书_犯罪情节_0_listname'}, orderBy: 1};
    //
    // let facts = factsData && _.isArray(factsData) ?
    //   ysay === '盗窃' ? factsData : factsData.length > 0 && [{...factsData[0], ...otherFactsData}] :
    //   factsData && [{...factsData, ...otherFactsData}];

    let facts = nlpTitle && _.get(docNlp.content, `${nlpTitle.zcfzqj}`);

    _.forEach(this.state.facts, f => {
      const fact = _.find(facts, f1 => _.get(f1, 'listname.path') === f.nlppath);
      _.set(fact, 'orderBy', f.orderBy);
      _.set(fact, 'gsmergekey', f.mergekey);
      _.set(fact, 'zjdata', f.zjdata ? f.zjdata : {});
    });

    facts = _.orderBy(facts, 'orderBy');

    return (
      <PageHeaderLayout content={flowStep} wrapperClassName={styles.default}>
        <Spin spinning={!!nlpAdding || !!nlpDeleting || btnLoading} size='large' className={styles.spin}/>
        <Card className={classnames(styles.content, this.state.fullScreen ? styles.fullScreen : '')}>
          {visible === 'true' ?
            <SelectFile
              source={imgSource}
              onClick={this.onOkClick}
              stage={stage}
            />
            : visible === 'false' ?
              <div className={styles.main}>
                <div className={classnames(styles.left)}>
                  <DocPreview source={source} stage={stage} onCopy={this.onCopy}/>
                </div>
                <div className={classnames(styles.right)}>
                  {stage === 'SP' || !showBtn ? '' :
                    <div className={styles.changeBtn}>
                      <Button
                        ghost
                        size="small"
                        style={{margin: '10px 85%'}}
                        onClick={() => this.changeFileClick()}
                      >切换文书</Button>
                    </div>
                  }
                  <NlpInfo data={docNlp.content || {}}
                           match={match}
                           docNlp={docNlp}
                           dispatch={dispatch}
                           ajxx={ajxx}
                           excludes={nlpTitle ? [nlpTitle.zcfzqj] : []}
                           editable={false}
                           ifSave={this.ifSave}
                           ysay={ysay}
                           getNlpInfoKey={this.getNlpInfoKey}
                           reload={this.loadData}/>
                  {
                    facts && <FactInfo data={facts}
                                       reload={this.loadData}
                                       dealFacts={this.dealFacts}
                                       match={match}
                                       stage={stage}
                                       doLoading={this.doLoading}
                                       ifSave={this.ifSave}
                                       elseSave={elseSave}
                                       dispatch={dispatch}
                                       ysay={ysay}
                                       fzdata={fzdata}
                                       currentNlpData={currentNlpData}
                                       ref="factInfo"
                  />
                  }
                </div>
              </div> : ''
          }
        </Card>
      </PageHeaderLayout>
    );
  }
}
