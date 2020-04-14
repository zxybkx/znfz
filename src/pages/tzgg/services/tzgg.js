import xRequest from "../../../utils/request";
import qs from "querystring";

export async function getFile(params,data) {
  return xRequest(`/gateway/frontendservice/api/getZnfz_TZGGAllByCondition?${qs.stringify(params)}`, {
    method: 'POST',
    body: data,
  });
}


export async function getDxal(params) {
  return xRequest(`/gateway/tjfxservice/api/getDxalByPage?${qs.stringify(params)}`, {
    method: 'GET',
  });
}


export async function getFlfg(params) {
  return xRequest(`/gateway/tjfxservice/api/getFlfgByPage?${qs.stringify(params)}`, {
    method: 'GET',
  });
}
