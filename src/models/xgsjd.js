import * as service from '../services/xgsjd';
import {Modal, message} from 'antd';
import _ from 'lodash';
import $ from 'jquery';


export default {

  namespace: 'xgsjd',

  state: {
    ajxx: {},
    viewDocTree: [],
    coords: [],
    conclusion: {},
  },

  subscriptions: {},

  effects: {
    * loadDocData({payload}, {select, call, put}) {

      let ajxx = yield select(({gsjd}) => gsjd.ajxx);
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

    * pushDoc({payload}, {select, call, put}) {
      return yield call(service.pushDoc, payload);
    },

    * saveRelatedInfo({payload}, {select, call, put}) {
      return yield call(service.saveRelatedInfo, payload);
    },

    *createOrUpdate({payload},{select, call, put}){
      return yield call(service.createOrUpdate, payload);
    },

    *getWh({payload}, {select, call, put}){
      return yield call(service.getWh, payload);
    },

    *wsTrpe({payload}, {select, call, put}) {
      return yield call(service.wsType, payload);
    },

    *selectLcjdbh({payload}, {select, call, put}){

    },

    *getZJbmsah({payload}, {select, call, put}){
      return yield call(service.getZJbmsah, payload);
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

    * getProblems({payload}, {select, call, put}) {
      const {data, success} = yield call(service.getProblems, payload);
      if (success) {
        yield put({
          type: 'changeState',
          payload: {
            listVisible: true,
            allList: data,
          },
        });
      }
    },

    * getAjxx({payload}, {call, put}) {
      const {data, success} = yield call(service.getAjxx, payload);
      if (success) {
        if (!data) {
          message.error('案件信息获取失败。');
        }
        let _data = data || {};
        yield put({
          type: 'changeState',
          payload: {
            ajxx: _data,
          },
        });
      }
    },

    * saveProblem({payload}, {select, call, put}) {
      const problemDTO = {
        id: payload.id,
        dealdata: payload.data,
      };

      const stage = payload.stage;

      if (stage === 'GS') {
        const {success, data} = yield call(service.saveProblem, problemDTO);
        if (success && data) {
          message.success('问题处理成功');
        }
      }
    },

    * getProblemByKey({payload}, {select, call, put}) {
      const stage = payload.stage;
      if (stage === 'GS') {
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
      }
    },

    * openResultViewModal({payload}, {select, call, put}) {

      const stage = payload.stage;

      if (stage === 'GS') {
        const {data, success} = yield call(service.getProblemByKey, payload);

        if (success) {
          yield put({
            type: 'changeState',
            payload: {
              ...payload,
              problem: data,
              problemResultVisible: true,
            },
          });
        }
      }

    },

    * openDocViewModal({payload}, {select, call, put}) {

      const _payload = {
        ...payload,
        docViewVisible: true,
        problem: {},
      };

      yield put({
        type: 'changeState',
        payload: _payload,
      });
    },

    * getAllProblem({payload}, {call, put}) {
      const {success, data} = yield call(service.getAllProblem, payload);
      if (success && data) {
        yield put({
          type: 'changeState',
          payload: {
            allProblem: data,
          },
        });
      }
    },

    /**
     * 根据部门受案号获取规则列表
     * @param payload
     * @param call
     * @param put
     * @returns {*}
     */
      * getProblemList({payload}, {call, put}) {
      const {success, data} = yield call(service.getProblemList, payload);
      if (success && data) {
        return data;
      }
    },

    * getSubProblemByKey({payload}, {call, put}) {
      const {success, data} = yield call(service.getSubProblemByKey, payload);
      if (success && data) {
        return data;
      }
    },

    * getFlfgByKey({payload}, {call, put}) {
      const {success, data} = yield call(service.getFlfgByKey, payload);
      if (success && data) {
        return data;
      }
    },

    * getCascadeProblemByKey({payload}, {call, put}) {
      const {success, data} = yield call(service.getCascadeProblemByKey, payload);
      if (success && data) {
        return data;
      }
    },

    * getConclusionByRules({payload}, {select, call, put}) {
      return yield call(service.getConclusionByRules, payload);
    },

    *getRzrfConclusionByRules({payload},{select, call, put}){
      return yield call(service.getRzrfConclusionByRules, payload);
    },

    * getLxtjjg({payload}, {select, call, put}) {
      return yield call(service.getLxtjjg, payload);
    },

  },

  reducers: {
    changeState(state, action) {
      return {...state, ...action.payload};
    },
    updateQueryKey(state, action) {
      return {...state, ...action.payload};
    },
  },

};
