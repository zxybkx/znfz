import * as service from '../services/wtfk';
import {message} from 'antd';

export default {

  namespace: 'wtfk',

  state: {
    ajxx: {},
    total: 0,
    AjxgTotal: 0,
    pageSize: 10,
    AjxgCurrent: 0,
    current: 0,
    model: {},
    list: [],
    ajxgList: [],
    statics: {
      gzCount: {},
      jlCount: {},
      wsCount: {},
      qtCount: {},
    },
    searchFields: {},
  },

  subscriptions: {},

  effects: {

    * getAjxg({payload}, {call, put}) {
      if(!payload){
        payload = {};
      }
      if (payload) {
        payload.page = payload.page ? payload.page : 0;
        payload.size = payload.size ? payload.size : 10;
        payload.data = payload.data ? payload.data : {};
      }
      const {data, success, page} = yield call(service.getAjxg, payload);
      if (success && data) {
        yield put({
          type: 'changeState',
          payload: {
            ajxgList: data,
            searchFields: payload.data || {},
            AjxgCurrent:  payload.page + 1,
            pageSize: payload.size,
            AjxgTotal: page.total,
          },
        });
      }
    },
    * getXtxg({payload}, {call, put}) {
      if(!payload){
        payload = {};
      }
      if (payload) {
        payload.page = payload.page ? payload.page : 0;
        payload.size = payload.size ? payload.size : 10;
      }
      const {data, success, page} = yield call(service.getXtxg, payload);
      if (success && data) {
        yield put({
          type: 'changeState',
          payload: {
            list: data,
            current: payload.page + 1,
            pageSize: payload.size,
            ...page,
          },
        });
      }
    },

    * changeCkzt({payload}, {call, put}) {
      yield call(service.changeCkzt, {...payload});
    },

    * getMyStatics({payload}, {call, put}) {
      const {data, success} = yield call(service.getMyStatics);
      if (success && data) {
        yield put({
          type: 'changeState',
          payload: {
            statics: data,
          },
        });
      }
    },

    * getMyYhfk({payload}, {call, put}) {
      if (!payload) {
        payload = {};
      }
      if (payload) {
        payload.page = payload.page ? payload.page : 0;
        payload.size = payload.size ? payload.size : 10;
      }
      const {data, success, page} = yield call(service.getMyYhfk, payload);
      if (success && data) {
        yield put({
          type: 'changeState',
          payload: {
            list: data,
            total: page ? page.total : 0,
            current: payload && payload.page ? parseInt(payload.page) + 1 : 1,
            pageSize: payload && payload.size ? parseInt(payload.size) : 10,
          },
        });
      }
    },
    * getMyXtwt({payload}, {call, put}) {
      if (!payload) {
        payload = {};
      }
      if (payload) {
        payload.page = payload.page ? payload.page : 0;
        payload.size = payload.size ? payload.size : 10;
      }
      const {data, success, page} = yield call(service.getMyXtwt, payload);
      if (success && data) {
        yield put({
          type: 'changeState',
          payload: {
            list: data,
            total: page ? page.total : 0,
            current: payload && payload.page ? parseInt(payload.page) + 1 : 1,
            pageSize: payload && payload.size ? parseInt(payload.size) : 10,
          },
        });
      }
    },

    * getStaticsByBmsah({payload}, {call, put}) {
      const {data, success} = yield call(service.getStaticsByBmsah, payload.bmsah);
      if (success && data) {
        yield put({
          type: 'changeState',
          payload: {
            statics: data,
          },
        });
      }
    },

    * getYhfkByBmsah({payload}, {call, put}) {
      const {data, success} = yield call(service.getYhfkByBmsah, payload.bmsah, payload);
      if (success && data) {
        yield put({
          type: 'changeState',
          payload: {
            list: data,
          },
        });
      }
    },

    * getXtwtByBmsah({payload}, {call, put}) {
      const {data, success} = yield call(service.getXtwtByBmsah, payload.bmsah);
      if (success && data) {
        yield put({
          type: 'changeState',
          payload: {
            list: data,
          },
        });
      }
    },

    * getXtwt({payload}, {call, put}) {
      const {data, success} = yield call(service.getXtwt, payload.id);
      if (success && data) {
        yield put({
          type: 'changeState',
          payload: {
            model: data,
          },
        });
      }
    },

    * getYhfk({payload}, {call, put}) {
      const {data, success} = yield call(service.getYhfk, payload.id);
      if (success && data) {
        yield put({
          type: 'changeState',
          payload: {
            model: data,
          },
        });
      }
    },

    * saveXtwtdf({payload}, {call, put}) {
      yield call(service.saveXtwtdf, payload);
    },

    * saveYhfkdf({payload}, {call, put}) {
      yield call(service.saveYhfkdf, payload);
    },

  },


  reducers: {
    changeState(state, action) {
      return {...state, ...action.payload};
    },
  },

};
