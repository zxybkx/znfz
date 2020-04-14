import request from "../../../utils/request";
import qs from "qs";


export async function saveSPProblem(data) {
  return request('/gateway/frontendservice/api/z-nfz-ysjl-sps/deal', {
    method: 'POST',
    body: data,
  });
}

/**
 * 根据部门受案号获取规则列表
 * @param params
 * @returns {Promise.<Object>}
 */
export async function getProblemList(params) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-sp-hzs/list?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getSubProblemByKey(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-sps/list-by-key?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getGLByKey(params) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-sp-coords?${qs.stringify(params)}`, {
    method: 'GET',
  });
}


export async function getFlfgByKey(params) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-flfgs/find-by-keyid?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getCascadeProblemByKey(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-sps/list-by-filekey?${qs.stringify(params)}`, {
    method: 'GET',
  });
}


