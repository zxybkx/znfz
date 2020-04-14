import * as service from "../services/tzgg";

export default {

  namespace: 'tzgg',

  state: {
    total: null,
    pageSize: 10,
    current: 1,
    list:[],
  },

  subscriptions: {},

  effects: {

    *getFile({payload},{call,put,select}){
      if (payload) {
        payload.page = payload.page ? payload.page : 0;
        payload.size = payload.size ? payload.size : 10;
      }
      const tzggpage={
        page:payload.page,
        size:payload.size,
      };
      const tzggtype={
        title_type:payload.title_type,
        title: payload.title,
      };
      const {page,data,success}=yield call(service.getFile,tzggpage,tzggtype);
      if(success){
        let _payload = {
          list: data,
          total: page ? page.total : 0,
          current: payload && payload.page ? parseInt(payload.page) + 1 : 1,
          pageSize: payload && payload.size ? parseInt(payload.size) : 10,
        };
        yield put({
          type:'changeState',
          payload:_payload,
        });
      }
    },

    // 典型案例
    *getDxal({ payload }, { call, put }) {
      if (payload) {
        payload.page = payload.page ? payload.page : 0;
        payload.size = payload.size ? payload.size : 10;
      }
      const { success, page, data } = yield call(service.getDxal, payload);
      if (success && data) {
        let _payload = {
          list: data,
          total: page ? page.total : 0,
          current: payload && payload.page ? parseInt(payload.page) + 1 : 1,
          pageSize: payload && payload.size ? parseInt(payload.size) : 10,
        };
        yield put({
          type: 'changeState',
          payload: _payload,
        });
      }
    },

    // 法律法规
    *getFlfg({ payload }, { call, put }) {
      if (payload) {
        payload.page = payload.page ? payload.page : 0;
        payload.size = payload.size ? payload.size : 10;
      }
      const { success, page, data } = yield call(service.getFlfg, payload);
      if (success && data) {
        let _payload = {
          list: data,
          total: page ? page.total : 0,
          current: payload && payload.page ? parseInt(payload.page) + 1 : 1,
          pageSize: payload && payload.size ? parseInt(payload.size) : 10,
        };
        yield put({
          type: 'changeState',
          payload: _payload,
        });
      }
    },

  },

  reducers: {
    changeState(state, action) {
      return {...state, ...action.payload};
    },

  },

};
