import React, {PureComponent, Fragment} from 'react';
import {connect} from 'dva';
import {Card, Menu, DatePicker, Icon, Button, Tooltip, message, Modal, Popconfirm, Input, Select} from 'antd';
import classnames from 'classnames';
import OnlineOffice from 'components/Deal/OnlineOffice';
import SearchTree from 'lib/Tree/SearchTree';
import {getHttpHostPrefix} from 'utils/utils';
import {WOPI_HOST} from '../../../constant';
import styles from '../index.less';
import Authorized from 'utils/Authorized';
import moment from 'moment';
import 'moment/locale/zh-cn';
import _ from 'lodash';

const {AuthorizedRoute} = Authorized;
const {RangePicker} = DatePicker;

class Daily extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fullScreen: false,
      currentDocument: '',
      docParam: {},
      docUrl: '',
      dailies: [],
      id: '',
      visible: false,
      renameVisible: false,
      //filedate: '',
      fileStartDate: '',
      fileEndDate: '',
      filename: '',
      startDate: '',
      endDate: '',
      dwmc: '浙江省院',
      dwbm: '32',
      // ysay: ["交通肇事罪", "危险驾驶罪", "盗窃罪","故意伤害罪"],
      ysay: ["交通肇事罪", "危险驾驶罪", "盗窃罪"],
    };
    this.loadedDoc = {};
  }

  componentDidMount() {
    const {dispatch} = this.props;
    let startDate = '';
    let endDate = '';
    if (new Date().getMonth() + 1 >= 1 && new Date().getMonth() + 1 <= 9) {
      if (new Date().getDate() >= 1 && new Date().getDate() <= 9) {
        startDate = `${new Date().getFullYear()}-0${new Date().getMonth() + 1}-01T00:00:00`;
        endDate = `${new Date().getFullYear()}-0${new Date().getMonth() + 1}-0${new Date().getDate()}T23:59:59`;
      } else {
        startDate = `${new Date().getFullYear()}-0${new Date().getMonth() + 1}-01T00:00:00`;
        endDate = `${new Date().getFullYear()}-0${new Date().getMonth() + 1}-${new Date().getDate()}T23:59:59`;
      }
    } else {
      if (new Date().getDate() >= 1 && new Date().getDate() <= 9) {
        startDate = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-01T00:00:00`;
        endDate = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-0${new Date().getDate()}T23:59:59`;
      } else {
        startDate = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-01T00:00:00`;
        endDate = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}T23:59:59`;
      }
    }
    this.setState({startDate, endDate, fileStartDate: startDate, fileEndDate: endDate});
    dispatch({
      type: 'daily/getTree',
      payload: {
        dwbm: this.state.dwbm,
      },
    });
    dispatch({
      type: 'daily/getDailies',
      payload: {
        startDate: startDate,
        endDate: endDate,
        dwbm: this.state.dwbm,
        dwmc: this.state.dwmc,
        ysay: this.state.ysay,
      },
    }).then(({success, data}) => {
      if (success) {
        if (!_.isEmpty(data)) {
          this.fetchDocument(data[0].title, data[0].key);
          this.setState({dailies: data, id: data[0].key});
        } else {
          this.setState({dailies: [], id: ''});
        }
      }
    });
  }


  fetchDocument = (doc, data) => {
    const docParam = {
      WOPISrc: `http://gateway:8762/wopi/files/${data}`,
      access_token: 'report_bot',
    };
    this.loadedDoc = {};
    this.loadedDoc[doc + "_" + data] = data;
    this.setState({
      currentDocument: doc + "_" + data,
      docParam,
      docUrl: `http://${WOPI_HOST}/we/wordeditorframe.aspx`,
    })
  };


  buildTreeData = (departments) => {
    let treeNode = [];
    if (departments) {
      let nodeMap = {};
      departments.map(d => {
        const a = d.dwbm.split('');
        let node = {};
        if (a[4] === '0' && a[5] === '0') {
          if (a[2] === '0' && a[3] === '7') {
            node = {
              name: d.dwmc,
              value: d.dwbm,
              id: d.dwbm,
            };
          } else {
            const b = d.dwmc.split('');
            node = {
              name: b[0] + b[1] + b[2],
              value: d.dwbm,
              id: d.dwbm,
            };
          }
        } else {
          node = {
            name: d.dwmc,
            value: d.dwbm,
            id: d.dwbm,
          };
        }
        nodeMap[node.value] = node;
      });
      departments.map(d => {
        let parent = nodeMap[d.fdwbm];
        let node = nodeMap[d.dwbm];
        if (parent) {
          if (!parent.children) {
            let node1 = {};
            if (parent.name === '浙江省') {
              node1 = {
                name: '浙江省院',
                value: parent.value,
                id: parent.id + '_1',
                children: [],
              };
            } else {
              node1 = {
                name: parent.name + '院',
                value: parent.value,
                id: parent.id + '_1',
              };
            }
            parent.children = [node1];
          }
          parent.children.push(node);
        }

        if (d.dwjb === '2') {
          treeNode.push(node);
        }
      });

    }
    return treeNode;
  };


  treeSelect = (values) => {
    const {dispatch} = this.props;
    const {startDate, endDate, ysay} = this.state;
    const haveChild = values.children ? true : false;
    const newdwbm = haveChild ? values.value === '320000' ? '32' : values.value.substring(0, 4) : values.value;
    this.setState({
      dwmc: values.name,
      dwbm: newdwbm,
    });
    dispatch({
      type: 'daily/getDailies',
      payload: {
        startDate: startDate,
        endDate: endDate,
        dwbm: newdwbm,
        dwmc: values.name,
        ysay: ysay
      },
    }).then(({success, data}) => {
      if (success) {
        if (!_.isEmpty(data)) {
          this.fetchDocument(data[data.length - 1].title, data[data.length - 1].key);
          this.setState({dailies: data, id: data[data.length - 1].key});
        } else {
          this.setState({dailies: [], id: ''});
        }
      }
    });
  };

  toggleFullScreen = () => {
    this.setState({fullScreen: !this.state.fullScreen});
  };

  buttonClick = () => {
    this.setState({
      visible: true,
    });
  };

  renameClick = () => {
    this.setState({
      renameVisible: true,
    });
  };

  deleteClick = () => {
    const {dispatch} = this.props;
    const {startDate, endDate, dwbm, dwmc, ysay} = this.state;
    dispatch({
      type: 'daily/deleteDaily',
      payload: {id: this.state.id},
    }).then(() => {
      dispatch({
        type: 'daily/getDailies',
        payload: {
          startDate: startDate,
          endDate: endDate,
          dwbm: dwbm,
          dwmc: dwmc,
          ysay: ysay,
        },
      }).then(({success, data}) => {
        if (success) {
          if (!_.isEmpty(data)) {
            this.setState({dailies: data, id: data[data.length - 1].key});
            this.fetchDocument(data[data.length - 1].title, data[data.length - 1].key);
          } else {
            this.setState({dailies: [], id: ''});
          }
        }
      })
    });
  };

  renameHandleOk = () => {
    const {dispatch} = this.props;
    const {startDate, endDate, dwbm, dwmc, ysay} = this.state;
    dispatch({
      type: 'daily/renameDaily',
      payload: {
        fileid: this.state.id,
        filename: this.state.filename,
      },
    }).then(() => {
      dispatch({
        type: 'daily/getDailies',
        payload: {
          startDate: startDate,
          endDate: endDate,
          dwbm: dwbm,
          dwmc: dwmc,
          ysay: ysay,
        },
      }).then(({success, data}) => {
        if (success) {
          if (!_.isEmpty(data)) {
            this.setState({dailies: data, id: data[data.length - 1].key});
            this.fetchDocument(data[data.length - 1].title, data[data.length - 1].key);
          } else {
            this.setState({dailies: [], id: ''});
          }
        }
      })
    });
    this.setState({
      renameVisible: false,
    });
  };

  renameHandleCancel = () => {
    this.setState({
      renameVisible: false,
    });
  };

  handleOk = () => {
    const {dispatch} = this.props;
    const {startDate, endDate, dwbm, dwmc, fileStartDate, fileEndDate, ysay} = this.state;
    dispatch({
      type: 'daily/fetchDaily',
      payload: {
        startDate: fileStartDate,
        endDate: fileEndDate,
        dwbm: dwbm,
        dwmc: dwmc,
        ysay: ysay,
      },
    }).then(({success}) => {
      if (success) {
        dispatch({
          type: 'daily/getDailies',
          payload: {
            startDate: startDate,
            endDate: endDate,
            dwbm: dwbm,
            dwmc: dwmc,
            ysay: ysay,
          },
        }).then(({success, data}) => {
          if (success) {
            if (!_.isEmpty(data)) {
              this.fetchDocument(data[data.length - 1].title, data[data.length - 1].key);
              this.setState({dailies: data, id: data[data.length - 1].key});
            } else {
              this.setState({dailies: [], id: ''});
            }
          }
        });
      } else {

        message.error('当日文书已生成，无法重复生成！');
      }
    });

    this.setState({
      visible: false,
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };


  onLoad = (doc) => {
    /*if (this.loadedDoc[doc]) {
      this.fetchDocument(doc.split("_")[0], this.loadedDoc[doc]);
      return false;
    }*/
    this.state.dailies.map((v, k) => {
      if (v.key === doc.split("_")[1]) {
        this.fetchDocument(doc.split("_")[0], v.key);
        this.setState({id: v.key});
      }
    });
  };

  onRelease = () => {
    const {dispatch} = this.props;
    dispatch({
      type: 'daily/publishReport',
      payload: this.state.id,
    }).then(({success, data}) => {
      if (success) {
        message.success('日报发布成功！')
      } else {
        message.error('日报发布失败，请重新发布！')
      }
    })
  };

  inputChange = (e) => {
    this.setState({
      filename: e.target.value,
    });
  };


  ysayChange = (value) => {
    const {dispatch} = this.props;
    const {startDate, endDate, dwbm, dwmc} = this.state;
    let ysay = [];
    console.log(value)
    /*if (value === "dqz") {
      ysay = ["盗窃罪"]
    } else if (value === "jtzs") {
      ysay = ["交通肇事罪", "危险驾驶罪"]
    }*/
    this.setState({ysay: ysay})
    dispatch({
      type: 'daily/getDailies',
      payload: {
        startDate: startDate,
        endDate: endDate,
        dwbm: dwbm,
        dwmc: dwmc,
        ysay: ysay,
      },
    }).then(({success, data}) => {
      if (success) {
        if (!_.isEmpty(data)) {
          this.setState({dailies: data, id: data[data.length - 1].key});
          this.fetchDocument(data[data.length - 1].title, data[data.length - 1].key);
        } else {
          this.setState({dailies: [], id: ''});
        }
      }
    })
  }

  dateChange = (date, dateString) => {
    this.setState({
      //filedate: `${dateString}T00:00:00`,
      fileStartDate: `${dateString[0]}T00:00:00`,
      fileEndDate: `${dateString[1]}T23:59:59`,
    });
  };

  onChange = (date, dateString) => {
    this.setState({
      startDate: `${dateString[0]}T00:00:00`,
      endDate: `${dateString[1]}T23:59:59`,
    });
  };

  render() {
    const selectKeys = _.keys(this.loadedDoc);
    const {daily, match, dispatch} = this.props;
    const {treeList} = daily;
    const SearchTreeList = {
      showSearch: false,
      tree: this.buildTreeData(treeList),
      expandRoot: [],
      onSelect: this.treeSelect,
    };
    let docs = [];
    this.state.dailies && this.state.dailies.map(d => {
      docs.push(d.title + "_" + d.key);
    });

    return (
      <div className={styles.default}>
        <div className={styles.menu}>
          <div style={{fontWeight: 600, fontSize: 18, margin: '20px 0 0 10px'}}>办案日报</div>
          <Select defaultValue="jtzs"
                  className={styles.ysay}
                  onChange={this.ysayChange}>
            <Option value="jtzs">盗窃罪/交通肇事/危险驾驶</Option>
            {/*<Option value="dqz">盗窃罪</Option>*/}
          </Select>
          <RangePicker format='YYYY-MM-DD'
                       onChange={this.onChange}
                       allowClear={false}
                       defaultValue={[moment(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-01`, 'YYYY-MM-DD'), moment(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`, 'YYYY-MM-DD')]}
                       disabledDate={(current) => current && current > moment().endOf('day')}
                       className={styles.monthPicker}/>
          <SearchTree {...SearchTreeList} />
        </div>
        <div className={styles.menu} style={{marginLeft: 8, width: 280}}>
          <div style={{margin: '10px 0 10px 10px'}}>
            <span style={{fontWeight: 600, fontSize: 16}}>日报目录</span>
            <span>
              <Tooltip title='删除日报'>
                <Popconfirm title="确定删除本日报吗?" onConfirm={this.deleteClick}>
                  <Button type="primary" size="small" style={{float: 'right'}}><Icon type="delete"/></Button>
                </Popconfirm>
              </Tooltip>

              <Tooltip title='重命名'>
                <Button type="primary"
                        size="small"
                        style={{float: 'right', margin: '0 10px'}}
                        onClick={this.renameClick}>
                  <Icon type="edit"/>
                </Button>
              </Tooltip>
              <Modal
                title="重命名"
                visible={this.state.renameVisible}
                destroyOnClose
                onOk={this.renameHandleOk}
                onCancel={this.renameHandleCancel}
              >
                <Input onChange={this.inputChange}/>
              </Modal>

              <Tooltip title='新建日报'>
                <Button type="primary"
                        size="small"
                        style={{float: 'right'}}
                        onClick={this.buttonClick}>
                  <Icon type="plus"/>
                </Button>
              </Tooltip>
              <Modal
                title="新建日报"
                visible={this.state.visible}
                destroyOnClose
                onOk={this.handleOk}
                onCancel={this.handleCancel}
              >
                {/*<DatePicker format='YYYY-MM-DD'
                            allowClear={false}
                            onChange={this.dateChange}
                            placeholder="起始时间"
                            disabledDate={(current) => current && current > moment().endOf('day')}/>*/}
                <RangePicker format='YYYY-MM-DD'
                             onChange={this.dateChange}
                             allowClear={false}
                             defaultValue={[moment(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-01`, 'YYYY-MM-DD'), moment(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`, 'YYYY-MM-DD')]}
                             disabledDate={(current) => current && current > moment().endOf('day')}
                             className={styles.monthPicker}/>

              </Modal>
            </span>
          </div>
          <Menu selectedKeys={selectKeys} onClick={({key}) => this.onLoad(key)}>
            {
              this.state.dailies && this.state.dailies.map(d => <Menu.Item key={d.title + "_" + d.key}><Icon
                type="file-text"/>{d.title}</Menu.Item>)
            }
          </Menu>
        </div>
        <div className={classnames(styles.mask, this.state.fullScreen ? styles.fullScreen : '')}/>
        <Card className={classnames(styles.content, this.state.fullScreen ? styles.fullScreen : '')}>
          {
            !_.isEmpty(this.state.dailies) && <OnlineOffice docs={docs}
                                                            currentDocument={this.state.currentDocument}
                                                            src={this.state.docUrl}
                                                            match={match}
                                                            dispatch={dispatch}
                                                            params={this.state.docParam}
                                                            onLoad={this.onLoad}
                                                            buttonVisible={true}
                                                            onReload={this.onRelease}/>
          }
        </Card>
      </div>
    );
  }
}

@connect(({daily, loading}) => ({
  daily,
  loading: loading.effects['daily/getDailies'],
}))
export default class Wrapper extends PureComponent {
  render() {
    return (
      <AuthorizedRoute
        render={() => <Daily {...this.props}/>}
        authority={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_USER']}
        redirectPath="/passport/sign-in"
      />
    )
  }
}
