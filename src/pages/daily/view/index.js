import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Card,Menu,DatePicker,Icon,Button,Select } from 'antd';
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
const { RangePicker } = DatePicker;

class Daily extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      fullScreen: false,
      currentDocument: '',
      docParam: {},
      docUrl: '',
      dailies: [],
      startDate: '',
      endDate: '',
      dwmc: '浙江省院',
      dwbm: '32',
      ysay: ["交通肇事罪", "危险驾驶罪"],
    };
    this.loadedDoc = {};
  }

  componentDidMount() {
    const {dispatch} = this.props;
    let startDate = '';
    let endDate = '';
    if(new Date().getMonth()+1 >= 1 && new Date().getMonth()+1 <= 9){
      if(new Date().getDate() >= 1 && new Date().getDate() <= 9){
        startDate = `${new Date().getFullYear()}-0${new Date().getMonth()+1}-01T00:00:00`;
        endDate = `${new Date().getFullYear()}-0${new Date().getMonth()+1}-0${new Date().getDate()}T23:59:59`;
      }else{
        startDate = `${new Date().getFullYear()}-0${new Date().getMonth()+1}-01T00:00:00`;
        endDate = `${new Date().getFullYear()}-0${new Date().getMonth()+1}-${new Date().getDate()}T23:59:59`;
      }
    }else{
      if(new Date().getDate() >= 1 && new Date().getDate() <= 9){
        startDate = `${new Date().getFullYear()}-${new Date().getMonth()+1}-01T00:00:00`;
        endDate = `${new Date().getFullYear()}-${new Date().getMonth()+1}-0${new Date().getDate()}T23:59:59`;
      }else{
        startDate = `${new Date().getFullYear()}-${new Date().getMonth()+1}-01T00:00:00`;
        endDate = `${new Date().getFullYear()}-${new Date().getMonth()+1}-${new Date().getDate()}T23:59:59`;
      }
    }
    this.setState({startDate,endDate});
    dispatch({
      type: 'daily/getTree',
      payload: {
        dwbm: this.state.dwbm,
      },
    });
    dispatch({
      type: 'daily/PublishDailies',
      payload: {
        startDate: startDate,
        endDate: endDate,
        dwbm: this.state.dwbm,
        dwmc: this.state.dwmc,
        ysay: this.state.ysay,
      },
    }).then(({success, data}) => {
      if (success) {
        this.setState({dailies:data});
        if(!_.isEmpty(data)){
          this.fetchDocument(data[0].title, data[0].key);
        }
      }
    });
  }

  fetchDocument = (doc, data) => {
    const docParam = {
      WOPISrc: `http://gateway:8762/wopi/files/${data}`,
      access_token: 'report_bot',
    };
    this.loadedDoc[doc] = data;
    this.setState({
      currentDocument: doc,
      docParam,
      docUrl: `http://${WOPI_HOST}/wv/wordviewerframe.aspx`,
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
    const {startDate,endDate,ysay} = this.state;
    const haveChild = values.children ? true : false;
    const newdwbm = haveChild ? values.value === '320000' ? '32' : values.value.substring(0, 4) : values.value;
    this.setState({
      dwmc: values.name,
      dwbm: newdwbm,
    });
    dispatch({
      type: 'daily/PublishDailies',
      payload: {
        startDate:startDate,
        endDate: endDate,
        dwbm: newdwbm,
        dwmc: values.name,
        ysay: ysay,
      },
    }).then(({success, data}) => {
      if (success) {
        this.setState({dailies:data});
        if(!_.isEmpty(data)){
          this.fetchDocument(data[0].title, data[0].key);
        }
      }
    });
  };


  ysayChange = (value) => {
    const {dispatch} = this.props;
    const {startDate, endDate, dwbm, dwmc} = this.state;
    let ysay = [];
    console.log(value)
    if (value === "dqz") {
      ysay = ["盗窃罪"]
    } else if (value === "jtzs") {
      ysay = ["交通肇事罪", "危险驾驶罪"]
    }
    this.setState({ysay: ysay})
    dispatch({
      type: 'daily/PublishDailies',
      payload: {
        startDate:startDate,
        endDate: endDate,
        dwbm: dwbm,
        dwmc: dwmc,
        ysay:ysay
      },
    }).then(({success, data}) => {
      if (success) {
        this.setState({dailies:data});
        if(!_.isEmpty(data)){
          this.fetchDocument(data[0].title, data[0].key);
        }
      }
    });
  }

  toggleFullScreen = () => {
    this.setState({fullScreen: !this.state.fullScreen});
  };

  onLoad = (doc) => {
    if (this.loadedDoc[doc]) {
      this.fetchDocument(doc, this.loadedDoc[doc]);
      return false;
    }
    this.state.dailies.map((v,k) => {
      if(v.title === doc){
        this.fetchDocument(doc, v.key);
      }
    });
  };

  onChange = (date,dateString) => {
    this.setState({
      startDate:`${dateString[0]}T00:00:00`,
      endDate:`${dateString[1]}T23:59:59`,
    });
  };

  render() {
    const {daily} = this.props;
    const {treeList} = daily;
    let docs = [];
    this.state.dailies&&this.state.dailies.map(d => {
      docs.push(d.title);
    });
    const SearchTreeList = {
      showSearch: false,
      tree: this.buildTreeData(treeList),
      expandRoot: [],
      onSelect: this.treeSelect,
    };

    return (
      <div className={styles.default}>
        <div className={styles.menu}>
          <div style={{fontWeight: 600, fontSize: 18, margin: '20px 0 0 10px'}}>办案日报</div>
          <Select defaultValue="jtzs"
                  className={styles.ysay}
                  onChange={this.ysayChange}>
            <Option value="jtzs">交通肇事/危险驾驶</Option>
            <Option value="dqz">盗窃罪</Option>
          </Select>
          <RangePicker format='YYYY-MM-DD'
                       onChange={this.onChange}
                       allowClear={false}
                       defaultValue={[moment(`${new Date().getFullYear()}-${new Date().getMonth()+1}-01`,'YYYY-MM-DD'),moment(`${new Date().getFullYear()}-${new Date().getMonth()+1}-${new Date().getDate()}`,'YYYY-MM-DD')]}
                       disabledDate={(current) => current && current > moment().endOf('day')}
                       className={styles.monthPicker} />
          <SearchTree {...SearchTreeList} />
        </div>
        <div className={styles.menu} style={{marginLeft: 8,width: 280}}>
          <p className={styles.p}>日报目录</p>
          <Menu onClick={({key}) => this.onLoad(key)}>
            {
              this.state.dailies&&this.state.dailies.map(d => <Menu.Item key={d.title}><Icon type="file-text" />{d.title}</Menu.Item>)
            }
          </Menu>
        </div>
        <div className={classnames(styles.mask, this.state.fullScreen ? styles.fullScreen : '')}/>
        <Card className={classnames(styles.content, this.state.fullScreen ? styles.fullScreen : '')}>
          {
            !_.isEmpty(this.state.dailies) && <OnlineOffice docs={docs}
                                              currentDocument={this.state.currentDocument}
                                              src={this.state.docUrl}
                                              params={this.state.docParam}
                                              onLoad={this.onLoad}
                                              visible={true}/>
          }
        </Card>
      </div>
    );
  }
}

@connect(({daily, loading}) => ({
  daily,
  loading: loading.effects['daily/PublishDailies'],
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
