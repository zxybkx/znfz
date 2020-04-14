import xRequest from "../utils/request";
import qs from "qs";

export async function query(params) {
  return xRequest(`/gateway/frontendservice/api/z-nfz-ysjl-gss?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function addNote(data) {
  return xRequest('/gateway/frontendservice/api/z-nfz-yjbjs', {
    method: 'POST',
    body: data,
  });
}

export async function saveProblem(data) {
  return xRequest('/gateway/frontendservice/api/z-nfz-ysjl-gss/deal', {
    method: 'POST',
    body: data,
  });
}

export async function getAjxx(params) {
  return xRequest(`/gateway/frontendservice/api/t-yyw-gg-ajjbxxes/fetch?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getCategories(params) {
  return xRequest(`/gateway/frontendservice/api/z-nfz-ysjl-gss/categories?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getProblems(params) {
  return xRequest(`/gateway/frontendservice/api/z-nfz-ysjl-gss/list?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getSPCategories(params) {
  return xRequest(`/gateway/frontendservice/api/z-nfz-ysjl-sps/categories?${qs.stringify(params)}`, {
    method: 'GET',
  });
}


export async function saveSPProblem(data) {
  return xRequest('/gateway/frontendservice/api/z-nfz-ysjl-sps/deal', {
    method: 'POST',
    body: data,
  });
}

export async function getSPProblems(params) {
  return xRequest(`/gateway/frontendservice/api/z-nfz-ysjl-sps/list?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getProblemByKey(params) {
  return xRequest(`/gateway/frontendservice/api/z-nfz-ysjl-gss/key?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getSPProblemByKey(params) {
  return xRequest(`/gateway/frontendservice/api/z-nfz-ysjl-sps/key?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getProblemDealItems(params) {
  return xRequest(`/gateway/frontendservice/api/z-nfz-ssjls/key?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getAll() {
  return xRequest(`/gateway/frontendservice/api/z-nfz-ysjl-gss/all`, {
    method: 'GET',
  });
}

export async function remove(params) {
  return xRequest(`/gateway/frontendservice/api/z-nfz-ysjl-gss/${params.id}`, {
    method: 'DELETE',
  });
}

export async function update(data) {
  return xRequest(`/gateway/frontendservice/api/z-nfz-ysjl-gss`, {
    method: 'PUT',
    body: data,
  });
}

export async function getDocData(params){
  return xRequest(`/gateway/wsgenservice/api/z-nfz-ws-data/fetchNew?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function pushDoc(params){
  return xRequest(`/gateway/wsgenservice/api/WsToTyyw`, {
    method: 'POST',
    body: params,
  });
}

export async function _getDocData(params){
  return xRequest(`/gateway/wsgenservice/api/z-nfz-ws-data/fetch?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function saveDocData(data) {
  return xRequest('/gateway/wsgenservice/api/z-nfz-ws-data', {
    method: 'POST',
    body: data,
  });
}

export async function removeDocData(data) {
  return xRequest('/gateway/wsgenservice/api/z-nfz-ws-data/remove', {
    method: 'POST',
    body: data,
  });
}

export async function getSybs(data) {
  return xRequest('/gateway/cmplatform/api/sybs', {
    method: 'POST',
    body: data,
  });
}

export async function getFact(data) {
  return xRequest('/gateway/cmplatform/api/fact/get', {
    method: 'POST',
    body: data,
  });
}

export async function getAllProblem(params) {
  return xRequest(`/gateway/frontendservice/api/z-nfz-ysjl-gss/listall?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

