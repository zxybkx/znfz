import React, {PureComponent, Fragment} from 'react';
import {Modal, Icon, Divider, Dropdown, Menu, Button, message, Spin, Tooltip, Alert} from 'antd';
import classnames from 'classnames';
import Frame from 'lib/Frame/Frame';
import styles from './index.less';
import WordnameModal from './wordTree';
import Session from 'utils/session';
import _ from 'lodash';
import qs from 'querystring';

const confirm = Modal.confirm;
const warningStyle = {
  position: 'fixed', top: '35%', left: '78%', width: '20%', zIndex: '999'
};

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
      parameter: {},
      tableData: {},
      disable: true,
      text: '',
      iframeURL: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.currentDocument !== nextProps.currentDocument) {
      const {currentDocument} = nextProps;
      const {dispatch, match} = this.props;
      const session = Session.get();
      const wsmc = currentDocument && currentDocument.split('-')[0];

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


  onClick = (record) => {
    this.setState({
      tableData: record,
    });
  };


  handleOk = (e) => {
    const {params: {WOPISrc}, match, currentDocument} = this.props;
    const {code, parameter, tableData} = this.state;
    const docId = WOPISrc.substring(WOPISrc.lastIndexOf('/') + 1);
    const wsmc = currentDocument.split('-')[0];
    const bgr = currentDocument.split('-')[1];

    const payload = {
      docId: docId,
      // gyws: true,
      lcmbbh: parameter.lcmbbm,
      lcjdbh: parameter.lcjdbh,
      wsmc: wsmc,
      sourceID: bgr ? match.params.id + '_' + wsmc + '（' + bgr + '）' : match.params.id + '_' + wsmc,
      bmsah: match.params.id,
    };

    if (_.isEmpty(parameter)) {
      const text = '请选择一份文书';
      this.setState({
        text
      });
    } else {
      this.setState({
        parameter: {},
        visible: false
      });
      this.wsInterface(payload)
    }

    // const wsData = code === 1 ? payload : code === 2 ? tableData ? wsTableData : '' : '';

    // setTimeout(() => this.setState({ tsLoading: false }, () => {
    //   if (this.props.onPush) {
    //     this.props.onPush && this.props.onPush(payload);
    //   }
    // }), 30000);
  };

  handleCancel = (e) => {
    this.setState({
      parameter: {},
      visible: false,
      tsLoading: false,
      text: ''
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
        setTimeout(() => this.setState({tsLoading: false}, () => {
          if (this.props.onPush) {
            this.props.onPush && this.props.onPush(payload);
          }
        }), 30000)
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
        setTimeout(() => this.setState({tsLoading: false}, () => {
          if (this.props.onPush) {
            this.props.onPush && this.props.onPush(payload);
          }
        }), 30000)
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
      parameter: nodeValue[0],
      text: ''
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
        }).then((result) => {
          if (result && result.success) {
            this.setState({
              code: result.data.code,
              tsLoading: true,
            });
            if (result && result.data && result.data.code === 0) {

              this.onSave(result.data);
            } else if (result && result.data && result.data.code === 1) {

              this.setState({
                treeData: result.data.data
              });
              this.publicWs(result.data && result.data.data);
            } else if (result && result.data && result.data.code === 2) {
              this.setState({
                selectData: result.data.data,
              });

              this.unPublicWss(result.data && result.data.data);
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
    }).then((result) => {
      if (result && result.success) {
        this.setState({
          code: result.data.code,
          tsLoading: true,
        });
        if (result && result.data && result.data.code === 0) {

          this.onSave(result.data);
        } else if (result && result.data && result.data.code === 1) {
          this.setState({
            treeData: result.data.data
          });

          this.publicWs(result.data && result.data.data);
        } else if (result && result.data && result.data.code === 2) {
          this.setState({
            selectData: result.data.data,
          });

          this.unPublicWss(result.data && result.data.data);
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
  /**
   *  推送弹框
   */

  Pushbounced = () => {
    const {params: {WOPISrc}, dispatch, match, currentDocument} = this.props;
    const session = Session.get();
    const wsmc = currentDocument.split('-')[0];
    const docId = WOPISrc.substring(WOPISrc.lastIndexOf('/') + 1);
    const bgr = currentDocument.split('-')[1];
    // dispatch({
    //   type: 'znfz/credoc',
    //   payload: {
    //     docId: docId,
    //     sourceID: bgr ? match.params.id + '_' + wsmc + '（' + bgr + '）' : match.params.id + '_' + wsmc,
    //     bmsah: match.params.id,
    //     wsmc: wsmc,
    //   }
    // }).then(({success, data}) => {
    //   if (success) {
    //     alert('推送成功')
    //   }
    // })
    const payload = {
      docId: docId,
      sourceID: bgr ? match.params.id + '_' + wsmc + '（' + bgr + '）' : match.params.id + '_' + wsmc,
      bmsah: match.params.id,
      wsmc: wsmc,
    };
    this.wsInterface(payload)
  };

  //文书推送接口
  wsInterface = (payload) => {
    const {dispatch} = this.props;
    dispatch({
      type: 'znfz/credoc',
      payload: payload
    }).then((res) => {
      if (res) {
        const {success, data} = res;
        if (success && data) {
          data.message ? message.error(data.message) : message.success('推送成功')
        } else {
          message.error('数据操作异常')
        }
      }
    })
  };

  /**
   * 文书推送
   */

  pushDoc = () => {
    const {params: {WOPISrc}, dispatch, match, currentDocument, params, src} = this.props;
    const wsmc = currentDocument.split('-')[0];
    confirm({
      title: '确认推送本文档至统一业务应用系统吗?',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        dispatch({
          type: 'znfz/wsts',
          payload: {
            bmsah: match.params.id,
            wsmc: wsmc
          }
        }).then(({data, success}) => {
          // console.log(data);
          if (data && success) {
            if ((JSON.stringify(data) == "{}")) {
              this.Pushbounced();
            }
            if (!_.isEmpty(data)) {
              this.setState({
                treeData: data.result
              });
              this.publicWs()
            }
          }
        })
      },
    });
  };

  handleMenuClick = (docName) => {
    const {dispatch, match, currentDocument} = this.props;
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
    const {src, params, docs, jldocs, currentDocument, match, showTips, query} = this.props;
    const {loading, tsLoading, treeData, selectData, code, disable, text} = this.state;
    const _params = _.cloneDeep(params);
    _.set(_params, 'ui', 'zh-CN');
    const judegeDocs = query && query.type === 'jl' ? jldocs : docs;

    const menu = (
      <Menu onClick={({key}) => this.handleMenuClick(key)}>
        {
          judegeDocs && judegeDocs.map((doc, i) => {
            if (!doc.multiple) {
              return (
                <Menu.SubMenu title={doc.wsmbmc} key={doc.wsmbmc}>
                  {doc.bgrs && doc.bgrs.map(o =>
                    <Menu.Item key={doc.wsmbmc + '-' + o}>{o}</Menu.Item>
                  )}
                </Menu.SubMenu>
              )
            } else {
              return (
                <Menu.Item key={doc.wsmbmc}>
                  {doc.wsmbmc}
                </Menu.Item>
              )
            }
          })
        }
      </Menu>
    );

    const header = (
      <Fragment>
        {loading && <div className={classnames(styles.loader, 'loader')}>&nbsp;</div>}
        <Spin spinning={tsLoading} size='large' className={styles.spin} tip="推送中..."/>
        <div className={classnames(styles.header, 'header')}>
          <Dropdown overlay={menu} placement="bottomCenter">
            <Button className="ant-dropdown-link" href="#">
              {currentDocument} <Icon type="down"/>
            </Button>
          </Dropdown>
          <Divider type="vertical"/>
          <a onClick={this.reloadData}><Icon type='reload'/> 重新生成文书</a>
          <Divider type="vertical"/>
          <a onClick={this.pushDoc}><Icon type='upload'/> 推送</a>
          {/* {disable ? <a onClick={this.pushDoc}><Icon type='upload' /> 推送222222</a> :
            <Tooltip title="此类型文书尚未配置推送功能，暂无法推送" placement="bottom"><a style={{ cursor: 'not-allowed' }}><Icon
              type='upload' /> 推送22222</a></Tooltip>} */}

        </div>
      </Fragment>
    );
    //code=1 公用文书 code=2 非公用文书多条配置
    const modalTitle = <div>
      <span>选择一条文书配置</span>
      {
        text === '' ? '' : <span style={{color: 'red'}}>{text}</span>
      }
    </div>;

    const des = (
      <div>
        <p>复制粘贴外部文字后，请使用格式刷统一文字格式，否则会造成推送后文书格式不准确！</p>
        <p>请承办人在系统文书制作中不要自行更改行间距、字体、对齐方式！</p>
        <p>需对于有文号的文书，文号位置请勿粘贴复制，否则会导致文号未获取！</p>
      </div>
    );

    return (
      <div className={classnames(styles.default, 'cm-office')}>
        <Frame src={src} loadText={'正在加载文书...'} header={header} trigger={true} params={_params} fixHeight={'100%'}/>

        <div style={{...warningStyle, display: showTips && showTips === 'true' ? '' : 'none'}}>
          <Alert
            message="注意事项"
            description={des}
            type="warning"
            showIcon
            closable
          />
        </div>

        <iframe
          style={{display: 'none'}}
          title="invisibleIframe"
          ref={c => (this.invisibleIframe = c)}
          src={this.state.iframeURL}
        />

        <WordnameModal
          title={'公用文书'}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          treeData={treeData}
          selectData={selectData}
          onFileSelect={this.onFileSelect}
          match={match}
          onClick={this.onClick}
          code={code}
          info={text}
        />
      </div>
    )
  }
}
