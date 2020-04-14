import { stringify } from 'qs';
import request from '../utils/request';
import {APP_VERSION} from '../constant';

export async function getVersionConfig() {
  return request(`/gateway/frontendservice/api/znfz-versions/${APP_VERSION}`, {
    method: 'GET',
  });
}

export async function parseTextFromNlp(params) {
  return request('/rtnlp/rtnlp', {
    method: 'POST',
    body: params,
  });
}

export async function getFact(params) {
  return request('/gateway/frontendservice/api/znfz-ysjl-yczjs/nlpdata', {
    method: 'POST',
    body: params,
  });
}

// export async function getTextFromOcr(params) {
//   return request('/ocrservice/reatime_ocr/realtime_ocr_img', {
//     method: 'POST',
//     body: params,
//   });
// }

export async function getTextFromOcr(params) {
  return request('/ocrservice/rtocr', {
    method: 'POST',
    body: params,
  });
}

export async function queryProjectNotice() {
  return request('/gateway/api/project/notice');
}

export async function queryActivities() {
  return request('/gateway/api/activities');
}

export async function queryRule(params) {
  return request(`/gateway/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/gateway/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/gateway/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/gateway/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/gateway/api/fake_chart_data');
}

export async function queryTags() {
  return request('/gateway/api/tags');
}

export async function queryBasicProfile() {
  return request('/gateway/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/gateway/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/gateway/api/fake_list?${stringify(params)}`);
}

export async function fakeAccountLogin(params) {
  return request('/gateway/api/login/account', {
    method: 'POST',
    body: params,
  });
}

export async function fakeRegister(params) {
  return request('/gateway/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function updateNoticeStatus(params) {
  return request('/gateway/frontendservice/api/xt-messages/status', {
    method: 'PUT',
    body: params,
  });
}

export async function queryNotices() {
  return request('/gateway/frontendservice/api/xt-messages/mine/top');
}
