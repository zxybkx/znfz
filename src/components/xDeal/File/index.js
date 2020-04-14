import React, {PureComponent, Fragment} from 'react';
import {Card, Spin, message, Select, Modal, Form, Button, Tooltip, Radio, Icon} from 'antd';
import classnames from 'classnames';
import PageHeaderLayout from 'layouts/PageHeaderLayout';
import _ from 'lodash';
import styles from './index.less';
import OcrModal from './OcrModal';
import ColumnLayout from 'layouts/ColumnLayout';
import Tree from './NlpTree';
import DocPreview from 'components/xDeal/DocPreview';
import MultilScreen from 'components/xDeal/MultilScreen';//多屏
import NlpInfo from 'components/xDeal/NlpInfo';
import MarkInfo from 'components/xDeal/MarkInfo';
import NewMarkInfo from 'components/xDeal/NewMarkInfo';
import {connect} from 'dva';

const confirm = Modal.confirm;
const Option = Select.Option;

@connect(({global, znfz, zcjd, loading}) => ({
  global,
  znfz,
  zcjd,
}))
@Form.create()
class EditForm extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      list: props.list,
      memberJzmc: props.memberJzmc,
    }
  }

  componentWillReceiveProps(nextProps) {
    const {setFieldsValue} = this.props.form;
    if (!_.isEqual(nextProps.memberJzmc, this.props.memberJzmc)) {
      this.setState({
        ...nextProps,
      });
      setFieldsValue({'department': nextProps.memberJzmc});
    } else if (!_.isEqual(nextProps.list, this.props.list)) {
      this.setState({
        ...nextProps,
      });
      setFieldsValue({'department': !_.isEmpty(nextProps.docNlp) ? nextProps.docNlp.jzmc : (nextProps.list && nextProps.list[0] && nextProps.list[0].category)});
    }
  }

  render() {
    const {form: {getFieldDecorator}, handleChange} = this.props;
    const {list, title} = this.state;
    return (
      <Form className={styles.form}>
        {getFieldDecorator('department', {
          initialValue: list && list.length > 0 ? '0' : '',
        })(
          <Select className={styles.sel}
                  onSelect={handleChange}>
            {
              list && list.map((obj, index) => {
                return (
                  <Option key={index} value={'' + index}>{obj.category}</Option>
                );
              })
            }
          </Select>,
        )}
      </Form>
    )
  }
}

