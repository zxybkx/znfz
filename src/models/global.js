import * as api from '../services/api';
import { Modal, message } from 'antd';
import copy from 'clipboard-copy'

export default {
  namespace: 'global',

  state: {
    collapsed: true,
    notices: [],
    versionConfig: {}
  },

  effects: {
    * getVersionConfig({ payload }, { put, select, call }) {
      const { success, data } = yield call(api.getVersionConfig);
      yield put({
        type: 'saveVersionConfig',
        payload: {
          versionConfig: data
        },
      });
    },

    * parseTextFromNlp({ payload }, { select, call }) {
      return yield call(api.parseTextFromNlp, payload);
    },

    * getFact({ payload }, { select, call }) {
      return yield call(api.getFact, payload);
    },

    * getTextFromOcr({ payload }, { select, call }) {
      const { success, data } = yield call(api.getTextFromOcr, payload);
      
      if (success && data) {
        let result = [];//返回结果值
        let wz = '';//文本值
        let joint = [];//拼接
        result = data.results;
        result.map((value, key) => {
          wz = value.text;
          joint.push(wz);
        })
        if (window.ocrListener) {
          copy(joint);
          message.success('文字解析成功');
          window.ocrListener(joint);
        } else {
          copy(joint);
          // message.success('文字解析成功,请直接粘贴');
          // Modal.success({
          //   title: '文字解析成功,请直接粘贴',
          //   content: joint,
          //   onOk: () => copy(joint),
          //   okText: '复制',
          // });
        }
      } else {
        message.error('文字解析失败');
      }
    },

    * fetchNotices(_, { call, put }) {
      const { success, data } = yield call(api.queryNotices);
      if (success && data) {
        const _data = data.map(d => {
          return {
            title: d.fromName + d.content,
            type: d.type,
            read: d.status,
            ...d,
          }
        });
        yield put({
          type: 'saveNotices',
          payload: _data,
        });
        yield put({
          type: 'user/changeNotifyCount',
          payload: data ? data.length : 0,
        });
      }
    },

    * clearNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveClearedNotices',
        payload,
      });
      const count = yield select(state => state.global.notices.length);
      yield put({
        type: 'user/changeNotifyCount',
        payload: count,
      });
    },

    * updateNoticeStatus({ payload }, { call }) {
      return yield call(api.updateNoticeStatus, payload)
    },
  },

  reducers: {
    saveVersionConfig(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveNotices(state, { payload }) {
      return {
        ...state,
        notices: payload,
      };
    },
    saveClearedNotices(state, { payload }) {
      return {
        ...state,
        notices: state.notices.filter(item => item.type !== payload),
      };
    },
  },

  subscriptions: {},
};
