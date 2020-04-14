import store from '../utils/store';
import Promise from 'bluebird';

export default class Session {
}

Session.init = function (session, duration) {
  store.add('session', session, duration);
  return Promise.resolve(session);
};

Session.destroy = function () {
  store.remove('session');
};

Session.get = function () {
  
  return store.get('session');
};

Session.set = function (values) {
  const _session = store.get('session') || {};
  const session = Object.assign({}, _session, values);
  store.add('session', session);
  return Promise.resolve(session);
};