export default class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      treeType: 'left',
      facts: [],
      allList: [],
      usingList: [],
      currentList: [],
      npagList: [],
      treeList: [],
      currentPage: '1-1',
      imageSource: [],
      jzmc: '',
      jnbmfw: [-1, -1],
      scrollPageNum: 0,
      docNlp: {},
      markList: [],
      factMarkList: [],
      fileKey: '',
      filename: '',
      fileCategory: '',
      isSuspect: false,
      rightImageSource: [],
      bottomImageSource: [],
      toprImageSource: [],
      threeImageSource: [],
      tool: 'element',
      elseSave: true,
      wwcTitle: [],
      firststyle: '',
      twostyle: '',
      threestyle: '',
      node: '',
      mul: '',//卷宗图片位置
      title: {},
      memberJzmc: '', // 上次操作的卷宗
      yj: '',
      aa: {},
      nlpInfoKey: 0
    }
  }


  componentDidMount = () => {
    const {dispatch, match, stage, znfz, ysay} = this.props;
    const {params: {id}} = match;
    const base = stage === 'ZJ' ? 'zcjd' : stage === 'GS' ? 'gsjd' : 'spjd';
    const sub = stage === 'SP' ? 'spdeal' : 'deal';
    const newbmsah = _.replace(id, '审判', '起诉');
    const {imageSource, mul, currentList} = this.state;
    dispatch({
      type: 'znfz/getAjxx',
      payload: {
        bmsah: stage === 'SP' ? newbmsah : id,
      },
    });
    this.getFacts();

    dispatch({
      type: 'znfz/getBshyTreeList',
      payload: id
    }).then(({data, success}) => {
      if (data && success) {
        const _data = this.getUsingList(data);
        this.setState({
          allList: data,
          usingList: _data,
        });
        this.getluyou();
        if (data.length > 0) {
          const list = this.state.treeType === 'left'
            ? _data[0].data : this.mergeTreeList(_data);
          this.onChangeType(list);
        }
      }
    });

    dispatch({
      type: 'znfz/getNlpConfig',
      payload: {
        name: 'NLP_TITLE',
      },
    });
  };

  loadTreeList = (currentPage, filename, imageSource, fileCategory, index) => {
    const {match: {params: {id}}, dispatch} = this.props;
    dispatch({
      type: 'znfz/getBshyTreeList',
      payload: id
    }).then(({success, data}) => {
      if (success && data) {
        const _data = this.getUsingList(data);
        this.setState({
          allList: data,
          usingList: _data,
        });
        if (data.length > 0) {
          const list = this.state.treeType === 'left'
            ? _data[index].data : this.mergeTreeList(_data);
          this.onChangeType(list, currentPage, filename, imageSource, fileCategory);
        }
      }
    })
  };

  //记忆功能
  getluyou = (title) => {
    const {dispatch, match, stage, znfz, ysay} = this.props;
    const {params: {id}} = match;
    const {imageSource, filename, allList, currentList, jzmc, memberJzmc, docNlp} = this.state;
    dispatch({
      type: 'znfz/yjhjItem',
      payload: {
        bmsah: id,
      },
    }).then(({data, success}) => {
      if (success && data) {
        this.setState({
          title: data.title,
        });
        const title = this.state.title;
        let aj = {
          j: '',//下标赋值
          reel: '',//卷宗
          idx: '',//一层下标

        };
        //位置
        let category = '';
        const yjIndex = data.images && data.images.split('|')[0];

        (yjIndex && yjIndex >= 0) && confirm({
          onOk: () => {
            allList && allList.map((p, index) => {
              category = p.category;
              p.data && p.data.map((item, i) => {
                if ((item.title == this.state.title)) {
                  this.setState({
                    memberJzmc: category,
                  });
                  aj.j = i;
                  aj.idx = index;
                  return;
                }
                item.title;
              });
            });
            this.handleChange(yjIndex);
            const idss = 1 + '-' + (aj.j + 1);
            this.setState({
              currentPage: idss,
              selvalue: aj.idx,
            });
            setTimeout(() => {
              this.onSelect(data.images && data.images.split('|')[1]);
            }, 100);
          },
          content: `上次阅卷到"${allList[yjIndex].category}-${title}",是否继续?`,
          okText: '继续',
          okType: 'primary',
          cancelText: '取消',
        })
      }
    });
  };

  getUsingList = (data) => {
    const _data = _.cloneDeep(data);
    _.map(_data, (item) => {
      _.remove(item.data, (o) => o.view === 'red')
    });
    _.remove(_data, (item) => item.data.length === 0);
    return _data;
  };

  getFacts = () => {
    const {dispatch, match} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: 'znfz/getFactList',
      payload: {
        bmsah: id,
      },
    }).then(({success, data}) => {
      const newData =
        data && data.length > 0 ? data.map((item, index) => {
          return ({
            ...item,
            mergekey: `第${index + 1}笔`
          })
        }) : [];
      if (success && data) {
        this.setState({facts: newData});
      }
    });
  };


  onTreeTypeChange = (e) => {
    const {usingList} = this.state;
    this.setState({
      treeType: e.target.value
    }, () => {
      const data =
        e.target.value === 'left' ? usingList && usingList[0].data : this.mergeTreeList(usingList);
      this.onChangeType(data);
    });
  };

  mergeTreeList = (data) => {
    let arr = [];
    data && data.map((o, i) => {
      o.data && o.data.map((obj) => {
        arr.push(obj);
      })
    });
    arr.sort((item1, item2) => this.comparisionFunction(item1.catalog) - this.comparisionFunction(item2.catalog));
    return arr;
  };

  comparisionFunction = (catalog) => {
    const sourceArr = ["诉讼程序文书", "物证", "书证", "证人证言、被害人陈述", "犯罪嫌疑人供述和辩解", "鉴定意见", "勘验、检查、辨认、侦查实验等笔录", "视听资料、电子数据", "其他"];
    return sourceArr.indexOf(catalog)
  };

  handleChange = (key) => {
    const {usingList} = this.state;
    this.onChangeType(usingList[key].data);
  };

  // 文书标记回调
  addWsMark = (currentPage, filename, imageSource, fileCategory, type) => {
    const {match: {params: {id}}, dispatch} = this.props;
    const {docNlp, allList} = this.state;
    const index = _.findIndex(allList, o => o.category === docNlp.jzmc);
    const images = (index > -1 ? index : 0) + '|' + currentPage;
    dispatch({
      type: 'znfz/alterVisit',
      payload: {
        bmsah: id,
        images,
        title: filename,
        visit: type
      }
    }).then((res) => {
      if (res) {
        const {success, data} = res;
        if (success && data) {
          this.loadTreeList(currentPage, filename, imageSource, fileCategory, index > -1 ? index : 0);
        }
      }
    })
  };

  onSelect = (id, defaultTool) => {
    //颜色切换
    const tool = defaultTool ? defaultTool : this.state.tool;
    const {allList, docNlp} = this.state;
    if (typeof (id) === 'string') {
      const ids = id.split('-');
      if (ids.length > 1) {
        const i = Number(ids[1]);
        const {currentList} = this.state;
        if (currentList && currentList[i - 1]) {
          switch (tool) {
            case 'double':
              this.setState({
                currentPage: id,
                rightImageSource: currentList[i - 1].pages,
              });
              break;
            case 'compare':
              this.setState({
                currentPage: id,
                imageSource: currentList[i - 1].pages,
                rightImageSource: currentList[i - 1].partner
              });
              break;
            case 'Eyefinity':
              this.setState({
                currentPage: id,
                threeImageSource: currentList[i - 1].pages,
              });
              break;
            case 'bottom':
              this.setState({
                bottomImageSource: currentList[i - 1].pages,
              });
              break;
            case 'tor':
              this.setState({
                toprImageSource: currentList[i - 1].pages,
              });
              break;
            default:
              this.setState({
                imageSource: currentList[i - 1].pages,
                currentPage: id,
                filename: currentList[i - 1].title,
                fileCategory: currentList[i - 1].catalog,
              }, () => {
                $(this.div).scrollTop(0);
                this.afterSelect('1');
                this.getMark();
              });
              break;
          }
        }
      }
    }
  };

  afterSelect = (type) => {
    const {dispatch, match} = this.props;
    const {currentPage, allList, docNlp, filename, fileCategory, imageSource} = this.state;
    // ysay === '故意伤害罪' && this.getLccontrol();
    const {params: {id}} = match;
    if (imageSource && imageSource[0]) {
      const i = imageSource[0].image.split('.');
      //const image = i[0].substring(i[0].length - 9);
      const images = i[0].split('/');
      const imagesLg = images.length;
      const image = _.join(_.slice(images, imagesLg - 2), '/');
      dispatch({
        type: 'znfz/getNlpByBmsahAndImage',
        payload: {
          image: image,
          bmsah: id,
        },
      }).then((result) => {
        if (result) {
          const {success, data} = result;
          if (success && data) {
            this.setState({
              docNlp: data,
              fileKey: image,
              jzmc: data.jzmc,
              jnbmfw: data.jnbmfw ? data.jnbmfw : [-1, -1]
            }, () => {
              this.addWsMark(currentPage, filename, imageSource, fileCategory, type);
              this.savejy(allList, this.state.docNlp, currentPage);
            });
          }
        }
      })
    }
  };

  onDrop = (e, target) => {
    const transferData = e.dataTransfer.getData('node');
    if (!transferData) return;
    if (this.state.tool === 'compare') return;
    const data = JSON.parse(transferData);
    this.onSelect(data.id, target);
  };
  //保存
  savejy = (currentList, docNlp, currentPage) => {
    const {dispatch, match} = this.props;
    const {params: {id}} = match;
    const {fileKey, filename, imageSource} = this.state;
    const index = _.findIndex(currentList, item => item.category === docNlp.jzmc);
    let mul = index + '|' + (currentPage);
    dispatch({
      type: 'znfz/saveYjHj',
      payload: {
        bmsah: id,
        images: mul,
        title: filename,
      }
    })
  };

  onChangeType = (data, currentPage, filename, imageSource, fileCategory) => {
    const {treeType} = this.state;
    if (data) {
      this.setState({
        treeList: treeType === 'left' ? this.dealTree(data) : this.dealRightTree(),
        currentPage: currentPage ? currentPage : '1-1',
        filename: filename ? filename : data[0] && data[0].title,
        fileCategory: fileCategory ? fileCategory : data[0] && data[0].catalog,
        currentList: data,
        node: data,
        imageSource: imageSource ? imageSource : data[0] && data[0].pages,
      }, () => {
        this.loadData();
        this.getMark();
      });
    }
  };

  select = (mul, color, allList) => {
    const {dispatch, match} = this.props;
    const {params: {id}} = match;
    const {filename, fileKey, firststyle} = this.state;
    dispatch({
      type: 'znfz/colorqh',
      payload: {
        bmsah: id,
        images: mul,
        title: filename,
        visit: color
      }
    }).then(({data, success}) => {
      let j = ''
      const idss = 1 + '-' + (j + 1);
      if (idss && data.visit === '1') {
        this.setState({
          twostyle: data.visit,
        })
      }
    })
  };

  dealTree = (listType) => {
    const treedata = [{id: 0, name: '所有文件', coords: [{page: 1}], children: []}];
    listType && listType.forEach((p, index) => {
      let c = [];
      if (p.view === 'red') {
        p && p.partner.forEach(
          (q) => {
            _.set(q, 'title', p.title)
            let node2 = {
              id: q.page,
              name: '第' + q.page + '页',
              // title:p.title,
              coords: [q],
            };
            c.push(node2);
          },
        );
      } else {
        p && p.pages.forEach(
          (q) => {
            _.set(q, 'title', p.title);
            let node2 = {
              id: q.page,
              name: '第' + q.page + '页',
              // title:p.title,
              coords: [q],
            };
            c.push(node2);
          },
        );
      }

      let node = {
        id: 1 + '-' + (index + 1),
        name: p.title,
        view: p.view === 'black' ? '' : p.view,
        catalog: p.catalog,
        img: p.pages && p.pages.length > 0 && p.pages[0].image,
        visit: p.visit
      };
      treedata[0].children.push(node);
    });
    return treedata;
  };

  dealRightTree = () => {
    const {usingList} = this.state;
    const treeRoot = require('../../../data/ws_category.json');
    const allWsRoot = treeRoot[1];
    const data = this.mergeTreeList(usingList);
    allWsRoot.children.map((node) => node.children = []);
    data && data.forEach((p, i) => {
      let cat = allWsRoot.children.find(node => node.name === p.catalog);
      if (!cat) {
        cat = allWsRoot.children.find(node => node.id === 29);
      }
      let node = {
        id: 1 + '-' + (i + 1),
        name: p.title,
        view: p.view === 'black' ? '' : p.view,
        catalog: p.catalog,
        img: p.pages && p.pages.length > 0 && p.pages[0].image,
        visit: p.visit
      };
      if (cat && cat.children) {
        cat.children.push(node);
      }
    });
    const treeList = treeRoot.filter(doc => doc.id === 2);
    return treeList;

  };

  onPageChange = (data) => {
    const {currentList, currentPage} = this.state;
    const page = String(currentPage).split('-');
    const num = Number(page[page.length - 1]);
    if (data === 'up') {
      if (num === 1) {
        message.error("已经是第一页")
      } else {
        const newNum = num - 1;
        this.onSelect('1-' + newNum);
      }
    } else {
      if (num === currentList.length) {
        message.error("已经是最后一份文书")
      } else {
        const newNum = num + 1;
        this.onSelect('1-' + newNum);
      }
    }
  };


  // nlp
  loadData = () => {
    const {dispatch, match, ysay} = this.props;
    // ysay === '故意伤害罪' && this.getLccontrol();
    const {params: {id}} = match;
    const {imageSource, mul} = this.state;
    if (imageSource && imageSource[0]) {
      const i = imageSource[0].image.split('.');
      const images = i[0].split('/');
      const imagesLg = images.length;
      const image = _.join(_.slice(images, imagesLg - 2), '/');

      dispatch({
        type: 'znfz/getNlpByBmsahAndImage',
        payload: {
          image: image,
          bmsah: id,
        },
      }).then((result) => {
        if (result) {
          const {success, data} = result;
          if (success && data) {
            this.setState({
              docNlp: data,
              fileKey: image,
              jzmc: data.jzmc,
              jnbmfw: data.jnbmfw ? data.jnbmfw : [-1, -1]
            });
          }
        }
      })
    }
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
  // 获取mark
  getMark = (attribute) => {
    const {dispatch, match} = this.props;
    const {params: {id}} = match;
    const {imageSource, filename, currentPage, fileCategory} = this.state;
    const img = imageSource[0].image.split('/');
    const image = img[4] + '/' + img[5].split('.')[0];

    dispatch({
      type: 'znfz/getMark',
      payload: {
        bmsah: id,
        image: image,
      }
    }).then(({data, success}) => {
      if (data && success) {
        this.setState({
          markList: data,
        });
        if (attribute) {
          let attributeList = [];
          _.map(data, (d) => {
            attributeList = _.concat(attributeList, d.attribute);
          });
          const _attributeList = _.uniq(attributeList);
          dispatch({
            type: 'znfz/attributeChange',
            payload: {
              bmsah: id,
              fileKey: image,
              attributeList: _attributeList
            }
          })
        }
      }
    });


    dispatch({
      type: 'znfz/getFactMark',
      payload: {
        bmsah: id,
        image: image,
      }
    }).then(({data, success}) => {
      if (data && success) {
        this.setState({
          factMarkList: data.content['犯罪事实'],
        });
      }
    })


    if (_.startsWith(filename)) {
      this.getIdentity(filename);
    } else {
      this.setState({
        isSuspect: false
      })
    }
  };

  getIdentity = (title) => {
    const {dispatch, match} = this.props;
    const {params: {id}} = match;
    dispatch({
      type: 'znfz/getIdentity',
      payload: {
        bmsah: id,
        title: title
      }
    }).then(({data, success}) => {
      if (success) {
        this.setState({
          isSuspect: data
        })
      }
    })
  };


  onToolClick = (data) => {
    const {allList, tool, treeType} = this.state;
    if (data !== tool) {
      const chooseList = data === 'compare' ? allList : this.getUsingList(allList);
      this.setState({
        imageSource: [],
        rightImageSource: [],
        threeImageSource: [],
        bottomImageSource: [],
        toprImageSource: [],
        tool: data,
        usingList: chooseList
      }, () => {
        const list = treeType === 'left' ? chooseList && chooseList[0].data : this.mergeTreeList(chooseList);
        this.onChangeType(list);
      });

      if (data === 'element') {
        this.loadData();
      }
    }

  };


  switchLeft = () => {
    const {tool, jzmc, jnbmfw, scrollPageNum} = this.state;
    switch (tool) {
      case 'element':
        return (
          <div>
            <div className={styles.info}>
              {jzmc}{jnbmfw[0] >= 0 ? '第' + (jnbmfw[0] + 1 + scrollPageNum) + '页' : ''}
            </div>
            <div className={styles.triggerUp}>
              <Button shape='circle' icon={'left'} onClick={() => this.onPageChange('up')}/>
            </div>
            <div className={styles.triggerDown}>
              <Button shape='circle' icon={'right'} onClick={() => this.onPageChange('down')}/>
            </div>
          </div>
        );
        break;
      case 'compare':
        return (
          <span className={styles.title}>公诉阶段</span>
        );
        break;
    }
  };

  onScroll = (num) => {
    this.setState({scrollPageNum: num});
  };

  ifSave = (data) => {
    this.setState({
      elseSave: data
    })
  };

  //nlpInfoKey
  getNlpInfoKey = (key) => {
    this.setState({
      nlpInfoKey: key
    })
  };

  switchRight = () => {
    const {
      tool, docNlp, facts, markList, factMarkList, isSuspect,
      fileKey, rightImageSource, filename, fileCategory, elseSave, currentPage, imageSource, nlpInfoKey
    } = this.state;

    const {dispatch, ajxx, match, znfz: {nlpConfig = {}}, ysay} = this.props;
    const nlpTitle = nlpConfig && nlpConfig.jsondata || {};
    const currentNlpData = docNlp.content && docNlp.content['侦查机关认定的犯罪嫌疑人基本情况'] && docNlp.content['侦查机关认定的犯罪嫌疑人基本情况'].length > 0 ? docNlp.content['侦查机关认定的犯罪嫌疑人基本情况'][nlpInfoKey] : {};

    switch (tool) {
      case 'element':
        const MarkInfoProps = {
          markList, factMarkList, filename, fileCategory, fileKey, facts, currentPage, imageSource,
          getMark: this.getMark, match, getFacts: this.getFacts, ysay, addWsMark: this.addWsMark
        };
        return (
          <div className={classnames(styles.mainRight, styles.rightBack)} ref={c => this.div = c}>
            <div>
              <div style={{padding: '0 20px'}}>
                <NlpInfo data={docNlp.content || {}}
                         match={match}
                         docNlp={docNlp}
                         facts={facts}
                         isSuspect={isSuspect}
                         dispatch={dispatch}
                         ajxx={ajxx}
                         includes={['主要信息', '签名信息', '侦查机关认定的犯罪嫌疑人基本情况', '证据列表', '基本信息', '犯罪嫌疑人信息', '鉴定意见', '鉴定资质', '检查笔录', '搜查笔录', '委托书'
                           , '车辆技术检验报告', '机动车鉴定', '痕迹检验', 'DNA鉴定', '印章信息', '邮戳信息', '精神疾病鉴定', '签名', '印章', '鉴定机构及鉴定人资质',
                           '鉴定人资质', '鉴定机构资质', '人身检查笔录', '现场检查笔录', '犯罪嫌疑人委托书', '被害人委托书', '书证复印件', '被告人信息']}
                         reload={this.loadData}
                         ifSave={this.ifSave}
                         elseSave={elseSave}
                         dictionaries={{'侦查机关认定的事实': facts, '关联事实': facts}}
                         ysay={ysay}
                         getNlpInfoKey={this.getNlpInfoKey}
                         currentNlpData={currentNlpData}
                />
              </div>
              {ysay === '交通肇事罪' ?
                <NewMarkInfo {...MarkInfoProps} dispatch={dispatch} match={match} ifSave={this.ifSave}/>
                :
                <MarkInfo {...MarkInfoProps} dispatch={dispatch} match={match} ifSave={this.ifSave}/>
              }

            </div>
          </div>
        );
      case 'compare':
        return (
          <div className={classnames(styles.mainRight, styles.rightBack)}>
            <span className={styles.title}>侦监阶段</span>
            <DocPreview source={rightImageSource} onCopy={this.onCopy}/>
          </div>
        );
      case 'double':
        return (
          <div className={classnames(styles.mainRight, styles.rightBack)}
               onDrop={(e) => this.onDrop(e, 'double')}
               onDragOver={(e) => {
                 e.preventDefault();
                 return true;
               }}
          >
            {/*<span className={styles.title}>侦监阶段</span>*/}
            <DocPreview source={rightImageSource} onCopy={this.onCopy}/>
          </div>
        );
      case 'Eyefinity':
        return (
          <div className={classnames(styles.mainRight, styles.rightBack, styles.threeRight)}
               onDrop={(e) => this.onDrop(e, 'double')}
               onDragOver={(e) => {
                 e.preventDefault();
                 return false;
               }}
          >
            {/*<span className={styles.title}>侦监阶段</span>*/}
            <DocPreview source={rightImageSource} onCopy={this.onCopy}/>
          </div>
        );
      case 'multi-screen':
        return (
          <div className={classnames(styles.mainRightscreen, styles.rightBack)}
               onDrop={(e) => this.onDrop(e, 'double')}
               onDragOver={(e) => {
                 e.preventDefault();
                 return false;
               }}
          >
            {/*<span className={styles.title}>侦监阶段</span>*/}
            <MultilScreen source={rightImageSource} onCopy={this.onCopy}/>
          </div>
        );

    }
  };
  //三屏
  switchThree = () => {

    const {
      tool, docNlp, facts, markList, factMarkList, isSuspect,
      fileKey, rightImageSource, bottomImageSource, threeImageSource, filename, fileCategory, elseSave, currentPage, imageSource, nlpInfoKey,
    } = this.state;
    const {dispatch, ajxx, match, znfz: {nlpConfig = {}}, ysay} = this.props;
    const nlpTitle = nlpConfig && nlpConfig.jsondata || {};
    const currentNlpData = docNlp.content && docNlp.content['侦查机关认定的犯罪嫌疑人基本情况'] && docNlp.content['侦查机关认定的犯罪嫌疑人基本情况'].length > 0 ? docNlp.content['侦查机关认定的犯罪嫌疑人基本情况'][nlpInfoKey] : {};
    switch (tool) {
      case 'element':
        const MarkInfoProps = {
          markList, factMarkList, filename, fileCategory, fileKey, facts, currentPage, imageSource,
          getMark: this.getMark, match, getFacts: this.getFacts, ysay, addWsMark: this.addWsMark
        };
        return (
          <div className={classnames(styles.mainRight, styles.rightBack)} ref={c => this.div = c}>
            <div>
              <div style={{padding: '0 20px'}}>
                <NlpInfo data={docNlp.content || {}}
                         match={match}
                         docNlp={docNlp}
                         facts={facts}
                         isSuspect={isSuspect}
                         dispatch={dispatch}
                         ajxx={ajxx}
                         includes={['主要信息', '签名信息', '侦查机关认定的犯罪嫌疑人基本情况', '证据列表', '基本信息', '犯罪嫌疑人信息', '鉴定意见', '鉴定资质', '检查笔录', '搜查笔录', '委托书'
                           , '车辆技术检验报告', '机动车鉴定', '痕迹检验', 'DNA鉴定', '印章信息', '邮戳信息', '精神疾病鉴定', '签名', '印章', '鉴定机构及鉴定人资质',
                           '鉴定人资质', '鉴定机构资质', '人身检查笔录', '现场检查笔录', '犯罪嫌疑人委托书', '被害人委托书', '书证复印件', '被告人信息']}
                         reload={this.loadData}
                         ifSave={this.ifSave}
                         elseSave={elseSave}
                         dictionaries={{'侦查机关认定的事实': facts, '关联事实': facts}}
                         ysay={ysay}
                         getNlpInfoKey={this.getNlpInfoKey}
                         currentNlpData={currentNlpData}
                />
              </div>
              {ysay === '交通肇事罪' ?
                <NewMarkInfo {...MarkInfoProps} dispatch={dispatch} match={match} ifSave={this.ifSave}/>
                :
                <MarkInfo {...MarkInfoProps} dispatch={dispatch} match={match} ifSave={this.ifSave}/>
              }

            </div>
          </div>
        );
      case 'compare':
        return (
          <div className={classnames(styles.mainRight, styles.rightBack)}>
            <span className={styles.title}>侦监阶段</span>
            <DocPreview source={rightImageSource} onCopy={this.onCopy}/>
          </div>
        );
      case 'double':
        return (
          <div className={classnames(styles.mainRight, styles.rightBack)}
               onDrop={(e) => this.onDrop(e, 'right')}
               onDragOver={(e) => {
                 e.preventDefault();
                 return true;
               }}
          >
            {/*<span className={styles.title}>侦监阶段</span>*/}
            <DocPreview source={rightImageSource} onCopy={this.onCopy}/>
          </div>
        );
      case 'Eyefinity':
        return (
          <div className={classnames(styles.mainRight, styles.rightBack, styles.threeRight)}
               onDrop={(e) => this.onDrop(e, 'Eyefinity')}
               onDragOver={(e) => {
                 e.preventDefault();
                 return true;
               }}
          >
            {/*<span className={styles.title}>侦监阶段</span>*/}
            <DocPreview source={threeImageSource} onCopy={this.onCopy}/>
          </div>
        );
    }
  }
  //四屏
  switchBottom = () => {
    const {
      tool, docNlp, facts, markList, factMarkList, isSuspect,
      fileKey, rightImageSource, bottomImageSource, filename, fileCategory, elseSave, currentPage, imageSource, nlpInfoKey,
    } = this.state;
    const {dispatch, ajxx, match, znfz: {nlpConfig = {}}, ysay} = this.props;
    const nlpTitle = nlpConfig && nlpConfig.jsondata || {};
    const currentNlpData = docNlp.content && docNlp.content['侦查机关认定的犯罪嫌疑人基本情况'] && docNlp.content['侦查机关认定的犯罪嫌疑人基本情况'].length > 0 ? docNlp.content['侦查机关认定的犯罪嫌疑人基本情况'][nlpInfoKey] : {};
    switch (tool) {
      case 'element':
        const MarkInfoProps = {
          markList, factMarkList, filename, fileCategory, fileKey, facts, currentPage, imageSource,
          getMark: this.getMark, match, getFacts: this.getFacts, ysay, addWsMark: this.addWsMark
        };
        return (
          <div className={classnames(styles.mainRight, styles.rightBack)} ref={c => this.div = c}>
            <div>
              <div style={{padding: '0 20px'}}>
                <NlpInfo data={docNlp.content || {}}
                         match={match}
                         docNlp={docNlp}
                         facts={facts}
                         isSuspect={isSuspect}
                         dispatch={dispatch}
                         ajxx={ajxx}
                         includes={['主要信息', '签名信息', '侦查机关认定的犯罪嫌疑人基本情况', '证据列表', '基本信息', '犯罪嫌疑人信息', '鉴定意见', '鉴定资质', '检查笔录', '搜查笔录', '委托书'
                           , '车辆技术检验报告', '机动车鉴定', '痕迹检验', 'DNA鉴定', '印章信息', '邮戳信息', '精神疾病鉴定', '签名', '印章', '鉴定机构及鉴定人资质',
                           '鉴定人资质', '鉴定机构资质', '人身检查笔录', '现场检查笔录', '犯罪嫌疑人委托书', '被害人委托书', '书证复印件', '被告人信息']}
                         reload={this.loadData}
                         ifSave={this.ifSave}
                         elseSave={elseSave}
                         dictionaries={{'侦查机关认定的事实': facts, '关联事实': facts}}
                         ysay={ysay}
                         getNlpInfoKey={this.getNlpInfoKey}
                         currentNlpData={currentNlpData}
                />
              </div>
              {ysay === '交通肇事罪' ?
                <NewMarkInfo {...MarkInfoProps} dispatch={dispatch} match={match} ifSave={this.ifSave}/>
                :
                <MarkInfo {...MarkInfoProps} dispatch={dispatch} match={match} ifSave={this.ifSave}/>
              }

            </div>
          </div>
        );

      case 'compare':
        return (
          <div className={classnames(styles.mainRight, styles.rightBack)}>
            <span className={styles.title}>侦监阶段</span>
            <DocPreview source={rightImageSource} onCopy={this.onCopy}/>
          </div>
        );
      case 'double':
        return (
          <div className={classnames(styles.mainRight, styles.rightBack)}
               onDrop={(e) => this.onDrop(e, 'right')}
               onDragOver={(e) => {
                 e.preventDefault();
                 return true;
               }}
          >
            {/*<span className={styles.title}>侦监阶段</span>*/}
            <DocPreview source={rightImageSource} onCopy={this.onCopy}/>
          </div>
        );
      case 'multi-screen':
        return (
          <div className={classnames(styles.mainRightscreen, styles.rightBack)}
               onDrop={(e) => this.onDrop(e, 'bottom')}
               onDragOver={(e) => {
                 e.preventDefault();
                 return true;
               }}
          >
            {/*<span className={styles.title}>侦监阶段</span>*/}
            <MultilScreen source={bottomImageSource} onCopy={this.onCopy}/>
          </div>
        )
    }
  };

  switchTopr = () => {
    const {
      tool, docNlp, facts, markList, factMarkList, isSuspect,
      fileKey, rightImageSource, bottomImageSource, toprImageSource, filename, fileCategory, elseSave, currentPage, imageSource, nlpInfoKey
    } = this.state;
    const {dispatch, ajxx, match, znfz: {nlpConfig = {}}, ysay} = this.props;
    const nlpTitle = nlpConfig && nlpConfig.jsondata || {};
    const currentNlpData = docNlp.content && docNlp.content['侦查机关认定的犯罪嫌疑人基本情况'] && docNlp.content['侦查机关认定的犯罪嫌疑人基本情况'].length > 0 ? docNlp.content['侦查机关认定的犯罪嫌疑人基本情况'][nlpInfoKey] : {};
    switch (tool) {
      case 'element':
        const MarkInfoProps = {
          markList, factMarkList, filename, fileCategory, fileKey, facts, currentPage, imageSource,
          getMark: this.getMark, match, getFacts: this.getFacts, ysay, addWsMark: this.addWsMark
        };
        return (
          <div className={classnames(styles.mainRight, styles.rightBack)} ref={c => this.div = c}>
            <div>
              <div style={{padding: '0 20px'}}>
                <NlpInfo data={docNlp.content || {}}
                         match={match}
                         docNlp={docNlp}
                         facts={facts}
                         isSuspect={isSuspect}
                         dispatch={dispatch}
                         ajxx={ajxx}
                         includes={['主要信息', '签名信息', '侦查机关认定的犯罪嫌疑人基本情况', '证据列表', '基本信息', '犯罪嫌疑人信息', '鉴定意见', '鉴定资质', '检查笔录', '搜查笔录', '委托书'
                           , '车辆技术检验报告', '机动车鉴定', '痕迹检验', 'DNA鉴定', '印章信息', '邮戳信息', '精神疾病鉴定', '签名', '印章', '鉴定机构及鉴定人资质',
                           '鉴定人资质', '鉴定机构资质', '人身检查笔录', '现场检查笔录', '犯罪嫌疑人委托书', '被害人委托书', '书证复印件', '被告人信息']}
                         reload={this.loadData}
                         ifSave={this.ifSave}
                         elseSave={elseSave}
                         dictionaries={{'侦查机关认定的事实': facts, '关联事实': facts}}
                         ysay={ysay}
                         getNlpInfoKey={this.getNlpInfoKey}
                         currentNlpData={currentNlpData}
                />
              </div>
              {ysay === '交通肇事罪' ?
                <NewMarkInfo {...MarkInfoProps} dispatch={dispatch} match={match} ifSave={this.ifSave}/>
                :
                <MarkInfo {...MarkInfoProps} dispatch={dispatch} match={match} ifSave={this.ifSave}/>
              }

            </div>
          </div>
        );
      case 'compare':
        return (
          <div className={classnames(styles.mainRight, styles.rightBack)}>
            <span className={styles.title}>侦监阶段</span>
            <DocPreview source={rightImageSource} onCopy={this.onCopy}/>
          </div>
        );
      case 'double':
        return (
          <div className={classnames(styles.mainRight, styles.rightBack)}
               onDrop={(e) => this.onDrop(e, 'right')}
               onDragOver={(e) => {
                 e.preventDefault();
                 return true;
               }}
          >
            {/*<span className={styles.title}>侦监阶段</span>*/}
            <DocPreview source={rightImageSource} onCopy={this.onCopy}/>
          </div>
        );
      case 'multi-screen':
        return (
          <div className={classnames(styles.mainRightscreen, styles.rightBack)}
               onDrop={(e) => this.onDrop(e, 'tor')}
               onDragOver={(e) => {
                 e.preventDefault();
                 return true;
               }}
          >
            {/*<span className={styles.title}>侦监阶段</span>*/}
            <MultilScreen source={toprImageSource} onCopy={this.onCopy}/>
          </div>
        )
    }
  };

  render() {
    const test = ['立案决定书', '逮捕证'];
    const {usingList, treeList, currentPage, imageSource, tool, fileKey, treeType, wwcTitle, memberJzmc, docNlp, markList, filename, fileCategory} = this.state;
    const {dispatch, match, side, flow, tools, ysay} = this.props;
    const {params: {id}} = match;

    const aside = (
      <div className={styles.leftSide}>
        <Radio.Group value={treeType}
                     onChange={this.onTreeTypeChange}
                     className={styles.group}
                     buttonStyle="solid">
          <Radio.Button value="left">按页分</Radio.Button>
          <Radio.Button value="right">按类分</Radio.Button>
        </Radio.Group>
        {
          treeType === 'left' ?
            <EditForm list={usingList} memberJzmc={memberJzmc} handleChange={this.handleChange} docNlp={docNlp}/> : ''
        }
        <Tree dispatch={dispatch}
              bmsah={id}
              tree={treeList}
              selectedKeys={[`node-${currentPage}`]}
              expandRoot={true}
              expandKeys={[2]}
              expandAll={true}
              firststyle={this.state.firststyle}
              twostyle={this.state.twostyle}
              onSelect={(data) => this.onSelect(data.id)}
              wwcTitle={wwcTitle}
        />
        <span style={{color: '#2d405e'}}>
          {
            ysay === '故意伤害罪' ?
              <Fragment>
                注：<Icon type="exclamation-circle" style={{color: 'red', marginRight: 5}}/>表示该文书存在未填的必填项
              </Fragment> : ''
          }
        </span>
      </div>
    );

    const bmsahAndImage = {
      bmsah: id,
      image: fileKey
    };

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

    return (
      <PageHeaderLayout content={flowStep} wrapperClassName={styles.default}>
        <Card className={styles.content1}>
          <div className={styles.content}>
            <div className={styles.all}>
              <ColumnLayout aside={aside}>
                {
                  tool === 'element' ?
                    <div className={styles.main}>
                      <div className={styles.mainLeft}
                           onDrop={(e) => this.onDrop(e, 'left')}
                           onDragOver={(e) => {
                             e.preventDefault();
                             return true;
                           }}
                      >
                        {this.switchLeft()}
                        <DocPreview source={imageSource}
                                    onCopy={this.onCopy}
                                    onScroll={this.onScroll}
                        />
                      </div>
                      {this.switchRight()}
                    </div>
                    : tool === 'double' ?
                    <div className={styles.main}>
                      <div className={styles.mainLeft}
                           onDrop={(e) => this.onDrop(e, 'left')}
                           onDragOver={(e) => {
                             e.preventDefault();
                             return true;
                           }}
                      >
                        {this.switchLeft()}
                        <DocPreview source={imageSource}
                                    onCopy={this.onCopy}
                                    onScroll={this.onScroll}
                        />
                      </div>
                      {this.switchRight()}
                    </div>
                    : tool === 'Eyefinity' ?
                      <div className={styles.main}>
                        <div className={styles.mainLeft}
                             onDrop={(e) => this.onDrop(e, 'left')}
                             onDragOver={(e) => {
                               e.preventDefault();
                               return true;
                             }}
                        >
                          {this.switchLeft()}
                          <DocPreview source={imageSource}
                                      onCopy={this.onCopy}
                                      onScroll={this.onScroll}
                          />
                        </div>
                        <div className={styles.threer}>
                          {this.switchRight()}
                          {this.switchThree()}
                        </div>
                      </div> : tool === 'multi-screen' ?
                        <div className={styles.main}>
                          <div className={styles.multil}>
                            <div className={styles.mainLeftscreen}
                                 onDrop={(e) => this.onDrop(e, 'left')}
                                 onDragOver={(e) => {
                                   e.preventDefault();
                                   return true;
                                 }}
                            >
                              {this.switchLeft()}
                              <DocPreview source={imageSource}
                                          onCopy={this.onCopy}
                                          onScroll={this.onScroll}
                              />
                            </div>
                            {this.switchRight()}
                          </div>
                          <div className={styles.multil}>
                            {this.switchTopr()}
                            {this.switchBottom()}
                          </div>
                        </div> : ''
                }
              </ColumnLayout>
            </div>
            <div className={styles.rightSide}>
              {
                side && side.map((o, i) => {
                  if (o.show) {
                    return (
                      <Tooltip key={i} placement="left" title={o.title}>
                        <Button icon={o.icon}
                                shape={'circle'}
                                className={styles.trigger}
                                type={tool === o.tool ? 'primary' : ''}
                                onClick={() => this.onToolClick(o.tool)}
                        >
                        </Button>
                      </Tooltip>
                    )
                  }
                })
              }
            </div>
          </div>
          <OcrModal bmsahAndImage={bmsahAndImage}/>
        </Card>
      </PageHeaderLayout>
    );
  }
}
