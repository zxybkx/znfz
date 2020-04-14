import * as service from '../services/portal';
import {message} from 'antd';

export default {

  namespace: 'portal',

  state: {
    message: '',
    Topfile: [],
    Bottomfile: [],
    portalData: {},

    ajxx:{},
    zcjdList: [],
    ajclList: [],
    bascList: [],
    baqkList: [],
    dxalList: [],
    flfgList: [],
  },

  subscriptions: {},

  effects: {

    * saveFeedback({payload}, {select, call, put}) {
      if (payload.data) {
        let wtlx = '', zy = '';
        if (/.*process.*/.test(payload.data.pathname) ||
          /.*document.*/.test(payload.data.pathname)) {
          wtlx = '文书问题';
          zy = '';
        } else if (/.*conclusion.*/.test(payload.data.pathname)) {
          wtlx = '结论问题';
          zy = '结论页面';
        } else {
          wtlx = '其它问题';
          zy = '';
        }

        delete payload.data.id;
        const _data = {
          ...payload.data,
          wtms: payload.data.advice,
          wtlx,
          zy,
        };
        const {success, data} = yield call(service.saveYHFK, _data);
        if (success && data) {
          message.success('感谢您的反馈');
        }
      }
    },

    * getTopfile({payload}, {call, put}) {
      const {data, success} = yield call(service.getFile, payload);
      if (success) {
        yield put({
          type: 'changeState',
          payload: {
            Topfile: data,
          },
        });
      }
    },

    * getBottomfile({payload}, {call, put}) {
      const {data, success} = yield call(service.getFile, payload);
      if (success) {
        yield put({
          type: 'changeState',
          payload: {
            Bottomfile: data,
          },
        });
      }
    },

    // 首页：最近办理案件
    *getLatestAjxx({ payload }, { call, put }) {
      const { success, data } = yield call(service.getLatestAjxx);
      if (success && data) {
        yield put({
          type: 'changeState',
          payload: {
            ajxx: data,
          },
        });
      }
    },

    // 首页：侦查监督
    *countZcjd({ payload }, { call, put }) {
      const { success, data } = yield call(service.countZcjd, payload);
      if (success && data) {
        // console.log('侦查监督',data);
        yield put({
          type: 'changeState',
          payload: {
            zcjdList: data,
          },
        });
      }
    },

    // 首页：案件处理
    *countAjcl({ payload }, { call, put }) {
      const { success, data } = yield call(service.countAjcl, payload);
      if (success && data) {
        // console.log('案件处理',data);
        yield put({
          type: 'changeState',
          payload: {
            ajclList: data,
          },
        });
      }
    },


    // 首页：办案时长
    *countBasc({ payload }, { call, put }) {
      const { success, data } = yield call(service.countBasc, payload);
      if (success && data) {
        // console.log('办案时长',data);
        yield put({
          type: 'changeState',
          payload: {
            bascList: data,
          },
        });
      }
    },

    // 首页：办案情况
    *countBaqk({ payload }, { call, put }) {
      const { success, data } = yield call(service.countBaqk, payload);
      if (success && data) {
        // console.log('办案情况',data);
        yield put({
          type: 'changeState',
          payload: {
            baqkList: data,
          },
        });
      }
    },

    // 首页：典型案例
    *getDxal({ payload }, { call, put }) {
      const { success, data } = yield call(service.getDxal, payload);
      if (success && data) {
        // console.log('典型案例',data);
        yield put({
          type: 'changeState',
          payload: {
            dxalList: data,
          },
        });
      }
    },

    // 首页：法律法规
    *getFlfg({ payload }, { call, put }) {
      const { success, data } = yield call(service.getFlfg, payload);
      if (success && data) {
        // console.log('法律法规',data);
        yield put({
          type: 'changeState',
          payload: {
            flfgList: data,
          },
        });
      }
    },

    /**
     * 侦查监督回溯
     * @param payload
     * @param call
     * @param put
     * @returns {*}
     */
    *countZcjdDetail({ payload }, { call, put }) {
      const { success, data } = yield call(service.countZcjdDetail, payload);
      if (success && data) {
        // console.log('侦查监督回溯',data);
        return data;
      }
    },

    /**
     * 案件处理回溯
     * @param payload
     * @param call
     * @param put
     * @returns {*}
     */
    *countAjclDetail({ payload }, { call, put }) {
      const { success, data } = yield call(service.countAjclDetail, payload);
      if (success && data) {
        // console.log('案件处理回溯',data);
        return data;
      }
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
