import request from "../utils/request";
import qs from "querystring";

export async function getAjxx(params) {
  return request(`/gateway/frontendservice/api/t-yyw-gg-ajjbxxes/fetch?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function tbflg(params) {
  return request(`/gateway/frontendservice/api/t-yyw-gg-ajjbxxes/tbflag?${qs.stringify(params)}`, {
    method: 'GET',
  });
}
// 文书推送
export async function wsts(params) {
  return request(`/gateway/tyywservice/api/ts-ws/isgyws?${qs.stringify(params)}`, {
    method: 'GET'
  });
}
//创建文书
export async function credoc(payload) {
  return request(`/gateway/wsgenservice/api/WsToTyyw`, {
    method: 'POST',
    body: payload
  });
}
export async function colorqh(payload) {
  return request(`/gateway/dzjzservice/api/alterVisit`, {
    method: 'POST',
    body: payload
  });
}
export async function getProblemByKey(params) {
  let api = 'z-nfz-ysjl-zjs';
  switch (params.stage) {
    case 'GS':
      api = 'z-nfz-ysjl-gss';
      break;
    case 'SP':
      api = 'z-nfz-ysjl-sps';
      break;
    default:
      break;
  }
  return request(`/gateway/frontendservice/api/${api}/key?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getTree(params) {
  return request(`/gateway/frontendservice/api/z-nfz-wsst-trees/tree?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getDocData(params) {
  return request(`/gateway/wsgenservice/api/z-nfz-ws-data/fetchNew?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function wsmbdy(payload) {
  return request(`/gateway/tyywservice/api/ts-ws/wsmbdy`, {
    method: 'POST',
    body: payload,
  })
}

export async function createOrUpdate(payload) {
  return request(`/gateway/tyywservice/api/ts-ws/create-or-update?${qs.stringify(payload)}`, {
    method: 'GET',
    //body: payload,
  });
}

export async function getWh(payload) {
  return request(`/gateway/tyywservice/api/ts-ws/exist-wh`, {
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

export async function pushDoc(params) {
  return request(`/gateway/wsgenservice/api/WsToTyyw`, {
    method: 'POST',
    body: params,
  });
}

export async function removeDocData(data) {
  return request('/gateway/wsgenservice/api/z-nfz-ws-data/remove', {
    method: 'POST',
    body: data,
  });
}


export async function getAllBDPZ(params) {
  return request(`/gateway/frontendservice/api/znfz-bdpzs?${qs.stringify(params)}`, {
    method: 'GET',
  });
}


export async function getFormConfig(params) {
  return request(`/gateway/frontendservice/api/znfz-bdpzs/fetch`, {
    method: 'POST',
    body: params
  });
}

export async function getWsLinkData(params) {
  return request(`/gateway/wsgenservice/api/z-nfz-ws-data-links/${params.id}`, {
    method: 'GET',
  });
}

export async function saveLatestBmsah(params) {
  return request(`/gateway/frontendservice/api/uaa-user-statuses`, {
    method: 'PUT',
    body: params
  });
}

export async function getAjList(param, data) {
  return request(`/gateway/frontendservice/api/tasks/list?${qs.stringify(param)}`, {
    method: 'POST',
    body: data
  });
}

export async function getPjList(param) {
  return request(`/gateway/frontendservice/api/tasks/pjpage?${qs.stringify(param)}`, {
    method: 'GET',
  });
}

export async function getTasks(page, params) {
  return request(`/gateway/frontendservice/api/tasks/query?${qs.stringify(page)}`, {
    method: 'POST',
    body: params,
  });
}

export async function getNlpConfig(params) {
  return request(`/gateway/frontendservice/api/znfz-nlp-configs/type?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getNlpByBmsahAndWsmc(data) {
  return request(`/gateway/dzjzservice/archive/getNlpByBmsahAndWsmc`, {
    method: 'POST',
    body: data,
  });
}
export async function yjhjItem(params) {
  return request(`/gateway/dzjzservice/api/getYjHj?${qs.stringify(params)}`, {
    method: 'GET',
  });
}
export async function getNlpByBmsahAndImage(data) {
  return request(`/gateway/dzjzservice/archive/getNlpByBmsahAndImage`, {
    method: 'POST',
    body: data,
  });
}

export async function addNlpItem(data) {
  return request(`/gateway/dzjzservice/archive/addNlpListElementByBmsahAndKey`, {
    method: 'POST',
    body: data,
  });
}

export async function deleteNlpItem(data) {
  return request(`/gateway/dzjzservice/archive/delNlpListElementByBmsahAndKey`, {
    method: 'POST',
    body: data,
  });
}

export async function saveNLPData(data) {
  return request(`/gateway/dzjzservice/archive/z-nfz-bjxt-jls`, {
    method: 'POST',
    body: data,
  });
}

export async function fillNLPData(data) {
  return request('/gateway/cmplatform/tag/resettagnew', {
    method: 'POST',
    body: data,
  });
}

export async function reCalculateRules(data) {
  return request('/gateway/cmplatform/tag/resettag', {
    method: 'POST',
    body: data,
  });
}

export async function getVerbalList(params) {
  return request(`/gateway/dzjzservice/archive/getYczjByBmsah/${params.bmsah}`, {
    method: 'GET',
  });
}

export async function getFactList(params) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-facts/list-by-bmsah?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getFactListByType(params) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-facts/list-by-type?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function updateFact(payload) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-facts`, {
    method: 'PUT',
    body: payload
  });
}

export async function defaultRelated(payload) {
  return request(`/gateway/frontendservice/api/bshy-relation`, {
    method: 'POST',
    body: payload
  });
}

export async function getFilekeyAndChoosed(payload) {
  return request(`/gateway/dzjzservice/api/getFilekeyAndChoosed`, {
    method: 'POST',
    body: payload
  });
}

export async function chooseWs(payload) {
  return request(`/gateway/dzjzservice/api/chooseWs`, {
    method: 'POST',
    body: payload
  })
}

export async function saveFact(payload) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-facts`, {
    method: 'POST',
    body: payload
  });
}

export async function ysjlFactsChanged(payload) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-facts-changed`, {
    method: 'POST',
    body: payload
  })
}

export async function alterFactRdfs(payload) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-facts/alterFactRdzt`, {
    method: 'POST',
    body: payload
  })
}

export async function saveFacts(payload) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-facts/batch-save`, {
    method: 'POST',
    body: payload
  });
}

export async function setbshy(payload) {
  return request(`/gateway/frontendservice/api/setbshy?${qs.stringify(payload)}`, {
    method: 'GET',
  });
}

export async function deleteFact(payload) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-facts/${payload}`, {
    method: 'DELETE',
  });
}

export async function deleteYczjs(payload) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-yczjs/delete-yczjs?${qs.stringify(payload)}`, {
    method: 'GET',
  });
}

export async function updateYczj(payload) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-yczjs`, {
    method: 'PUT',
    body: payload
  });
}

export async function saveYczjs(payload) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-yczjs/batch-save`, {
    method: 'POST',
    body: payload
  });
}

