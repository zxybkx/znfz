import React from 'react';
import _ from 'lodash';
import PromiseRender from './PromiseRender';
import { CURRENT } from './index';

function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}

/**
 * 通用权限检查方法
 * Common check permissions method
 * @param { 权限判定 Permission judgment type string |array | Promise | Function } authority
 * @param { 你的权限 Your permission description  type:string} currentAuthority
 * @param { 通过的组件 Passing components } target
 * @param { 未通过的组件 no pass components } Exception
 */
const checkPermissions = (authority, currentAuthority, target, Exception) => {

  // Retirement authority, return target;
  if (!authority) {
    return target;
  }

  if (Array.isArray(authority)) {
    if(currentAuthority.indexOf(',') >= 0){
      let currentAuthorities = currentAuthority.split(',');
      if(_.union(currentAuthorities, authority).length > 0){
        return target;
      }
      return Exception;
    }else {
      if (authority.indexOf(currentAuthority) >= 0) {
        return target;
      }
      return Exception;
    }
  }


  if (typeof authority === 'string') {
    if (_.indexOf(currentAuthority, authority) >= 0) {
      return target;
    }
    return Exception;
  }


  if (isPromise(authority)) {
    return <PromiseRender ok={target} error={Exception} promise={authority} />;
  }


  if (typeof authority === 'function') {
    try {
      const bool = authority(currentAuthority);
      if (bool) {
        return target;
      }
      return Exception;
    } catch (error) {
      throw error;
    }
  }
  throw new Error('unsupported parameters');
};

export { checkPermissions };

const check = (authority, target, Exception) => {
  return checkPermissions(authority, CURRENT, target, Exception);
};

export default check;
