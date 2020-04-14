import xRequest from "../utils/request";
import qs from "querystring";

export async function query(params) {
  return xRequest(`/gateway/frontendservice/api/z-nfz-yhfks?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function saveYHFK(data) {
  return xRequest('/gateway/frontendservice/api/z-nfz-yhfks', {
    method: 'POST',
    body: data,
  });
}

export async function remove(params) {
  return xRequest('/gateway/frontendservice/api/z-nfz-yhfks', {
    method: 'DELETE',
    body: qs.stringify(params),
  });
}

export async function update(params) {
  return xRequest('/gateway/frontendservice/api/z-nfz-yhfks', {
    method: 'PUT',
    body: qs.stringify(params),
  });
}

export async function getFile(params) {
  return xRequest(`/gateway/frontendservice/api/queryDaily/${params}`, {
    method: 'GET',
  });
}

export async function getLatestAjxx() {
  return xRequest(`/gateway/frontendservice/api/t-yyw-gg-ajjbxxes/latest`, {
    method: 'GET',
  });
}


export async function countZcjd(params) {
  return xRequest(`/gateway/tjfxservice/api/countZcjd?${qs.stringify(params)}`, {
    method: 'GET',
  });
}


export async function countAjcl(params) {
  return xRequest(`/gateway/tjfxservice/api/countAjcl?${qs.stringify(params)}`, {
    method: 'GET',
  });
}


export async function countBasc(params) {
  return xRequest(`/gateway/tjfxservice/api/countBasc?${qs.stringify(params)}`, {
    method: 'GET',
  });
}


export async function countBaqk(params) {
  return xRequest(`/gateway/tjfxservice/api/countBaqk?${qs.stringify(params)}`, {
    method: 'GET',
  });
}


export async function getDxal(params) {
  return xRequest(`/gateway/tjfxservice/api/getDxal?`, {
    method: 'GET',
  });
}


export async function getFlfg(params) {
  return xRequest(`/gateway/tjfxservice/api/getFlfg?`, {
    method: 'GET',
  });
}

/**
 * 侦查监督回溯
 * @param params
 * @returns {Promise.<Object>}
 */
export async function countZcjdDetail(params) {
  return xRequest(`/gateway/tjfxservice/api/countZcjdDetail?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

/**
 *案件处理回溯
 * @param params
 * @returns {Promise.<Object>}
 */
export async function countAjclDetail(params) {
  return xRequest(`/gateway/tjfxservice/api/countAjclDetail?${qs.stringify(params)}`, {
    method: 'GET',
  });
}
