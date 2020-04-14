/**
 *案件审查详情
 */
import React, {PureComponent} from 'react';
import {Tabs, Button} from 'antd';
import {Card, Spin} from 'antd';
import classnames from 'classnames';
import  {StatusTab} from 'components/xDeal/Tabs';
import DocPreview from 'components/xDeal/DocPreview';
import NlpInfo from 'components/xDeal/NlpInfo';
import {ToggleTrigger, ReturnTrigger} from 'components/xDeal/Trigger';
import ProblemSubList from 'components/xDeal/ProblemSubList';
import styles from './Detail.less';
import _ from 'lodash';
import FileTree from './FileTree';

const TabPane = Tabs.TabPane;

const stage = 'SP';

export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      rightVisible: false,
      data: props.data,
      currentIndex: props.currentIndex,
      cascadeProblemList: [],
      leftImage: [],
      rightImage: [],
      docNlp: {},
    }
  }

  componentDidMount = () => {
    this.loadData();
  };

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.data, nextProps.data) || nextProps.currentIndex !== this.props.currentIndex) {
      this.setState({
        currentIndex: nextProps.currentIndex,
        data: nextProps.data,
      }, () => {
        this.loadData();
      });

    }
  }

  buildPosMap = (json) => {
    const posMap = {};
    _.map(json, o => {
      _.map(o.contents, c => {
        const coords = _.get(c, 'coords');
        _.forEach(coords, coord => {
          const key = `"${coord.image}"`;
          if(!_.has(posMap, key)){
            posMap[key] = [];
          }
          if(!_.isEmpty(coord.pos)){
            _.get(posMap, key).push(coord.pos);
          }
        })
      })
    });
    return posMap;
  };

  loadData = () => {
    const {currentIndex, rightVisible} = this.state;
    const {dispatch, match} = this.props;
    const {params: {id}} = match;
    const {data} = this.state;

    if(_.isEmpty(data)){
      return false;
    }

    const jsondata = data.jsondata ? (data.jsondata.data || []) : [];
    const posMap = this.buildPosMap(jsondata);

    if (!_.isEmpty(jsondata) && currentIndex >= 0) {
      const filekey = jsondata[currentIndex].filekey;

      dispatch({
        type: 'znfz/getNlpByBmsahAndImage',
        payload: {
          bmsah: id,
          image: filekey,
        },
      }).then(({data, success}) => {
        const images = [];
        data && data.images && data.images.map((d) => {
          const posArr = _.get(posMap, `"${d}"`);
          if(_.isEmpty(posArr)){
            images.push({image: d, pos: ''});
          }else{
            const arr = _.map(posArr, pos => {
              return {
                image: d,
                pos
              }
            });
            images.push(...arr);
          }
        });

        let newState = {};
        if (rightVisible) {
          newState = {
            rightImage: images,
          }
        } else {
          newState = {
            leftImage: images,
            docNlp: data,
          }
        }
        this.setState(newState);
      });


      if (!rightVisible) {

        dispatch({
          type: 'spjd/getCascadeProblemByKey',
          payload: {
            bmsah: id,
            filekey: filekey,
          },
        }).then((data) => {
          this.setState({
            cascadeProblemList: data,
          })
        });
      }
    }

  };

  toggleRight = () => {
    this.setState({rightVisible: !this.state.rightVisible})
  };


  changeProblem = (key) => {
    this.setState({
      currentIndex: key,
    }, () => {
      this.loadData();
    });
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

  render() {
    const {dispatch, match, data, loading, facts, ajxx} = this.props;
    const  {currentIndex} = this.state;
    const {
      rightVisible,
      leftImage,
      rightImage,
      docNlp,
      cascadeProblemList,
    } = this.state;
    const docPreviewStyle = rightVisible ? {
      position: 'relative',
    } : {
      position: 'fixed',
      right: -9999,
      bottom: -9999,
    };

    return (
      <div className={styles.default}>
        <Spin spinning={loading} size='large' className={styles.spin}/>
        <Card className={styles.content}>
          <div className={styles.main}>
            <div className={classnames(styles.aside, this.state.fullScreen ? styles.fullScreen : '')}>
              <FileTree currentIndex={currentIndex} data={data} onSelect={this.changeProblem}/>
            </div>
            <div className={styles.main}>
              <div className={styles.left}>
                <DocPreview source={leftImage} onCopy={this.onCopy}/>
                <div className={styles.trigger}>
                  <Button shape='circle' icon={'select'} onClick={this.toggleRight}/>
                </div>
              </div>
              <div className={classnames(styles.right, styles.right1, rightVisible ? styles.hidden : '')}>
                <Tabs defaultActiveKey="要素提取" onChange={this.callback}>
                  <TabPane tab="要素提取" key="要素提取">
                    <NlpInfo
                      data={docNlp.content || {}}
                      match={match}
                      docNlp={docNlp}
                      dispatch={dispatch}
                      ajxx={ajxx}
                      reload={this.loadData}
                      dictionaries={{'侦查机关认定的事实': facts, '关联事实': facts}}
                    />
                  </TabPane>

                </Tabs>
              </div>
              <div className={classnames(styles.right, styles.right2)}
                   style={docPreviewStyle}>
                <DocPreview source={rightImage} onCopy={this.onCopy}/>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }
}

