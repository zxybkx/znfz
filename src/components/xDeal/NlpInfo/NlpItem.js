import React, {PureComponent, Fragment} from 'react';
import {Icon} from 'antd';
import _ from 'lodash';
import Tabs from '../Tabs';
import Contents from './Contents';
import styles from './NlpItem.less';

export default class NlpItem extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      currentTabKey: 0,
      current: props.data && props.data.length > 0 ? props.data[0] : {},
      dropData: props.dropData,
    }
  }

  componentWillReceiveProps(nextProps) {
    const current = nextProps.data && nextProps.data.length > 0 ?
      nextProps.data[this.state.currentTabKey || 0] : {};
    const currentTabKey = nextProps.cs !== this.props.cs ? 0 : this.state.currentTabKey;
    this.setState({
      data: nextProps.data,
      current: current,
      dropData: nextProps.dropData,
      currentTabKey
    });
  }

  addTab = (name, current = '0', tabs) => {
    const {data} = this.state;
    const path = _.get(data[data.length - 1], 'listname.path');
    if (path) {
      this.setState({currentTabKey: current}, ()=> {
        this.props.addNLP && this.props.addNLP(path);
        this.props.getNlpInfoKey && this.props.getNlpInfoKey(current);
      })
    }
  };

  deleteTab = (index, current = '0', tabs) => {
    const {data} = this.state;
    const path = _.get(data[index], 'listname.path');
    if (path) {
      this.setState({
        currentTabKey: current,
      }, ()=> {
        this.props.deleteNLP && this.props.deleteNLP(path);
        this.props.getNlpInfoKey && this.props.getNlpInfoKey(current);
      })
    }
  };

  renameTab = (index, newName) => {
    this.tab && this.tab.renameTab && this.tab.renameTab(index, newName);
  };

  onTabChange = (key) => {
    const {data} = this.state;
    this.setState(
      {
        currentTabKey: key,
        current: data[key] || {},
      }, () => {
        this.props.batchSave && this.props.batchSave(false);
        this.props.getNlpInfoKey && this.props.getNlpInfoKey(key);
      });
  };

  onDropdownClick = (mergekey) => {
    this.props.getFact(mergekey);
  };

  onMenuClick = (keyPath) => {
    const {dropData, data, currentTabKey} = this.state;
    let newImportData = {};
    if (_.indexOf(keyPath, '认定事实') === -1) {
      newImportData = _.find(dropData, function (o) {
        return o.cs === keyPath[0] && o.mergekey === keyPath[1];
      });
    } else {
      newImportData = _.find(dropData, function (o) {
        return o.mergekey === keyPath[0] && !o.owner;
      });
    }

    const dataClone = _.cloneDeep(data[currentTabKey]);

    newImportData.nlpdata && _.map(newImportData.nlpdata, (v, k) => {
      if (k !== 'listname') {
        if (k === '案情摘要' || k === '供述摘录') {
          _.get(dataClone, '供述摘录') ? _.set(_.get(dataClone, '供述摘录'), 'content', v.content) : _.set(_.get(dataClone, '案情摘要'), 'content', v.content);
        } else if (k === '参与人') {
          const oldParticipants = _.get(dataClone, '参与人');
          const newParticipants = v;
          if (newParticipants.length > oldParticipants.length) {
            const fillLength = newParticipants.length - oldParticipants.length;


            for (let i = 0; i < fillLength; i++) {
              oldParticipants.push(oldParticipants[0]);
            }

            _.map(newParticipants, (data, index) => {
              const participants = _.cloneDeep(oldParticipants[index]);
              const newName = _.get(data, '姓名').content;
              const listPath = _.split(_.get(oldParticipants[index], 'listname').path, '_');
              listPath.splice(6, 1, `${index}`);
              const namePath = _.split(_.get(oldParticipants[index], '姓名').path, '_');
              namePath.splice(6, 1, `${index}`);

              _.set(participants.listname, 'path', listPath.join('_'));
              _.set(_.get(participants, '姓名'), 'path', namePath.join('_'));
              _.set(_.get(participants, '姓名'), 'content', newName);

              oldParticipants[index] = participants;
            });

          } else if (newParticipants.length === oldParticipants.length) {
            _.map(newParticipants, (data, index) => {
              const participants = _.cloneDeep(oldParticipants[index]);
              const newName = _.get(data, '姓名').content;
              _.set(_.get(participants, '姓名'), 'content', newName);
              oldParticipants[index] = participants;
            });
          } else {
            _.map(newParticipants, (data, index) => {
              const participants = _.cloneDeep(oldParticipants[index]);
              const newName = _.get(data, '姓名').content;
              _.set(_.get(participants, '姓名'), 'content', newName);
              oldParticipants[index] = participants;
            });

            oldParticipants.splice(newParticipants.length, oldParticipants.length - newParticipants.length);
          }
        } else {
          if (k === '案件名称') {
            _.set(_.get(dataClone, '侦查机关认定的事实'), 'content', v.content);
            _.set(_.get(dataClone, k), 'content', v.content);
          } else {
            if (k !== '侦查机关认定的事实') {
              _.set(_.get(dataClone, k), 'content', v.content);
            }
          }
        }
      }
    });

    //saveNLP
    this.props.importSave(this.props.title, this.state.currentTabKey, dataClone);
  };

  render = () => {//列表
    const {title, index, dictionaries, importData, dropData, docType,isSuspect, facts, xyrJbxx, docNlp} = this.props;
    const {data, current, currentTabKey} = this.state;
    const multiple = Array.isArray(data);

    let tabData = {};
    if (multiple) {
      tabData = data.map((d, idx) => {
        const labelKey = d.listname ? d.listname.content : null;
        if (labelKey) {
          let label = _.get(d, `${labelKey}.content`);
          if (_.isEmpty(label)) {
            label = `第${idx + 1}个`;
          }
             return {key: `${idx}`, label: label};
        } else {
          return {key: `${idx}`, label: `第${idx + 1}个`};
        }
      });
    }

    // console.log('title', title);

    return (
      <div className={styles.default}>
        <div className={styles.title}>{title}
          {title=== '基本信息' ?isSuspect&&isSuspect=== true ? <a style={{marginLeft:8}}>（该询问笔录在立案前处理）</a>:'':'' }
        </div>
        <div className={styles.content}>
          {
            multiple && (
              <Fragment>
                <Tabs wrappedComponentRef={c => this.tab = c}
                      type={title}
                      tabs={tabData}
                      activeTab={currentTabKey}
                      onAdd={this.addTab}
                      onDelete={this.deleteTab}
                      onTabChange={this.onTabChange}/>
                <Contents type={title}
                          index={index}
                          data={current}
                          dictionaries={dictionaries}
                          docType={docType}
                          facts={facts}
                          docNlp={docNlp}
                          enumerate={this.props.enumerate}
                          names={this.props.names}
                          renameTab={this.renameTab}
                          getNLP={this.props.getNLP}
                          addNLP={this.props.addNLP}
                          deleteNLP={this.props.deleteNLP}
                          saveNLP={this.props.saveNLP}
                          ifSave={this.props.ifSave}
                          importData={importData}
                          onDropdownClick={this.onDropdownClick}
                          onMenuClick={this.onMenuClick}
                          dropData={dropData}
                          xyrJbxx={xyrJbxx}
                />
              </Fragment>
            )
          }
          {
            !multiple && <Contents type={title}
                                   index={index}
                                   data={data}
                                   facts={facts}
                                   docType={docType}
                                   docNlp={docNlp}
                                   enumerate={this.props.enumerate}
                                   names={this.props.names}
                                   dictionaries={dictionaries}
                                   getNLP={this.props.getNLP}
                                   addNLP={this.props.addNLP}
                                   deleteNLP={this.props.deleteNLP}
                                   ifSave={this.props.ifSave}
                                   saveNLP={this.props.saveNLP}/>
          }
        </div>
      </div>
    )
  }
}
