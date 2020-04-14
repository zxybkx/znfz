import * as service from '../services/daily';

export default {

  namespace: 'daily',

  state: {
    treeList: [],
  },

  subscriptions: {},

  effects: {
    *getTree({ payload }, { call, put }) {
      const { success, data } = yield call(service.getTree, payload);
      if (success && data) {
        yield put({
          type: 'changeState',
          payload: {
            treeList: data,
          },
        });
      }
    },
    /**
     * 获取查询月份的日报（管理员）
     * @param payload
     * @param call
     * @param put
     * @returns {*}
     */
      *getDailies({payload}, { call, put }) {
      const response = yield call(service.getDailies, payload);
      return response;
    },
    /**
     * 获取查询已发布月份的日报
     * @param payload
     * @param call
     * @param put
     * @returns {*}
     */
      *PublishDailies({payload}, { call, put }) {
      const response = yield call(service.PublishDailies, payload);
      return response;
    },
    /**
     * 生成日报
     * @param payload
     * @param call
     * @param put
     * @returns {*}
     */
      *fetchDaily({payload}, { call, put }) {
      const response = yield call(service.fetchDaily,payload);
      return response;
    },
    /**
     * 发布日报
     * @param payload
     * @param call
     * @param put
     * @returns {*}
     */
      *publishReport({payload}, { call, put }) {
      const response = yield call(service.publishReport, payload);
      return response;
    },
    /**
     * 删除日报
     * @param payload
     * @param call
     * @param put
     * @returns {*}
     */
      *deleteDaily({payload}, { call, put }) {
      const response = yield call(service.deleteDaily, payload);
      return response;
    },
    /**
     * 重命名日报
     * @param payload
     * @param call
     * @param put
     * @returns {*}
     */
      *renameDaily({payload}, { call, put }) {
      const response = yield call(service.renameDaily, payload);
      return response;
    },
  },

  reducers: {
    changeState(state, action) {
      return {...state, ...action.payload};
    }
  },

};
