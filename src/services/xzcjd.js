import request from "../utils/request";
import qs from "qs";

export async function query(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-zjs?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function saveProblem(data) {
  return request('/gateway/frontendservice/api/z-nfz-ysjl-zjs/deal', {
    method: 'POST',
    body: data,
  });
}

export async function getProblems(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-zjs/list?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getProblemByKey(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-zjs/key?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function remove(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-zjs/${params.id}`, {
    method: 'DELETE',
  });
}

export async function update(data) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-zjs`, {
    method: 'PUT',
    body: data,
  });
}

export async function getAllProblem(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-zjs/listall?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

/**
 * 根据部门受案号获取规则列表
 * @param params
 * @returns {Promise.<Object>}
 */
export async function getProblemList(params) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-zj-hzs/list?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getSubProblemByKey(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-zjs/list-by-key?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getFlfgByKey(params) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-flfgs/find-by-keyid?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getCascadeProblemByKey(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-zjs/list-by-filekey?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getDocData(params){
  return request(`/gateway/wsgenservice/api/z-nfz-ws-data/fetchNew?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function pushDoc(params){
  return request(`/gateway/wsgenservice/api/WsToTyyw?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function removeDocData(data) {
  return request('/gateway/wsgenservice/api/z-nfz-ws-data/remove', {
    method: 'POST',
    body: data,
  });
}

export async function getConclusionByRules(payload) {
  return request(`/gateway/cmplatform/api/bybbs`, {
    method: 'POST',
    body: payload
  });
}

export async function createOrUpdate(payload) {
  return request(`/gateway/tyywservice/api/ts-ws/create-or-update?${qs.stringify(payload)}`, {
    method: 'GET',
    //body: payload,
  });
}
