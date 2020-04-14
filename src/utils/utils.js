import moment from 'moment';
import _ from 'lodash';
import qs from 'qs';
import Session from './session';
import {WOPI_CONTEXT} from '../constant';

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - (day * oneDay);

    return [moment(beginTime), moment(beginTime + ((7 * oneDay) - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`), moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000)];
  }

  if (type === 'year') {
    const year = now.getFullYear();

    return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
  }
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach((node) => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

export function digitUppercase(n) {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ];
  let num = Math.abs(n);
  let s = '';
  fraction.forEach((item, index) => {
    s += (digit[Math.floor(num * 10 * (10 ** index)) % 10] + item).replace(/零./, '');
  });
  s = s || '整';
  num = Math.floor(num);
  for (let i = 0; i < unit[0].length && num > 0; i += 1) {
    let p = '';
    for (let j = 0; j < unit[1].length && num > 0; j += 1) {
      p = digit[num % 10] + unit[1][j] + p;
      num = Math.floor(num / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }

  return s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
}


function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!');  // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  } else if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    let isAdd = false;
    
    isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(routePath =>
    routePath.indexOf(path) === 0 && routePath !== path);
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map((item) => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
      exact,
    };
  });
  return renderRoutes;
}



const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g;

export function isUrl(path) {
  return reg.test(path);
}

export const buildEmptyData = (columns, length = 10) => {
  if (!columns || !Array.isArray(columns) || length <= 0) {
    return [];
  }
  const data = {};
  columns.forEach(c => {
    data[c.dataIndex] = null;
  });

  let array = [];
  for (let i = 0; i < length; i++) {
    array.push(_.clone(data));
  }
  return array;
};

export const getFixScreenHeight = (fixHeight) => {
  const clientHeight = document.body.clientHeight;
  return Math.abs(clientHeight - fixHeight);
};

export const parseSearch = (search) => {
  if (/^\?.*/.test(search)) {
    search = search.substr(1);
  }
  return qs.parse(search);
};

export const getChartMonth = () => {
  return ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
};

export const checkPathInclude = (path, matchers) => {
  for (let i = 0; i < matchers.length; i++) {
    if (path.indexOf(matchers[i]) !== -1) {
      return true;
    }
  }
  return false;
};

export const getHttpHostPrefix = () => {
  const {protocol, hostname, port} = window.location;
  const _port = (!port || port === '') ? '' : `:${port}`;
  return `${protocol}//${hostname}${_port}${WOPI_CONTEXT}`
};

export const getHttpFullPath = (path) => {
  const {protocol, hostname, port} = window.location;
  const _port = (!port || port === '') ? '' : `:${port}`;
  return `${protocol}//${hostname}${_port}${ path ? (/\/.*/.test(path) ? path : '/' + path) : ''}`
};

/**
 * cursorPosition Object
 * The copyrights embodied in the content of this file are licensed under the BSD (revised) open source license.
 */
export const cursorPosition = {
  get: function (textarea) {
    let rangeData = {text: '', start: 0, end: 0};

    if (textarea.setSelectionRange) { // W3C
      textarea.focus();
      rangeData.start = textarea.selectionStart;
      rangeData.end = textarea.selectionEnd;
      rangeData.text = (rangeData.start != rangeData.end) ? textarea.value.substring(rangeData.start, rangeData.end) : '';
    } else if (document.selection) { // IE
      textarea.focus();
      let i,
        oS = document.selection.createRange(),
        // Don't: oR = textarea.createTextRange()
        oR = document.body.createTextRange();
      oR.moveToElementText(textarea);

      rangeData.text = oS.text;
      rangeData.bookmark = oS.getBookmark();

      // object.moveStart(sUnit [, iCount])
      // Return Value: Integer that returns the number of units moved.
      for (i = 0; oR.compareEndPoints('StartToStart', oS) < 0 && oS.moveStart("character", -1) !== 0; i++) {
        // Why? You can alert(textarea.value.length)
        if (textarea.value.charAt(i) == '\r') {
          i++;
        }
      }
      rangeData.start = i;
      rangeData.end = rangeData.text.length + rangeData.start;
    }

    return rangeData;
  },

  set: function (textarea, rangeData) {
    let oR, start, end;
    if (!rangeData) {
      alert('You must get cursor position first.')
    }
    textarea.focus();
    if (textarea.setSelectionRange) { // W3C
      textarea.setSelectionRange(rangeData.start, rangeData.end);
    } else if (textarea.createTextRange) { // IE
      oR = textarea.createTextRange();

      // Fixbug : ues moveToBookmark()
      // In IE, if cursor position at the end of textarea, the set function don't work
      if (textarea.value.length === rangeData.start) {
        //alert('hello')
        oR.collapse(false);
        oR.select();
      } else {
        oR.moveToBookmark(rangeData.bookmark);
        oR.select();
      }
    }
  },

  add: function (textarea, rangeData, text) {
    let oValue, nValue, oR, sR, nStart, nEnd, st;
    this.set(textarea, rangeData);

    if (textarea.setSelectionRange) { // W3C
      oValue = textarea.value;
      nValue = oValue.substring(0, rangeData.start) + text + oValue.substring(rangeData.end);
      nStart = nEnd = rangeData.start + text.length;
      st = textarea.scrollTop;
      textarea.value = nValue;
      // Fixbug:
      // After textarea.values = nValue, scrollTop value to 0
      if (textarea.scrollTop != st) {
        textarea.scrollTop = st;
      }
      textarea.setSelectionRange(nStart, nEnd);
    } else if (textarea.createTextRange) { // IE
      sR = document.selection.createRange();
      sR.text = text;
      sR.setEndPoint('StartToEnd', sR);
      sR.select();
    }
  },

  fireKeyEvent: function (el, evtType, keyCode) {
    let doc = el.ownerDocument, win = doc.defaultView || doc.parentWindow, evtObj;
    if (doc.createEvent) {
      if (win.KeyEvent) {
        evtObj = doc.createEvent('KeyEvents');
        evtObj.initKeyEvent(evtType, true, true, win, false, false, false, false, keyCode, 0);
      } else {
        evtObj = doc.createEvent('UIEvents');
        Object.defineProperty(evtObj, 'keyCode', {
          get: function () {
            return this.keyCodeVal;
          },
        });
        Object.defineProperty(evtObj, 'which', {
          get: function () {
            return this.keyCodeVal;
          },
        });
        evtObj.initUIEvent(evtType, true, true, win, 1);
        evtObj.keyCodeVal = keyCode;
        if (evtObj.keyCode !== keyCode) {
          console.log('keyCode ' + evtObj.keyCode + ' 和 (' + evtObj.which + ') 不匹配');
        }
      }
      el.dispatchEvent(evtObj);
    } else if (doc.createEventObject) {
      evtObj = doc.createEventObject();
      evtObj.keyCode = keyCode;
      el.fireEvent('on' + evtType, evtObj);
    }
  },

};

export const hasRoles = (roles) => {
  const session =  Session.get();
  if(!session || !session.roles){
    return false;
  }
  return _.some(roles, role=> session.roles.indexOf(role) >= 0);
};
