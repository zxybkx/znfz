import React, {PureComponent, Fragment} from 'react';
import {
  Modal,
  Icon,
  Divider,
  Dropdown,
  Menu,
  Button,
  Form,
  Row,
  Col,
  Checkbox,
  Select,
  message,
  Spin,
  Tooltip
} from 'antd';
import classnames from 'classnames';
import {hasRoles} from 'utils/utils';
import Frame from 'lib/Frame/Frame';
import styles from './index.less';
import WordnameModal from 'components/xDeal/OnlineOffice/wordTree';
import Session from 'utils/session';
import _ from 'lodash';

const confirm = Modal.confirm;
const FormItem = Form.Item;
const Option = Select.Option;
@Form.create()
export default class OnlineOffice extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      tsLoading: false,
      visible: false,
      treeData: '',
      selectData: '',
      code: '',
      parameter: [],
      tableData: {},
      disable: true,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.currentDocument !== nextProps.currentDocument) {
      const {currentDocument} = nextProps;
      const {dispatch, match} = this.props;
      const session = Session.get();
      const wsmc = currentDocument.split('-')[0];
      if (match) {
        dispatch({
          type: 'znfz/wsmbdy',
          payload: {
            dwbm: session.dwbm,
            gh: session.gh,
            bmsah: match.params.id,
            znfzWsmbmc: wsmc,
          }
        }).then(({success, data}) => {
          this.setState({
            disable: data,
          })
        })
      }
    }
  };

  reloadData = () => {
    confirm({
      title: '确认重新生成文书吗?',
      content: '重新生成文书内容会将当前文书重置到初始状态，已经编辑保存的内容将丢失!',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        this.setState({loading: true}, () => {
          if (this.props.onReload) {
            this.props.onReload && this.props.onReload();
            this.hideLoading();
          }
        })
      },
      onCancel: () => {
      },
    });
  };


  onClick = (text, record) => {
    this.setState({
      tableData: record,
    });
  };


  handleOk = (e) => {
    this.setState({
      visible: false,
    });

    const {params: {WOPISrc}, match, currentDocument} = this.props;
    const {code, parameter, tableData} = this.state;
    const docId = WOPISrc.substring(WOPISrc.lastIndexOf('/') + 1);
    const wsmc = currentDocument.split('-')[0];
    const bgr = currentDocument.split('-')[1];
    const payload = {
      docId: docId,
      gyws: true,
      lcmbbh: parameter.lcmbbh,
      lcjdbh: parameter.lcjdbh,
      wsmc: bgr ? wsmc + '（' + bgr + '）' : wsmc,
      sourceID: bgr ? match.params.id + '_' + wsmc + '（' + bgr + '）' : match.params.id + '_' + wsmc,
      bmsah: match.params.id,
    };
    const wsTableData = {
      docId: docId,
      gyws: false,
      lcmbbh: tableData.lcmbbh,
      lcjdbh: tableData.lcjdbh,
      wsmc: bgr ? tableData.wsmbmc + '（' + bgr + '）' : tableData.wsmbmc,
      sourceID: bgr ? match.params.id + '_' + tableData.wsmbmc + '（' + bgr + '）' : match.params.id + '_' + tableData.wsmbmc,
      bmsah: match.params.id,
    };


    const wsData = code === 1 ? payload : code === 2 ? wsTableData : '';

    this.setState({tsLoading: false}, () => {
      if (this.props.onPush) {
        this.props.onPush && this.props.onPush(wsData);
      }
    })
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
      tsLoading: false,
    })
  };

  /**
   * 文书推送更新回调
   */
  wsUpdate = () => {
    const {params: {WOPISrc}, match, currentDocument} = this.props;
    const wsmc = currentDocument.split('-')[0];
    const bgr = currentDocument.split('-')[1];
    const payload = {
      docId: WOPISrc.substring(WOPISrc.lastIndexOf('/') + 1),
      gyws: false,
      lcmbbh: '',
      lcjdbh: '',
      wsmc: bgr ? wsmc + '（' + bgr + '）' : wsmc,
      sourceID: bgr ? match.params.id + '_' + wsmc + '（' + bgr + '）' : match.params.id + '_' + wsmc,
      bmsah: match.params.id,
    };
    confirm({
      title: '确认推送本文档至统一业务应用系统吗?',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        this.setState({tsLoading: false}, () => {
          if (this.props.onPush) {
            this.props.onPush && this.props.onPush(payload);
          }
        })
      },
      onCancel: () => {
        this.setState({
          tsLoading: false,
        });
      },
    });
  };

  /**
   * 非公用文书单条配置
   */
  onSave = (value) => {
    const {params: {WOPISrc}, match, currentDocument} = this.props;
    const wsmc = currentDocument.split('-')[0];
    const bgr = currentDocument.split('-')[1];
    const payload = {
      docId: WOPISrc.substring(WOPISrc.lastIndexOf('/') + 1),
      gyws: false,
      lcmbbh: value.data.lcmbbh,
      lcjdbh: value.data.lcjdbh,
      wsmc: bgr ? value.data.wsmbmc + '（' + bgr + '）' : value.data.wsmbmc,
      sourceID: bgr ? match.params.id + '_' + value.data.wsmbmc + '（' + bgr + '）' : match.params.id + '_' + value.data.wsmbmc,
      bmsah: match.params.id,
    };

    confirm({
      title: '确认推送本文档至统一业务应用系统吗?',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        this.setState({tsLoading: false}, () => {
          if (this.props.onPush) {
            this.props.onPush && this.props.onPush(payload);
          }
        })
      },
      onCancel: () => {
        this.setState({
          tsLoading: false,
        });
      },
    });
  };

  /**
   * 点击树节点回调
   */
  onFileSelect = (data) => {
    const {treeData} = this.state;
    const nodeValue = _.filter(treeData, o => {
      return o.jzmlh === data.id;
    });
    this.setState({
      parameter: nodeValue[0]
    });
  };

  /**
   * 公用文书
   */
  publicWs = () => {
    this.setState({
      visible: true
    });
  };

  /**
   * 非公用文书多条配置
   */
  unPublicWss = (value) => {
    this.setState({
      visible: true,
    });
  };

  /**
   * 推送存在文号回调code=1
   */
  repeatWh = () => {
    const {params: {WOPISrc}} = this.props;
    confirm({
      title: '该文书已经在统一业务系统中生成文号，点击继续将生成新的文号推送至统一业务应用系统！',
      okText: '继续',
      cancelText: '取消',
      onOk: () => {
        const {dispatch, match, currentDocument} = this.props;
        const session = Session.get();
        const wsmc = currentDocument.split('-')[0];
        dispatch({
          type: 'znfz/wsTrpe',
          payload: {
            dwbm: session.dwbm,
            gh: session.gh,
            bmsah: match.params.id,
            znfzWsmbmc: wsmc,
          }
        }).then(({success, data}) => {
          if (success) {
            this.setState({
              code: data.code,
              tsLoading: true,
            });
            if (data && data.code === 0) {

              this.onSave(data);
            } else if (data && data.code === 1) {

              this.setState({
                treeData: data.data
              });
              this.publicWs(data && data.data);
            } else if (data && data.code === 2) {
              this.setState({
                selectData: data.data,
              });

              this.unPublicWss(data && data.data);
            } else {
              message.error('数据获取失败，请重试！');
            }
          } else {
            message.error('未能找到对应的统一业务系统模板！');
          }
        })
      },
      onCancel: () => {
        this.setState({
          tsLoading: false,
        });
      },
    });
  };

  /**
   * 推送不存在文号回调code=0
   */
  newWh = () => {
    const {dispatch, match, currentDocument} = this.props;
    const session = Session.get();
    const wsmc = currentDocument.split('-')[0];
    dispatch({
      type: 'znfz/wsTrpe',
      payload: {
        dwbm: session.dwbm,
        gh: session.gh,
        bmsah: match.params.id,
        znfzWsmbmc: wsmc,
      }
    }).then(({success, data}) => {
      if (success) {
        this.setState({
          code: data.code,
          tsLoading: true,
        });
        if (data && data.code === 0) {

          this.onSave(data);
        } else if (data && data.code === 1) {
          this.setState({
            treeData: data.data
          });

          this.publicWs(data && data.data);
        } else if (data && data.code === 2) {
          this.setState({
            selectData: data.data,
          });

          this.unPublicWss(data && data.data);
        } else {
          message.error('数据获取失败，请重试！');
        }
      } else {
        message.error('未能找到对应的统一业务系统模板！');
      }
    })
  };

  /**
   * 文书推送创建回调
   */
  createWs = () => {
    const {dispatch, match, currentDocument} = this.props;
    const session = Session.get();
    const wsmc = currentDocument.split('-')[0];
    dispatch({
      type: 'znfz/getWh',
      payload: {
        dwbm: session.dwbm,
        gh: session.gh,
        bmsah: match.params.id,
        znfzWsmbmc: wsmc,
      }
    }).then(({success, data}) => {
      if (success) {
        if (data && data.code === 0) {
          this.newWh();
        } else if (data && data.code === 1) {
          this.repeatWh();
        } else {
          message.error('数据获取失败，请重试！');
        }
      } else {
        message.error('智能辅助文书模板未能在文书对应表中找到对应数据，请选择其他文书！');
      }
    })
  };

  pushDoc = () => {
    const {params: {WOPISrc}, dispatch, match, currentDocument} = this.props;
    const wsmc = currentDocument.split('-')[0];
    this.setState({
      tsLoading: true,
    });


    dispatch({
      type: 'znfz/createOrUpdate',
      payload: {
        sourceid: match.params.id + '_' + wsmc,
      }
    }).then(({success, data}) => {
      if (success) {
        if (data) {
          this.createWs();
        } else {
          this.wsUpdate();
        }
      } else {
        message.error('数据获取失败，请重试！');
      }
    });
  };

  releaseData = () => {
    confirm({
      title: '确认发布日报吗?',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        this.setState({loading: true}, () => {
          if (this.props.onReload) {
            this.props.onReload && this.props.onReload();
            this.hideLoading();
          }
        })
      },
      onCancel: () => {
      },
    });
  };

  handleMenuClick = (docName) => {
    const {dispatch, match} = this.props;
    const session = Session.get();

    if (docName) {
      this.setState({loading: true}, () => {
        this.props.onLoad && this.props.onLoad(docName);
        this.hideLoading();
      });
    }

    dispatch({
      type: 'znfz/wsmbdy',
      payload: {
        dwbm: session.dwbm,
        gh: session.gh,
        bmsah: match.params.id,
        znfzWsmbmc: docName,
      }
    }).then(({success, data}) => {
      this.setState({
        disable: data,
      });
      if (!data) {
        this.setState({
          tsLoading: false,
        });
      }
    })
  };

  hideLoading = () => {
    setTimeout(() => this.setState({loading: false}), 3000)
  };

  render() {
    const {src, params, docs, currentDocument, visible, buttonVisible, spVisible, match} = this.props;
    const {loading, tsLoading, treeData, selectData, code, disable} = this.state;

    const {getFieldDecorator} = this.props.form;
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 18},
    };

    const menu = (
      <Menu onClick={({key}) => this.handleMenuClick(key)}>
        {
          docs.map(doc => <Menu.Item key={doc}>{doc && doc.split("_")[0]}</Menu.Item>)
        }
      </Menu>
    );

    const header = (
      <Fragment>
        {loading && <div className={classnames(styles.loader, 'loader')}>&nbsp;</div>}
        <Spin spinning={tsLoading} size='large' className={styles.spin}/>
        <div className={classnames(styles.header, 'header')}>
          <Dropdown overlay={menu} placement="bottomCenter">
            <Button className="ant-dropdown-link" href="#">
              {currentDocument && currentDocument.split("_")[0]} <Icon type="down"/>
            </Button>
          </Dropdown>
          {
            !visible && (buttonVisible ?
                <Fragment>
                  <Divider type="vertical"/>
                  <a onClick={this.releaseData}><Icon type='edit'/> 发布日报</a>
                </Fragment>
                :
                <Fragment>
                  <Divider type="vertical"/>
                  <a onClick={this.reloadData}><Icon type='reload'/> 重新生成文书</a>
                  {
                    !spVisible && (
                      <Fragment>
                        <Divider type="vertical"/>
                       <a onClick={this.pushDoc}><Icon type='upload'/> 推送</a> 
                       :
                          <Tooltip title="此类型文书尚未配置推送功能，暂无法推送" placement="bottom"><a
                            style={{cursor: 'not-allowed'}}><Icon
                            type='upload'/> 推送</a></Tooltip>
                      </Fragment>
                    )
                  }
                </Fragment>
            )
          }
        </div>
      </Fragment>
    );

    const modalTitle = code === 1 ? '选择文书' : code === 2 ? '选择一条文书配置' : '';

    return (
      <div className={classnames(styles.default, 'cm-office')}>
        <Frame src={src} loadText={'正在加载文书...'} header={header} trigger={true} params={params} fixHeight={'100%'}/>
        <WordnameModal
          title={modalTitle}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          treeData={treeData}
          selectData={selectData}
          onFileSelect={this.onFileSelect}
          match={match}
          onClick={this.onClick}
          code={code}
        />
      </div>
    )
  }
}
