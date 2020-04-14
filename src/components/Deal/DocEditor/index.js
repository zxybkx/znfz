import React, {PureComponent, Fragment} from 'react';
import {Modal, Menu, Button, Icon, Divider, Dropdown} from 'antd';
import _ from 'lodash';
import ReactEditor from 'lib/ReactEditor';
import styles from './index.less';

const confirm = Modal.confirm;

export default class DocEditor extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      docData: props.docData || null,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      docData: nextProps.docData,
    })
  }

  onSave = (content) => {
    const {dispatch, stage} = this.props;
    const {docData} = this.state;
    const basePath = stage === 'ZJ' ? 'zcjd' : 'gsjd';
    if (content) {
      dispatch({
        type: `${basePath}/saveDocData`,
        payload: {
          data: {...docData, jsondata: {data: content}},
        },
      });
    }
  };

  onExport = (content) => {
    const {dispatch, stage} = this.props;
    const {docData} = this.state;
    const basePath = stage === 'ZJ' ? 'zcjd' : 'gsjd';
    if (content) {
      dispatch({
        type: `${basePath}/exportDocData`,
        payload: {
          data: {...docData},
        },
      });
    }
  };

  reloadData = () => {
    confirm({
      title: '确认重新生成文书吗?',
      content: '重新生成文书内容会将当前文书重置到初始状态，已经编辑保存的内容将丢失!',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        this.setState({loading: true}, ()=> {
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

  onReload = () => {
    this.setState({
      docData: null,
    });
    const {dispatch, stage} = this.props;
    const {docData} = this.state;
    const basePath = stage === 'ZJ' ? 'zcjd' : 'gsjd';
    dispatch({
      type: `${basePath}/reloadDocData`,
      payload: {
        data: {...docData},
      },
    });
  };

  showProblemResult = (keyid, data) => {
    const {dispatch, ajxx, stage} = this.props;
    const basePath = stage === 'ZJ' ? 'zcjd' : 'gsjd';
    if (_.startsWith(keyid, 'NLP_')) {
      dispatch({
        type: `${basePath}/changeState`,
        payload: {
          stage,
          docViewVisible: true,
          coords: data,
        },
      });
    } else {
      let _key = _.replace(keyid, /^YSJL_/, '');
      dispatch({
        type: `${basePath}/openResultViewModal`,
        payload: {
          stage,
          bmsah: ajxx.bmsah,
          keyid: _key,
        },
      });
    }
  };

  handleMenuClick = (docName) => {
    if(docName){
      this.setState({loading: true}, ()=> {
        this.props.onLoad && this.props.onLoad(docName);
        this.hideLoading();
      });
    }
  };

  hideLoading = () => {
    setTimeout(()=> this.setState({loading: false}), 3000)
  };

  render() {
    const {docData} = this.state;
    const {docs, currentDocument} = this.props;
    const doc = docData && docData.jsondata && docData.jsondata.data ? docData.jsondata.data : null;

    const menu = (
      <Menu onClick={({key}) => this.handleMenuClick(key)}>
        {
          docs.map(doc => <Menu.Item key={doc}>{doc}</Menu.Item>)
        }
      </Menu>
    );

    return (
      <Fragment>
        <div className={styles.header}>
          <Dropdown overlay={menu} placement="bottomCenter">
            <Button className="ant-dropdown-link" href="#">
              {currentDocument} <Icon type="down"/>
            </Button>
          </Dropdown>
          <Divider type="vertical"/>
          <a onClick={this.reloadData}><Icon type='reload'/> 重新生成文书</a>
        </div>
        <ReactEditor doc={doc}
                     fullScreen={this.props.fullScreen}
                     loading={this.state.docData === null}
                     linkClickHandler={this.showProblemResult}
                     onSave={this.onSave}
                     onExport={this.onExport}
                     onReload={this.onReload}/>
      </Fragment>

    );
  }

}

