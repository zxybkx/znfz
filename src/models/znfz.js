import * as service from '../services/znfz';
import {message} from 'antd';
import _ from 'lodash';
import {TASK_CONDITION} from '../constant';
import Promise from 'bluebird';
import moment from 'moment';

export default {

  namespace: 'znfz',

  state: {
    nlpConfig: {},            //NLP前端配置
    docConfigs: [],
    ajxx: {},
    problem: {},
    coords: [],
    docTree: [],
    viewDocTree: [],
    total: 0,
    current: 1,
    pageSize: 10,
    list: [],
    stage: '',
    taskQueryCondition: {},
    conclusion: {},
    conclusionConfigs: [],
    tbflg: {},
    require: [],
  },

  subscriptions: {},

  effects: {
    * getAjxx({payload}, {call, put}) {
      const {data, success} = yield call(service.getAjxx, payload);
      if (success) {
        if (data) {
          // console.log(data)
        }
        yield put({
          type: 'changeState',
          payload: {
            ajxx: data || {},
          },
        });
      }
    },

    * tbflg({payload}, {call, put}) {
      const {data, success} = yield call(service.tbflg, payload);

      if (success) {
        if (data) {
          // console.log(data)
        }
        yield put({
          type: 'changeState',
          payload: {
            tbflg: data
          },
        });
      }
    },
    * getTree({payload}, {call, put}) {
      const treeRoot = require('../data/ws_category.json');
      const allWsRoot = treeRoot[1];

      const {data, success} = yield call(service.getTree, payload);
      if (success && data) {
        allWsRoot.children.map((node) => node.children = []);

        data && data.forEach((p) => {
          let cat = allWsRoot.children.find(node => node.name === p.catalog);
          if (!cat) {
            cat = allWsRoot.children.find(node => node.id === 29);
          }
          let node = {
            id: p.id,
            name: p.title,
            coords: p.pages,
            showRect: false,
          };
          if (cat && cat.children) {
            cat.children.push(node);
          }
        });
      }

      yield put({
        type: 'changeState',
        payload: {
          docTree: treeRoot,
          viewDocTree: treeRoot.filter(doc => doc.id === 2),
        },
      });

    },

    * getProblemByKey({payload}, {select, call, put}) {
      const {success, data} = yield call(service.getProblemByKey, payload);
      if (success) {
        yield put({
          type: 'changeState',
          payload: {
            ...payload,
            problem: data,
          },
        });
      }
    },

    * getAjList({payload}, {select, call, put}) {
      if (payload) {
        payload.page = payload.page ? payload.page : 0;
        payload.size = payload.size ? payload.size : 10;
      }
      const param = {
        page: payload.page,
        size: payload.size,
      };

      const data = {
        startDate: moment('2019-01-01').format('YYYY-MM-DDTHH:mm:ss'),
        stage: payload.stage
      }

      return yield call(service.getAjList, param, data);
    },

    * getPjList({payload}, {select, call, put}) {
      if (payload) {
        payload.page = payload.page ? payload.page : 0;
        payload.size = payload.size ? payload.size : 10;
      }
      const param = {
        page: payload.page,
        size: payload.size,
      };
      return yield call(service.getPjList, param);
    },

    * getTasks({payload}, {select, call, put}) {
      if (payload) {
        payload.page = payload.page ? payload.page : 0;
        payload.size = payload.size ? payload.size : 10;
      }
      const pagination = {
        page: payload.page,
        size: payload.size,
      };

      let vm = TASK_CONDITION;
      if (payload.ysay && payload.ysay !== 'all') {
        //默认展示界面列表
        vm = _.filter(TASK_CONDITION, ['ysay', payload.ysay]);
      }
      //默认展示故意伤害罪的列表
      // else {
      //   if (!payload.hasNewVersionAuthority) {
      //     vm = _.filter(TASK_CONDITION, v => v.ysay === '故意伤害罪')
      //   }
      // }

      const param = {
        vm,
        ...payload,
      };
      const {page, data, success} = yield call(service.getTasks, pagination, param);

      if (success) {
        let _payload = {
          list: data,
          total: page ? page.total : 0,
          current: payload && payload.page ? parseInt(payload.page) + 1 : 1,
          pageSize: payload && payload.size ? parseInt(payload.size) : 10,
          taskQueryCondition: payload,
        };
        yield put({
          type: 'changeState',
          payload: _payload,
        });

        window._latestTaskQueryCondition = payload;
      }
    },

    // * loadDocData({payload}, {select, call, put}) {
    // let ajxx = yield select(({znfz}) => znfz.ajxx);
    // if (!ajxx || !ajxx.bmsah) {
    //   const {data, success} = yield call(service.getAjxx, payload);
    //   if (success) {
    //     ajxx = data;
    //   }
    // }
    // if (!ajxx || !ajxx.bmsah) {
    //   return false;
    // }
    // const wsmbmc = payload.wsmbmc;
    //
    // const _payload = {
    //   bmsah: ajxx.bmsah,
    //   ysay: ajxx.ysay_aymc,
    //   tysah: ajxx.tysah,
    //   stage: payload.stage,
    //   wsmbmc: wsmbmc,
    //   bgr: payload.bgr,
    //   http_header: payload.http_header,
    // };

    //return yield call(service.getDocData, _payload);
    // return yield call(service.getDocData, payload);
    // },

    // * removeDocData({payload}, {call, put}) {
    //   const formData = {
    //     tysah: payload.ajxx.tysah,
    //     bmsah: payload.ajxx.bmsah,
    //     ysay: payload.ajxx.ysay_aymc,
    //     wsmbmc: payload.wsmbmc,
    //     stage: payload.stage,
    //   };
    //
    //   if (formData && formData.bmsah && formData.wsmbmc) {
    //     return yield call(service.removeDocData, formData);
    //   } else {
    //     Promise.resolve({sucess: false})
    //   }
    // },

    * getWsLinkData({payload}, {select, call, put}) {
      return yield call(service.getWsLinkData, payload);
    },

    * wsmbdy({payload}, {select, call, put}) {
      return yield call(service.wsmbdy, payload);
    },

    * createOrUpdate({payload}, {select, call, put}) {
      return yield call(service.createOrUpdate, payload);
    },

    * getWh({payload}, {select, call, put}) {
      return yield call(service.getWh, payload);
    },

    * wsTrpe({payload}, {select, call, put}) {
      return yield call(service.wsType, payload);
    },

    * pushDoc({payload}, {select, call, put}) {
      return yield call(service.pushDoc, payload);
    },

    * getFormConfig({payload}, {select, call, put}) {
      return yield call(service.getFormConfig, payload);
    },

    * getAllBDPZ({payload}, {select, call, put}) {
      const {data, success} = yield call(service.getAllBDPZ, payload);
      if (success) {
        yield put({
          type: 'changeState',
          payload: {
            list: data,
          },
        });
      }
    },
    * getRequireByBmash({payload}, {select, call, put}) {
      const {data, success} = yield call(service.getRequireByBmash, payload);
      if (success) {
        yield put({
          type: 'changeState',
          payload: {
            require: data,
          },
        });
      }
    },
    * getAllpd({payload}, {select, call, put}) {
      return yield call(service.getAllpd, payload);
    },

    * getLccontrol({payload}, {select, call, put}) {
      return yield call(service.getLccontrol, payload);
    },

    * saveLatestBmsah({payload}, {select, call, put}) {
      yield call(service.saveLatestBmsah, payload);
    },

    * getNlpConfig({payload}, {select, call, put}) {
      const {success, data} = yield call(service.getNlpConfig, payload);
      if (success) {
        yield put({
          type: 'changeState',
          payload: {
            nlpConfig: data,
          },
        });
      }
    },

    * getNlpByBmsahAndWsmc({payload}, {select, call, put}) {
      return yield call(service.getNlpByBmsahAndWsmc, payload);
    },
    * yjhjItem({payload}, {call, put}) {
      return yield call(service.yjhjItem, payload)
    },
    * getNlpByBmsahAndImage({payload}, {select, call, put}) {
      return yield call(service.getNlpByBmsahAndImage, payload);
    },
    * saveYjHj({payload}, {call, put}) {
      return yield call(service.saveYjHj, payload)
    },
    * addNlpItem({payload}, {select, call, put}) {
      return yield call(service.addNlpItem, payload);
    },

    * deleteNlpItem({payload}, {select, call, put}) {
      return yield call(service.deleteNlpItem, payload);
    },

    * saveNLPData({payload}, {select, call, put}) {
      return yield call(service.saveNLPData, payload);
    },

    * fillNLPData({payload}, {select, call, put}) {
      return yield call(service.fillNLPData, payload);
    },

    * reCalculateRules({payload}, {select, call, put}) {
      return yield call(service.reCalculateRules, payload);
    },

    * getVerbalList({payload}, {select, call, put}) {
      return yield call(service.getVerbalList, payload);
    },

    * getFactList({payload}, {select, call, put}) {
      return yield call(service.getFactList, payload);
    },

    * getFactListByType({payload}, {select, call, put}) {
      return yield call(service.getFactListByType, payload);
    },

    * defaultRelated({payload}, {select, call, put}) {
      return yield call(service.defaultRelated, payload);
    },

    * getFilekeyAndChoosed({payload}, {select, call, put}) {
      return yield call(service.getFilekeyAndChoosed, payload);
    },

    * chooseWs({payload}, {select, call, put}) {
      return yield call(service.chooseWs, payload);
    },

    * updateFact({payload}, {select, call, put}) {
      return yield call(service.updateFact, payload.data);
    },

    * saveFact({payload}, {select, call, put}) {
      return yield call(service.saveFact, payload.data);
    },

    *ysjlFactsChanged({payload}, {select, call, put}) {
      return yield call(service.ysjlFactsChanged, payload);
    },

    *alterFactRdfs({payload}, {select, call, put}) {
      return yield call(service.alterFactRdfs, payload)
    },

    * saveFacts({payload}, {select, call, put}) {
      return yield call(service.saveFacts, payload.data);
    },

    * setbshy({payload}, {select, call, put}) {
      return yield call(service.setbshy, payload);
    },

    * deleteFact({payload}, {select, call, put}) {
      return yield call(service.deleteFact, payload);
    },

    * deleteYczjs({payload}, {select, call, put}) {
      return yield call(service.deleteYczjs, payload);
    },

    * updateYczj({payload}, {select, call, put}) {
      return yield call(service.updateYczj, payload.data);
    },

    * saveYczjs({payload}, {select, call, put}) {
      return yield call(service.saveYczjs, payload.data);
    },

    * updateFactOwner({payload}, {select, call, put}) {
      return yield call(service.updateFactOwner, payload.data);
    },

    * saveFactOwners({payload}, {select, call, put}) {
      return yield call(service.saveFactOwners, payload.data);
    },

    * restarttask({payload}, {select, call, put}) {
      return yield call(service.restarttask, payload);
    },

    *ysjlFactChanged({payload}, {select, call, put}) {
      return yield call(service.ysjlFactChanged, payload);
    },

    * saveFactConclusion({payload}, {select, call, put}) {
      return yield call(service.saveFactConclusion, payload);
    },

    * saveFactConclusionByPeople({payload}, {select, call, put}) {
      return yield call(service.saveFactConclusionByPeople, payload);
    },

    * getConclusionRules({payload}, {select, call, put}) {
      return yield call(service.getConclusionRules, payload);
    },

    * getConclusionData({payload}, {select, call, put}) {
      return yield call(service.getConclusionData, payload);
    },

    * getConclusionByRules({payload}, {select, call, put}) {
      return yield call(service.getConclusionByRules, payload);
    },

    * getConclusionOptions({payload}, {select, call, put}) {
      return yield call(service.getConclusionOptions, payload);
    },


    * getLxtjjg({payload}, {select, call, put}) {
      return yield call(service.getLxtjjg, payload);
    },

    * getConclusion({payload}, {select, call, put}) {
      return yield call(service.getConclusion, payload);
    },

    * getNewConclusion({payload}, {select, call, put}) {
      return yield call(service.getNewConclusion, payload);
    },

    * getSycxs({payload}, {select, call, put}) {
      return yield call(service.getSycxs, payload);
    },

    * getRzrfConclusionByRules({payload}, {select, call, put}) {
      return yield call(service.getRzrfConclusionByRules, payload);
    },

    * saveConclusion({payload}, {select, call, put}) {
      return yield call(service.saveConclusion, payload);
    },

    * saveNewConclusion({payload}, {select, call, put}) {
      return yield call(service.saveNewConclusion, payload);
    },

    * judgeAge({payload}, {select, call, put}) {
      return yield call(service.judgeAge, payload)
    },

    * saveRzrfConclusion({payload}, {select, call, put}) {
      return yield call(service.saveRzrfConclusion, payload);
    },

    * getOcrByBmsahAndImage({payload}, {select, call, put}) {
      return yield call(service.getOcrByBmsahAndImage, payload);
    },

    * getFactOcrByBmsahAndImage({payload}, {select, call, put}) {
      return yield call(service.getFactOcrByBmsahAndImage, payload);
    },

    * updateAJZT({payload}, {call, put}) {
      return yield call(service.updateAJZT, payload);
    },

    * getDocConfigs({payload}, {select, call, put}) {
      const {success, data} = yield call(service.getDocConfigs, payload);
      if (success) {
        yield put({
          type: 'changeState',
          payload: {
            docConfigs: data,
          },
        });
      }
    },

    * updateSpjdBjsj({payload}, {select, call, put}) {
      return yield call(service.updateSpjdBjsj, payload);
    },
    // 文书推送
    * wsts({payload}, {select, call, put}) {
      return yield call(service.wsts, payload);
    },
    //创建文书
    * credoc({payload}, {select, call, put}) {
      return yield call(service.credoc, payload);
    },

    * colorqh({payload}, {call, put}) {
      return yield call(service.colorqh, payload);
    },
    * getWsInfo({payload}, {call, put}) {
      return yield call(service.getDocConfigs, payload);
    },

    * findSpjdZt({payload}, {call, put}) {
      return yield call(service.findSpjdZt, payload);
    },

    * reCalculate({payload}, {call, put}) {
      return yield call(service.reCalculate, payload);
    },

    * getTreeList({payload}, {select, call, put}) {
      return yield call(service.getTreeList, payload);
    },

    * getBshyTreeList({payload}, {select, call, put}) {
      return yield call(service.getBshyTreeList, payload);
    },

    * getFactMark({payload}, {select, call, put}) {
      return yield call(service.getFactMark, payload);
    },

    * saveFactMark({payload}, {select, call, put}) {
      return yield call(service.saveFactMark, payload);
    },

    * importFact({payload}, {select, call, put}) {
      return yield call(service.importFact, payload);
    },

    * get_enumerate({payload}, {select, call, put}) {
      return yield call(service.get_enumerate, payload);
    },

    * get_xyrName({payload}, {select, call, put}) {
      return yield call(service.get_xyrName, payload);
    },

    * getMark({payload}, {select, call, put}) {
      return yield call(service.getMark, payload);
    },

    * saveMark({payload}, {call, put}) {
      return yield call(service.saveMark, payload);
    },

    * deleteMark({payload}, {call, put}) {
      return yield call(service.deleteMark, payload);
    },

    * attributeChange({payload}, {select, call, put}) {
      return yield call(service.attributeChange, payload);
    },

    * getBshyTree({payload}, {select, call, put}) {
      return yield call(service.getBshyTree, payload);
    },

    * getRzrfConclusionRules({payload}, {select, call, put}) {
      return yield call(service.getRzrfConclusionRules, payload);
    },

    * getRzrfConclusionData({payload}, {select, call, put}) {
      return yield call(service.getRzrfConclusionData, payload);
    },

    * sendAKUser({payload}, {select, call, put}) {
      return yield call(service.sendAKUser, payload);
    },

    * getFactMaterials({payload}, {select, call, put}) {
      return yield call(service.getFactMaterials, payload);
    },

    * getStepList({payload}, {select, call, put}) {
      return yield call(service.getStepList, payload);
    },

    * sendStepList({payload}, {select, call, put}) {
      return yield call(service.sendStepList, payload);
    },

    * deleteStepList({payload}, {select, call, put}) {
      return yield call(service.deleteStepList, payload);
    },


    // 通用
    * saveXtwt({payload}, {call}) {
      yield call(service.saveXtwt, payload.data);
    },

    * saveMarks({payload}, {select, call, put}) {
      const problem = payload.problem;
      const data = payload.data;
      const _data = {
        keyid: problem.keyid,
        bmsah: problem.bmsah,
        path: data.fieldpath,
        content: data.fieldvalue,
        coords: data.coords ? JSON.parse(data.coords) : null,
      };
      const {success} = yield call(service.saveMarks, _data);
      if (success) {
        message.success('标记保存成功');
      }
    },

    * saveConclusions({payload}, {call, put}) {
      const {success} = yield call(service.saveConclusions, payload);
      if (success) {
        message.success('结论保存成功。');
      }
    },

    * getConclusionConfigs({payload}, {call, put}) {
      const {success, data} = yield call(service.getConclusionConfigs, payload);
      if (success && data) {
        yield put({
          type: 'changeState',
          payload: {
            conclusionConfigs: data,
          },
        });
      }
    },


    * loadDocData({payload}, {select, call, put}) {

      let ajxx = yield select(({znfz}) => znfz.ajxx);
      if (!ajxx || !ajxx.bmsah) {
        const {data, success} = yield call(service.getAjxx, payload);
        if (success) {
          ajxx = data;
        }
      }

      if (!ajxx || !ajxx.bmsah) {
        return false;
      }

      const wsmbmc = payload.wsmbmc;

      const _payload = payload.bgr ?
        {
          bmsah: ajxx.bmsah,
          ysay: ajxx.ysay_aymc,
          tysah: ajxx.tysah,
          stage: payload.stage,
          wsmbmc: wsmbmc,
          bgr: payload.bgr,
          http_header: payload.http_header,
        } :
        {
          bmsah: ajxx.bmsah,
          ysay: ajxx.ysay_aymc,
          tysah: ajxx.tysah,
          stage: payload.stage,
          wsmbmc: wsmbmc,
          http_header: payload.http_header,
        };

      return yield call(service.getDocData, _payload);
    },

    * removeDocData({payload}, {call, put}) {
      const docs = payload.wsmbmc.split('-');
      const formData = docs[1] ? {
          tysah: payload.ajxx.tysah,
          bmsah: payload.ajxx.bmsah,
          ysay: payload.ajxx.ysay_aymc,
          wsmbmc: docs[0],
          bgr: docs[1],
          stage: payload.stage,
        } :
        {
          tysah: payload.ajxx.tysah,
          bmsah: payload.ajxx.bmsah,
          ysay: payload.ajxx.ysay_aymc,
          wsmbmc: docs[0],
          stage: payload.stage,
        };

      if (formData && formData.bmsah && formData.wsmbmc) {
        return yield call(service.removeDocData, formData);
      } else {
        Promise.resolve({sucess: false})
      }
    },

    * getSybs({payload}, {call, put}) {
      const {success, data} = yield call(service.getSybs, payload);
      if (success && data) {
        yield put({
          type: 'changeState',
          payload: {
            conclusion: data,
          },
        });
      }
    },


    * getFlfgByKey({payload}, {call, put}) {
      const {success, data} = yield call(service.getFlfgByKey, payload);
      if (success && data) {
        return data;
      }
    },

    * getZJProblemList({payload}, {call, put}) {
      const {success, data} = yield call(service.getZJProblemList, payload);
      if (success && data) {
        return data;
      }
    },

    * getZJSubProblemByKey({payload}, {call, put}) {
      const {success, data} = yield call(service.getZJSubProblemByKey, payload);
      if (success && data) {
        return data;
      }
    },

    * getGSProblemList({payload}, {call, put}) {
      const {success, data} = yield call(service.getGSProblemList, payload);
      if (success && data) {
        return data;
      }
    },

    * getGSSubProblemByKey({payload}, {call, put}) {
      const {success, data} = yield call(service.getGSSubProblemByKey, payload);
      if (success && data) {
        return data;
      }
    },

    * saveProblem({payload}, {select, call, put}) {
      const problemDTO = {
        id: payload.id,
        dealdata: payload.data,
      };

      const stage = payload.stage;

      if (stage === 'ZJ') {
        const {success, data} = yield call(service.saveZJProblem, problemDTO);
        if (success && data) {
          message.success('问题处理成功');
        }
      } else if (stage === 'GS') {
        const {success, data} = yield call(service.saveGSProblem, problemDTO);
        if (success && data) {
          message.success('问题处理成功');
        }
      } else {
        const {success, data} = yield call(service.saveSPProblem, problemDTO);
        if (success && data) {
          message.success('问题处理成功');
        }
      }

    },

    * getIdentity({payload}, {call, put}) {
      return yield call(service.getIdentity, payload);
    },

    * ajcq({payload}, {call, put}) {
      return yield call(service.ajcq, payload);
    },

    * resetBjsj({payload}, {call, put}) {
      return yield call(service.resetBjsj, payload);
    },

    * GetXyrxx({payload}, {call, put}) {
      return yield call(service.GetXyrxx, payload);
    },

    * getTyywGgXyrjbxx({payload}, {select, call, put}) {
      return yield call(service.getTyywGgXyrjbxx, payload);
    },

    * alterVisit({payload}, {select, call, put}) {
      return yield call(service.alterVisit, payload);
    },

    * ysjlFact({payload}, {select, call, put}) {
      return yield call(service.ysjlFact, payload)
    },
  },

  reducers: {
    changeState(state, action) {
      return {...state, ...action.payload};
    },
  },

};
