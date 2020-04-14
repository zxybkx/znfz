import {routerRedux} from 'dva/router';
import jwt from 'jsonwebtoken';
import Promise from 'bluebird';
import {getAllDepartments} from '../services/department';
import {login, access} from '../services/login';
import {reloadAuthorized} from '../utils/Authorized';
import Session from '../utils/session';

export default {
  namespace: 'login',

  state: {
    status: undefined,
    departments: [],
  },

  subscriptions: {},

  effects: {
    * getAllDepartments({payload}, {call, put}) {
      const {data, success} = yield call(getAllDepartments, {...payload});
      if (success) {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            departments: data,
          },
        });
      }
    },
    * login({payload}, {call, put}) {
      const {success, data, message} = yield call(login, payload);
      let status;
      if (!success || !data) {
        status = 'error';
      } else {
        let access_token = message.id_token;
        if (access_token) {
          status = 'ok';
          const decoded = jwt.decode(access_token);
          if (decoded) {
            const {user, dept, roles, resources} = data;
            Session.init(
              Object.assign({}, user, {dwmc: dept.dwmc}, {
                access_token,
                roles,
                resources,
              }), decoded.exp);
            reloadAuthorized();
          } else {
            status = 'error';
          }
        } else {
          status = 'error';
        }
      }
      yield put({
        type: 'changeLoginStatus',
        payload: {
          status,
          user: data,
          ...payload,
        },
      });

    },
    * logout(_, {put, select}) {
      try {
        // get location pathname
        const urlParams = new URL(window.location.href);
        const pathname = yield select(state => state.routing.location.pathname);
        // add the parameters in the url
        urlParams.searchParams.set('redirect', pathname);
        window.history.replaceState(null, 'login', urlParams.href);
      } finally {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: false,
          },
        });
        Session.destroy();
        reloadAuthorized();
        yield put(routerRedux.push('/passport/sign-in'));
      }
    },

    * access({payload}, {call, put}) {
      const {success, data, message} = yield call(access, payload);
      let status;
      if (!success || !data) {
        status = 'error';
      } else {
        let access_token = message.id_token;
        if (access_token) {
          status = 'ok';
          const decoded = jwt.decode(access_token);
          if (decoded) {
            const {user, roles, resources} = data;
            Session.init(
              Object.assign({}, user, {
                access_token,
                roles,
                resources,
              }), decoded.exp);
            reloadAuthorized();
          } else {
            status = 'error';
          }
        } else {
          status = 'error';
        }
      }

      return Promise.resolve({status})

    },
  },

  reducers: {
    changeLoginStatus(state, {payload}) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
