import { stringify } from 'qs';
import request from '../utils/request';

export async function fetch(id) {
  return request(`/gateway/uaaservice/api/users/${id}`, {
    method: 'GET'
  });
}

export async function query(params) {
  return request(`/gateway/uaaservice/api/users?${stringify(params)}`);
}

export async function remove(id) {
  return request(`/gateway/uaaservice/api/users/${id}`, {
    method: 'DELETE'
  });
}

export async function add(params) {
  return request('/gateway/uaaservice/api/users', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function update(params) {
  return request('/gateway/uaaservice/api/users', {
    method: 'PUT',
    body: {
      ...params,
    },
  });
}

export async function updateEnabled(params) {
  return request('/gateway/uaaservice/api/users/enabled', {
    method: 'PUT',
    body: {
      ...params,
    },
  });
}

export async function updateActivated(params) {
  return request('/gateway/uaaservice/api/users/activated', {
    method: 'PUT',
    body: {
      ...params,
    },
  });
}

export async function queryCurrent() {
  return request('/gateway/uaaservice/api/users/admin');
}
