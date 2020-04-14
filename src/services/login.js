import request from '../utils/request';
import qs from "qs";

export async function login(data) {
  return request('/gateway/frontendservice/au/authenticate', {
    method: 'POST',
    body: data,
  });
}

export async function access(data) {
  return request(`/gateway/frontendservice/au/access?${qs.stringify(data)}`, {
    method: 'GET',
  });
}
