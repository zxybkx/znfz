import xRequest from "../../../utils/request";
import qs from "querystring";


export async function getAjxg({page,size,data}){
  return xRequest(`/gateway/frontendservice/api/wtfk/ajxg?${qs.stringify({page,size})}`,{
    method:"POST",
    body: data
  })
}


export async function getXtxg(params){
  return xRequest(`/gateway/frontendservice/api/wtfk/xtxg?${qs.stringify(params)}`,{
    method:"GET"
  })
}


export async function changeCkzt(data){
  return xRequest(`/gateway/frontendservice/api/wtfk/update-ckzt`,{
    method:'PUT',
    body:data
  })
}

export async function getMyStatics(){
  return xRequest(`/gateway/frontendservice/api/wtfk/statics/mine`,{
    method:"GET",
  });
}

export async function getMyYhfk(params){
  return xRequest(`/gateway/frontendservice/api/z-nfz-yhfks/mine?${qs.stringify(params)}`,{
    method:"POST",
    body: params,
  });
}

export async function getMyXtwt(params){
  return xRequest(`/gateway/frontendservice/api/z-nfz-xtwts/mine?${qs.stringify(params)}`,{
    method:"POST",
    body: params,
  });
}

export async function getStaticsByBmsah(bmsah){
  return xRequest(`/gateway/frontendservice/api/wtfk/statics/by-bmsah/${bmsah}`,{
    method:"GET",
  });
}

export async function getYhfkByBmsah(bmsah, params){
  return xRequest(`/gateway/frontendservice/api/z-nfz-yhfks/fetch/${bmsah}?${qs.stringify(params)}`,{
    method:"GET",
  });
}
export async function getXtwtByBmsah(params){
  return xRequest(`/gateway/frontendservice/api/z-nfz-xtwts/fetch/${params}`,{
    method:"GET",
  });
}

export async function getXtwt(id){
  return xRequest(`/gateway/frontendservice/api/z-nfz-xtwts/${id}`,{
    method:"GET",
  });
}

export async function getYhfk(id){
  return xRequest(`/gateway/frontendservice/api/z-nfz-yhfks/${id}`,{
    method:"GET",
  });
}

export async function saveXtwtdf(data){
  return xRequest(`/gateway/frontendservice/api/znfz-xtwt-dfs`,{
    method:"POST",
    body: data,
  });
}

export async function saveYhfkdf(data){
  return xRequest(`/gateway/frontendservice/api/z-nfz-yhfk-dfs`,{
    method:"POST",
    body: data,
  });
}




