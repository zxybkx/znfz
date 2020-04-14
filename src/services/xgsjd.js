import request from "../utils/request";
import qs from "qs";

export async function query(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-gss?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function saveProblem(data) {
  return request('/gateway/frontendservice/api/z-nfz-ysjl-gss/deal', {
    method: 'POST',
    body: data,
  });
}

export async function getAjxx(params) {
  return request(`/gateway/frontendservice/api/t-yyw-gg-ajjbxxes/fetch?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getProblems(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-gss/list?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getProblemByKey(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-gss/key?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function remove(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-gss/${params.id}`, {
    method: 'DELETE',
  });
}

export async function update(data) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-gss`, {
    method: 'PUT',
    body: data,
  });
}

export async function getAllProblem(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-gss/listall?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

/**
 * 根据部门受案号获取规则列表
 * @param params
 * @returns {Promise.<Object>}
 */
export async function getProblemList(params) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-gs-hzs/list?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getSubProblemByKey(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-gss/list-by-key?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getFlfgByKey(params) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-flfgs/find-by-keyid?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getCascadeProblemByKey(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-gss/list-by-filekey?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getDocData(params) {
  return request(`/gateway/wsgenservice/api/z-nfz-ws-data/fetchNew?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function pushDoc(params) {
  return request(`/gateway/wsgenservice/api/WsToTyyw?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function createOrUpdate(payload) {
  return request(`/gateway/tyywservice/api/ts-ws/create-or-update?${qs.stringify(payload)}`, {
    method: 'GET',
    //body: payload,
  });
}

export async function getZJbmsah(payload) {
  return request(`/gateway/frontendservice/api/bshy-get-bmsah?${qs.stringify(payload)}`,{
    method: 'GET',
  })
}

export async function getWh(payload) {
  return request(`/gateway/tyywservice/api/ts-ws/exist-wh`, {
    method: 'POST',
    body: payload,
  })
}

export async function saveRelatedInfo(payload) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-facts/save-zj-mergekey`, {
    method: 'POST',
    body: payload,
  })
}

export async function wsType(payload) {
  return request(`/gateway/tyywservice/api/ts-ws/select-lcjdbh`, {
    method: 'POST',
    body: payload,
  })
}

export async function removeDocData(data) {
  return request('/gateway/wsgenservice/api/z-nfz-ws-data/remove', {
    method: 'POST',
    body: data,
  });
}

export async function getConclusionByRules(payload) {
  return request(`/gateway/cmplatform/api/sybss`, {
    method: 'POST',
    body: payload
  });
}

export async function getRzrfConclusionByRules(payload) {
  return request(`/gateway/cmplatform/api/rzrfs`, {
    method: 'POST',
    body: payload
  })
}


export async function getLxtjjg(params) {
  return request(`/gateway/cmplatform/api/z-nfz-fact-lxtjjg?${qs.stringify(params)}`, {
    method: 'GET',
  });
}
