import xRequest from "../../../utils/request";
import qs from "qs";

export async function getTree(params) {
  return xRequest(`/gateway/ui/api/x-t-zzjg-dwbms/all?${qs.stringify(params)}`, {
    method: 'GET',
  });
}


export async function PublishDailies(params) {
  return xRequest(`/gateway/wsgenservice/api/PublishDailies`, {
    method: 'POST',
    body: params,
  });
}
export async function getDailies(params) {
  return xRequest(`/gateway/wsgenservice/api/getDailies`, {
    method: 'POST',
    body: params,
  });
}
export async function publishReport(params) {
  return xRequest(`/gateway/wsgenservice/api/publishReport?id=${params}`);
}
export async function fetchDaily(params) {
  return xRequest(`/gateway/wsgenservice/api/z-nfz-ws-data/fetchDaily`, {
    method: 'POST',
    body: params,
  });
}
export async function deleteDaily(params) {
  return xRequest(`/gateway/wsgenservice/api/z-nfz-ws-dailies-delete?${qs.stringify(params)}`);
}
export async function renameDaily(params) {
  return xRequest(`/gateway/wsgenservice/api/z-nfz-ws-data/rename`, {
    method: 'POST',
    body: params,
  });
}


