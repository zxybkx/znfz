import * as service from '../services/spjd';
import {Modal, message} from 'antd';
import _ from 'lodash';
import $ from 'jquery';


export default {

  namespace: 'spjd',

  state: {
    ajxx: {},
    viewDocTree: [],
    coords: [],
    conclusion: {},
  },

  subscriptions: {},

  effects: {
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


    * getGLByKey({payload}, {call, put}) {
      return yield call(service.getGLByKey, payload);
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

    * saveProblem({payload}, {select, call, put}) {
      const problemDTO = {
        id: payload.id,
        dealdata: payload.data,
      };

      const {success, data} = yield call(service.saveSPProblem, problemDTO);
      if (success && data) {
        message.success('问题处理成功');
      }
    },

    * getConclusionByRules({payload}, {select, call, put}) {
      return yield call(service.getConclusionByRules, payload);
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
