import React, {Component} from 'react';
import {Card, Spin} from 'antd';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import DocPreview from 'components/xDeal/DocPreview';
import _ from 'lodash';
import styles from './index.less';
import SPDoubt from './SPDoubt'

export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      source: {},
      leftImage: '起诉书'
    }
  }

  componentDidMount = () => {
    const {dispatch, match} = this.props;
    const {params: {id}} = match;

    const newbmsah = _.replace(id, '审判', '起诉');
    dispatch({
      type: 'znfz/getAjxx',
      payload: {
        bmsah: newbmsah,
      },
    });

    dispatch({
      type: 'znfz/getBshyTreeList',
      payload: id
    }).then(({data, success}) => {
      if (data && success) {
        const imgs = {};
        data.map((o) => {
          o.data.map((obj) => {
            if (_.startsWith(obj.title, '起诉书')) {
              _.set(imgs, '起诉书', obj.pages)
            } else if (_.startsWith(obj.title, '量刑建议书')) {
              _.set(imgs, '量刑建议书', obj.pages)
            } else if (obj.title.indexOf('判决书') > -1) {
              _.set(imgs, '刑事判决书', obj.pages)
            }
          })
        });
        this.setState({
          source: imgs,
        });
      }
    });
  };

  changeLeftImage=(type)=>{
    const {leftImage} = this.state;
    if (type !== leftImage){
      this.setState({
        leftImage:type
      })
    }
  };

  dealPos = (list) => {
    const {dispatch, match} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: 'znfz/getBshyTreeList',
      payload: id
    }).then(({data, success}) => {
      if (data && success) {
        const imgs = {};
        data.map((o) => {
          o.data.map((obj) => {
            if (_.startsWith(obj.title, '起诉书')) {
              _.set(imgs, '起诉书', obj.pages)
            } else if (_.startsWith(obj.title, '量刑建议书')) {
              _.set(imgs, '量刑建议书', obj.pages)
            } else if (obj.title.indexOf('判决书') > -1) {
              _.set(imgs, '刑事判决书', obj.pages)
            }
          })
        });
        this.setState({
          source: imgs,
        }, () => {
          this.setState({
            source: {
              ...this.state.source,
              ...list
            }
          })
        });
      }
    });
  };
  render() {
    const {dispatch, match, flow, tools, stage, ajxx} = this.props;
    const {params: {id}} = match;
    const {source, leftImage} = this.state;
    const flowStep = (
      <div className={styles.flow}>
        <div className={styles.steps}>
          {flow}
        </div>
        <div className={styles.tools}>
          {tools}
        </div>
      </div>
    );
    const SPDoubtProps = {dispatch, bmsah: id, 
      stage, ajxx, dealPos: this.dealPos, changeLeftImage: this.changeLeftImage};
    return (
      <PageHeaderLayout content={flowStep} wrapperClassName={styles.default}>
        <div className={styles.content}>
          <div className={styles.main}>
            <div className={styles.mainLeft}>
              <div className={styles.title}>
                <span onClick={() => this.setState({leftImage: '起诉书'})}
                      style={{color: leftImage === '起诉书' ? 'white' : '#bbbbbb'}}
                >
                  起诉书
                </span>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <span onClick={() => this.setState({leftImage: '量刑建议书'})}
                      style={{color: leftImage === '量刑建议书' ? 'white' : '#bbbbbb'}}
                >
                  量刑建议书
                </span>
              </div>
              <DocPreview source={source && source[leftImage]}
                          onCopy={this.onCopy}
                          onScroll={this.onScroll}
                          stage={stage}
              />
            </div>
            <div className={styles.mainRight}>
              <div className={styles.title}>判决书</div>
              <DocPreview source={source && source['刑事判决书']}
                          onCopy={this.onCopy}
                          onScroll={this.onScroll}
                          stage={stage}
              />
            </div>

          </div>
          <div className={styles.rightSide}>
            <SPDoubt {...SPDoubtProps} />
          </div>
        </div>
      </PageHeaderLayout>
    );
  }
}
