import React, {Component} from 'react';
import {Card, Spin} from 'antd';
import classnames from 'classnames';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import FlowStep from 'components/Deal/FlowStep';
import DocPreview from 'components/xDeal/DocPreview';
import NlpInfo from 'components/xDeal/NlpInfo';
import Tools from 'components/Deal/Tools';
import styles from './index.less';




export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fullScreen: false,
      docNlp: {},
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
  };

  fillNlpData = () => {
    const { dispatch, match: { params: { id } } } = this.props;
    dispatch({
      type: 'znfz/fillNLPData',
      payload: {
        bmsah: id,
      },
    })
  };
  reCalculate = () => {
    const { dispatch, match: { params: { id } } } = this.props;
    dispatch({
      type: 'znfz/reCalculate',
      payload: {
        bmsah: id,
      },
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
    }).then(({success, data}) => {
      if (success && data) {
        this.setState({docNlp: data});
      }
    });
  };

  onCopy = (params) => {
    const {dispatch} = this.props;
    dispatch({
      type: `global/getTextFromOcr`,
      payload: {
          ...params
      },
    });
  };

  render() {
    const {dispatch, match, znfz, nlpAdding, nlpDeleting, stage} = this.props;
    const {params: {id}} = match;
    const {ajxx, coords} = znfz;
    const flowStep = (
      <div className={styles.flow}>
        <div className={styles.steps}>
          <FlowStep match={match}
                    dispatch={dispatch}
                    bmsah={id}
                    ajxx={ajxx}
                    stage={stage}/>
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

    const {docNlp} = this.state;
    const images = docNlp.images || [];
    const source = images.map(image => ({image}));


    return (
      <PageHeaderLayout content={flowStep} wrapperClassName={styles.default}>
        <Spin spinning={!!nlpAdding || !!nlpDeleting} size='large' className={styles.spin}/>
        <Card className={classnames(styles.content, this.state.fullScreen ? styles.fullScreen : '')}>
          <div className={styles.main}>
            <div className={classnames(styles.left)}>
              <DocPreview source={source} onCopy={this.onCopy}/>
            </div>
            <div className={classnames(styles.right)}>
              <NlpInfo data={docNlp.content || {}}
                       match={match}
                       docNlp={docNlp}
                       dispatch={dispatch}
                       ifSave={this.ifSave}
                       fzdata={fzdata}
                       ajxx={ajxx}
                       reload={this.loadData}/>
            </div>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
