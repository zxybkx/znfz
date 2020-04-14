import { query as queryUsers } from '../services/user';
import Session from '../utils/session';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
    authorizedMenu: [],
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const session = Session.get();
      if(!session){
        Session.destroy();
      }else {
        yield put({
          type: 'saveCurrentUser',
          payload: {
            currentUser: Object.assign({}, session, {name: session.dlbm, avatar: session.gh}),
          },
        });
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
  },
};