export async function updateFactOwner(payload) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-fact-owners`, {
    method: 'PUT',
    body: payload
  });
}

export async function saveFactOwners(payload) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-fact-owners/batch-save`, {
    method: 'POST',
    body: payload
  });
}

export async function ysjlFactChanged(payload) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-fact-changed`,{
    method: 'POST',
    body: payload
  })
}

export async function saveFactConclusion(payload) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-facts`, {
    method: 'PUT',
    body: payload
  });
}

export async function saveFactConclusionByPeople(payload) {
  return request(`/gateway/cmplatform/api/znfz-fact-mergekey`, {
    method: 'POST',
    body: payload
  });
}

export async function getConclusionOptions(params) {
  return request(`/gateway/cmplatform/api/jl-new?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function restarttask(params) {
  return request(`/gateway/cmplatform/tools/restarttask?${qs.stringify(params)}`, {
    method: 'GET',
  });
}


export async function getLxtjjg(params) {
  return request(`/gateway/cmplatform/api/z-nfz-fact-lxtjjg?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getConclusionRules(params) {
  return request(`/gateway/frontendservice/api/znfz-scjl-configs/list-by-ysay?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getRzrfConclusionRules(params) {
  return request(`/gateway/frontendservice/api/znfz-scjl-rzrfs/list-rzrfs?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getConclusionData(params) {
  return request(`/gateway/frontendservice/api/scjl-xyr?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getRzrfConclusionData(params) {
  return request(`/gateway/frontendservice/api/rzrfjl-xyr?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getConclusion(payload) {
  return request(`/gateway/cmplatform/api/znfz-fact-dqz-jl`, {
    method: 'POST',
    body: payload
  });
}

export async function getNewConclusion(payload) {
  return request(`/gateway/cmplatform/api/znfz-fact-newjl`, {
    method: 'POST',
    body: payload
  });
}

export async function getConclusionByRules(payload) {
  return request(`/gateway/cmplatform/api/newSybs`, {
    method: 'POST',
    body: payload
  });
}

export async function saveConclusion(payload) {
  return request('/gateway/cmplatform/api/fact-list/set', {
    method: 'POST',
    body: payload,
  });
}

export async function saveNewConclusion(payload) {
  return request('/gateway/cmplatform/api/fact-list/newset', {
    method: 'POST',
    body: payload,
  });
}

export async function judgeAge(payload) {
  return request('/gateway/cmplatform/api/fact/judgeAge', {
    method: 'POST',
    body: payload,
  });
}

export async function saveRzrfConclusion(payload) {
  return request('/gateway/cmplatform/api/fact-list/setrzrf', {
    method: 'POST',
    body: payload,
  })
}

export async function getSycxs(payload) {
  return request('/gateway/cmplatform/api/sycxs', {
    method: 'POST',
    body: payload,
  });
}

export async function getRzrfConclusionByRules(payload) {
  return request(`/gateway/cmplatform/api/rzrfs`, {
    method: 'POST',
    body: payload
  })
}



export async function getOcrByBmsahAndImage(payload) {
  return request('/gateway/dzjzservice/archive/getOcrByBmsahAndImage', {
    method: 'POST',
    body: payload,
  });
}

export async function getFactOcrByBmsahAndImage(payload) {
  return request('/gateway/dzjzservice/archive/GetNlpByBmsahAndSs', {
    method: 'POST',
    body: payload,
  });
}

export async function updateAJZT(data) {
  return request('/gateway/frontendservice/api/z-nfz-ajzts', {
    method: 'POST',
    body: data,
  });
}

export async function getDocConfigs(params) {
  return request(`/gateway/frontendservice/api/znfz-doc-configs/dwbm?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function findSpjdZt(params) {
  return request(`/gateway/frontendservice/api/findSpjdZt?${qs.stringify(params)}`, {
    method: 'GET'
  })
}

export async function updateSpjdBjsj(params) {
  return request(`/gateway/frontendservice/api/updateSpjdBjsj?${qs.stringify(params)}`, {
    method: 'GET',
  })
}

export async function reCalculate(payload) {
  return request('/gateway/cmplatform/tag/runrules', {
    method: 'POST',
    body: payload,
  });
}


export async function getTreeList(params) {
  return request(`/gateway/dzjzservice/api/z-nfz-wsst-trees/tree?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getBshyTreeList(params) {
  return request(`/gateway/cmplatform/api/znfz-bshy-trees/one/${params}`, {
    method: 'GET',
  });
}

export async function getLccontrol(params) {
  return request(`/gateway/dzjzservice/archive/get-required?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getFactMark(params) {
  return request(`/gateway/frontendservice/api/get-yczjs?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function importFact(payload) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-yczjs/find-by-bmsah-and-mergkey-and-owner`, {
    method: 'POST',
    body: payload,
  });
}

export async function saveFactMark(payload) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-yczjs/batch-save-new`, {
    method: 'POST',
    body: payload,
  });
}

export async function get_enumerate() {
  return request(`/gateway/frontendservice/api/get_enumerate`, {
    method: 'GET',
  });
}

export async function get_xyrName(params) {
  return request(`/gateway/cmplatform/api/TYYW_GG_XYRJBXX/${params.bmsah}`, {
    method: 'GET',
  })
}

export async function getMark(params) {
  return request(`/gateway/frontendservice/api/getMark/${params.bmsah}/image?image=${params.image}`, {
    method: 'GET',
  });
}

export async function saveMark(payload) {
  return request('/gateway/frontendservice/api/saveMark', {
    method: 'POST',
    body: payload,
  });
}


export async function deleteMark(payload) {
  return request(`/gateway/frontendservice/api/deleteMark/${payload.id}`, {
    method: 'DELETE',
  });
}

export async function attributeChange(payload) {
  return request(`/gateway/dzjzservice/archive/save-nlp-attribute`, {
    method: 'POST',
    body: payload,
  });
}

export async function getBshyTree(params) {
  return request(`/gateway/dzjzservice/api/z-nfz-wsst-trees/bshytree?${qs.stringify(params)}`, {
    method: 'GET',
  });
}


export async function sendAKUser(payload) {
  return request(`/gateway/frontendservice/api/znfz-aks`, {
    method: 'POST',
    body: payload,
  });
}


export async function getFactMaterials(params) {
  return request(`/gateway/frontendservice/api/znfz-yjxt-yjbq-bmsahs?${qs.stringify(params)}`, {
    method: 'GET',
  });
}


export async function getStepList(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ajzts/getjllc?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getAllpd(params) {
  return request(`/gateway/frontendservice/state/get-state?${qs.stringify(params)}`, {
    method: 'GET',
  });
}
export async function getRequireByBmash(params) {
  return request(`/gateway/dzjzservice/api/znfz-bshy-trees/getRequireByBmsah?${qs.stringify(params)}`, {
    method: 'GET',
  });
}
export async function saveYjHj(data) {
  return request(`/gateway/dzjzservice/api/saveYjHj`, {
    method: 'POST',
    body: data
  });
}
export async function sendStepList(payload) {
  return request(`/gateway/frontendservice/api/z-nfz-ajzts/setjllc`, {
    method: 'POST',
    body: payload,
  });
}


export async function deleteStepList(payload) {
  return request(`/gateway/cmplatform/api/fact/reset`, {
    method: 'POST',
    body: payload,
  });
}



export async function saveXtwt(data) {
  return request('/gateway/frontendservice/api/z-nfz-xtwts', {
    method: 'POST',
    body: data,
  });
}

export async function saveMarks(data) {
  return request('/gateway/frontendservice/api/z-nfz-bjxt-jls', {
    method: 'POST',
    body: data,
  });
}

export async function saveConclusions(data) {
  return request('/gateway/cmplatform/api/fact/setjl', {
    method: 'POST',
    body: data,
  });
}

export async function reCalculateProblem(data) {
  return request('/gateway/cmplatform/tag/resettag', {
    method: 'POST',
    body: data,
  });
}

export async function getReCalculateResult(data) {
  return request('/gateway/cmplatform/tag/getResult', {
    method: 'POST',
    body: data,
  });
}

export async function getConclusionConfigs(params) {
  return request(`/gateway/cmplatform/api/jl?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getSybs(data) {
  return request('/gateway/cmplatform/api/sybs', {
    method: 'POST',
    body: data,
  });
}


export async function getFlfgByKey(params) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-flfgs/find-by-keyid?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getZJProblemList(params) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-zj-hzs/list?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getZJSubProblemByKey(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-zjs/list-by-key?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function saveZJProblem(data) {
  return request('/gateway/frontendservice/api/z-nfz-ysjl-zjs/deal', {
    method: 'POST',
    body: data,
  });
}

export async function getGSProblemList(params) {
  return request(`/gateway/frontendservice/api/znfz-ysjl-gs-hzs/list?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function getGSSubProblemByKey(params) {
  return request(`/gateway/frontendservice/api/z-nfz-ysjl-gss/list-by-key?${qs.stringify(params)}`, {
    method: 'GET',
  });
}

export async function saveGSProblem(data) {
  return request('/gateway/frontendservice/api/z-nfz-ysjl-gss/deal', {
    method: 'POST',
    body: data,
  });
}

export async function saveSPProblem(data) {
  return request('/gateway/frontendservice/api/z-nfz-ysjl-sps/deal', {
    method: 'POST',
    body: data,
  });
}

export async function getIdentity(data) {
  return request(`/gateway/dzjzservice/archive/isSuspect`, {
    method: 'POST',
    body: data,
  });
}


export async function ajcq(data) {
  return request(`/gateway/cmplatform/api/refetch`, {
    method: 'POST',
    body: data,
  });
}


export async function resetBjsj(params) {
  return request(`/gateway/cmplatform/api/bjsj/reset?${qs.stringify(params)}`, {
    method: 'GET',
  });
}


export async function GetXyrxx(params) {
  return request(`/gateway/cmplatform/api/GetXyrxx/${params}`, {
    method: 'GET',
  });
}

export async function getTyywGgXyrjbxx(params) {
  return request(`/gateway/dzjzservice/api/getTyywGgXyrjbxx?${qs.stringify(params)}`, {
    method: 'GET'
  })
}

export async function alterVisit(payload) {
  return request(`/gateway/dzjzservice/api/alterVisit`, {
    method: 'POST',
    body: payload
  })
}

export async function ysjlFact(payload) {
  return request(`/gateway/frontendservice/api/updateById`, {
    method: 'POST',
    body: payload
  })
}



