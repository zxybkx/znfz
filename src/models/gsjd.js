import {
  getAjxx,
  getCategories,
  getSPCategories,
  getProblemByKey,
  getSPProblemByKey,
  getProblems,
  getSPProblems,
  saveProblem,
  saveSPProblem,
  getDocData,
  pushDoc,
  _getDocData,
  saveDocData,
  removeDocData,
  getSybs,
  getFact,
  getAllProblem,
} from '../services/gsjd.js';
import {message} from 'antd';
import Promise from 'bluebird';
import _ from 'lodash';
import $ from 'jquery';

const getWsState = (wsmbmc, data) => {
  let newState;
  switch (wsmbmc) {
    case '公诉案件审查报告':
      newState = {
        gsajscbg: data,
      };
      break;
    case '起诉书':
      newState = {
        qss: data,
      };
      break;
    case '存疑不起诉决定书':
      newState = {
        cybqss: data,
      };
      break;
    case '法定不起诉决定书':
      newState = {
        fdbqss: data,
      };
      break;
    case '相对不起诉决定书':
      newState = {
        xdbqss: data,
      };
      break;
    case '量刑建议书':
      newState = {
        lxjys: data,
      };
      break;
    case '检察建议书':
      newState = {
        jcjys: data,
      };
      break;
    case '纠正违法通知书':
      newState = {
        jzwftzs: data,
      };
      break;
    case '出庭预案':
      newState = {
        ctya: data,
      };
      break;
    case '庭审笔录':
      newState = {
        tsbl: data,
      };
      break;
    case '讯问提纲':
      newState = {
        xwtg: data,
      };
      break;
    case '补充侦查提纲':
      newState = {
        bczctg: data,
      };
      break;
    case '刑事判决、裁判审查表':
      newState = {
        xskss: data,
      };
      break;
    default:
  }

  return newState;
};

export default {

  namespace: 'gsjd',

  state: {
    ajxx: {},
    modalType: 'create',
    parent: [],
    field: '',
    keyword: '',
    scqsTotal: null,
    spjdTotal: null,
    pageSize: 10,
    total: 0,
    current: 1,
    currentItem: {},
    editorVisible: false,

    listVisible: false,
    problemResultVisible: false,
    docViewVisible: false,

    categories: [],
    toDealList: [],
    dealedList: [],
    allList: [],

    coords: [],
    problem: {},

    activeMainCategory: null,
    activeSubCategory: null,

    gsajscbg: null,
    qss: null,
    cybqss: null,
    fdbqss: null,
    xdbqss: null,
    lxjys: null,
    jcjys: null,
    jzwftzs: null,
    ctya: null,
    tsbl: null,
    xwtg: null,
    bczctg: null,
    xskss: null,

    fact: {},
    conclusion: {},
    conclusionConfigs: [],
    allProblem: [],
  },

  subscriptions: {},

  effects: {
    * loadDocData({payload}, {select, call, put}) {
      let ajxx = yield select(({gsjd}) => gsjd.ajxx);
      if (!ajxx || !ajxx.bmsah) {
        const {data, success} = yield call(getAjxx, payload);
        if (success) {
          ajxx = data;
        }
      }

      if (!ajxx || !ajxx.bmsah) {
        return false;
      }

      const wsmbmc = payload.wsmbmc;

      const _payload = {
        bmsah: ajxx.bmsah,
        ysay: ajxx.ysay_aymc,
        tysah: ajxx.tysah,
        stage: payload.stage,
        wsmbmc: wsmbmc,
        http_header: payload.http_header,
      };
      return yield call(getDocData, _payload);
    },

    * pushDoc({payload}, {select, call, put}) {
      return yield call(pushDoc, payload);
    },

    * _loadDocData({payload}, {select, call, put}) {

      let ajxx = yield select(({gsjd}) => gsjd.ajxx);
      if (!ajxx || !ajxx.bmsah) {
        const {data, success} = yield call(getAjxx, payload);
        if (success) {
          ajxx = data;
        }
      }

      if (!ajxx || !ajxx.bmsah) {
        return false;
      }

      const wsmbmc = payload.wsmbmc;

      const _payload = {
        bmsah: ajxx.bmsah,
        ysay: ajxx.ysay_aymc,
        tysah: ajxx.tysah,
        stage: 'GS',
        wsmbmc: wsmbmc
      };

      return yield call(_getDocData, _payload);
    },

    * reloadDocData({payload}, {call, put}) {
      const formData = {
        tysah: payload.data.tysah,
        bmsah: payload.data.bmsah,
        ysay: payload.data.ysay,
        wsmbmc: payload.data.wsmbmc,
        stage: 'GS',
      };

      if (formData && formData.bmsah && formData.wsmbmc) {
        yield call(removeDocData, formData);
        const {data, success} = yield call(getDocData, formData);
        if (success && data) {
          const newState = getWsState(formData.wsmbmc, data);
          yield put({
            type: 'changeState',
            payload: {
              ...newState,
              ...payload,
            },
          });
        }
      }
    },

    * removeDocData({payload}, {call, put}) {
      const formData = {
        tysah: payload.ajxx.tysah,
        bmsah: payload.ajxx.bmsah,
        ysay: payload.ajxx.ysay_aymc,
        wsmbmc: payload.wsmbmc,
        stage: payload.stage,
      };

      if (formData && formData.bmsah && formData.wsmbmc) {
        return yield call(removeDocData, formData);
      } else {
        Promise.resolve({sucess: false})
      }
    },

    * saveDocData({payload}, {select, call, put}) {

      const wsmbmc = payload.data.wsmbmc;

      const formData = {
        ...payload.data,
        stage: 'GS',
      };

      if (formData && formData.bmsah) {
        const {data, success} = yield call(saveDocData, formData);
        if (success && data) {
          message.success('文书内容保存成功。');
          const newState = getWsState(wsmbmc, data);
          yield put({
            type: 'changeState',
            payload: {
              ...newState,
              ...payload,
            },
          });
        }
      }
    },

    * exportDocData({payload}, {select, call, put}) {

      let ajxx = yield select(({gsjd}) => gsjd.ajxx);
      if (!ajxx || !ajxx.bmsah) {
        const {data, success} = yield call(getAjxx, payload);
        if (success) {
          ajxx = data;
        }
      }

      if (!ajxx || !ajxx.bmsah) {
        return false;
      }

      const wsmbmc = payload.data.wsmbmc;

      const formData = {
        ...payload.data,
        stage: 'ZJ',
      };

      if (formData && formData.bmsah) {
        let iframe = $('<iframe src="about:blank" name="blankFrame" id="blankFrame" style="display: none;"></iframe>');
        let form = $('<form>');
        form.attr('style', 'display:none');
        form.attr('target', 'blankFrame');
        form.attr('method', 'get');
        form.attr('action', '/gateway/wsgenservice/api/z-nfz-ws-data/exportWord');
        let input1 = $('<input>');
        input1.attr('type', 'hidden');
        input1.attr('name', 'bmsah');
        input1.attr('value', formData.bmsah);
        let input2 = $('<input>');
        input2.attr('type', 'hidden');
        input2.attr('name', 'wsmbmc');
        input2.attr('value', wsmbmc);
        let input3 = $('<input>');
        input3.attr('type', 'hidden');
        input3.attr('name', 'stage');
        input3.attr('value', 'GS');
        let input4 = $('<input>');
        input4.attr('type', 'hidden');
        input4.attr('name', 'ysay');
        input4.attr('value', ajxx.ysay_aymc);
        $('body').append(iframe);
        $('body').append(form);
        form.append(input1);
        form.append(input2);
        form.append(input3);
        form.append(input4);
        form.submit();
      }
    },

    * initStates({payload}, {select, call, put}) {
      yield put({
        type: 'changeState',
        payload: {
          subCategories: [],
          toDealList: [],
          dealedList: [],
          allList: [],
          problem: {},
          listVisible: false,
          activeMainCategory: null,
          activeSubCategory: null,
        },
      });
    },

    * getCategories({payload}, {select, call, put}) {
      yield put({type: 'initStates'});
      const oraData = require('../pages/gsjd/data/category.json').main;
      const {data, success} = yield call(getCategories, payload);
      if (success) {
        const categories = _.cloneDeep(oraData);
        categories.map(main => {
          let dbData = data.filter((c) => {
            return c.categoryName === main.categoryName;
          });
          if (dbData && dbData.length > 0) {
            Object.assign(main, dbData[0]);
          }

          main.children.map(sub => {
            dbData = data.filter((c) => {
              return c.categoryName === sub.categoryName;
            });
            if (dbData && dbData.length > 0) {
              Object.assign(sub, dbData[0]);
            }
          })
        });

        yield put({
          type: 'changeState',
          payload: {
            categories: categories,
            ...payload,
          },
        });
      }
    },

    * getSPCategories({payload}, {select, call, put}) {
      yield put({type: 'initStates'});
      const oraData = require('../pages/gsjd/data/category.json').spmain;
      const {data, success} = yield call(getSPCategories, payload);
      if (success) {
        const mainCategory = _.cloneDeep(oraData);
        mainCategory.map((cat) => {
          const dbData = data.filter((c) => {
            return c.categoryName === cat.categoryName;
          });
          if (dbData && dbData.length > 0) {
            Object.assign(cat, dbData[0]);
          }
        });

        yield put({
          type: 'changeState',
          payload: {
            categories: mainCategory,
          },
        });
      }
    },

    * getProblems({payload}, {select, call, put}) {
      const {data, success} = yield call(getProblems, payload);

      if (success) {
        let _payload = {
          listVisible: true,
          allList: data,
        };

        if (payload.level === 1) {
          _payload.activeMainCategory = payload.categoryName;
          _payload.activeSubCategory = null;
        } else {
          _payload.activeSubCategory = payload.categoryName;
        }

        yield put({
          type: 'changeState',
          payload: _payload,
        });
      }

    },

    * getSPProblems({payload}, {select, call, put}) {

      const {data, success} = yield call(getSPProblems, payload);
      if (success) {
        let _payload = {
          listVisible: true,
          allList: data,
        };

        _payload.activeMainCategory = payload.categoryName;
        _payload.activeSubCategory = null;

        yield put({
          type: 'changeState',
          payload: _payload,
        });
      }
    },

    * query({payload}, {select, call, put}) {
      const ajxx = yield select(({gsjd}) => gsjd.ajxx);
      const activeMainCategory = yield select(({gsjd}) => gsjd.activeMainCategory);
      const activeSubCategory = yield select(({gsjd}) => gsjd.activeSubCategory);

      const stage = payload.stage;
      if (stage === 'GS') {
        const _payload = {
          bmsah: ajxx.bmsah,
        };
        if (activeSubCategory) {
          _payload.categoryName = activeSubCategory;
          _payload.level = 2;
        } else {
          _payload.categoryName = activeMainCategory;
          _payload.level = 1;
        }
        const {data, success} = yield call(getProblems, _payload);
        if (success) {
          let _payload = {
            listVisible: true,
            allList: data,
          };

          yield put({
            type: 'changeState',
            payload: _payload,
          });
        }
      } else {
        const _payload = {
          bmsah: ajxx.bmsah,
          categoryName: activeMainCategory,
          level: 1,
        };
        const {data, success} = yield call(getSPProblems, _payload);
        if (success) {
          let _payload = {
            listVisible: true,
            allList: data,
          };

          yield put({
            type: 'changeState',
            payload: _payload,
          });
        }
      }

    },

    * getAjxx({payload}, {call, put}) {
      const {data, success} = yield call(getAjxx, payload);
      if (success) {
        if (!data) {
          message.error('案件信息获取失败。');
        }
        let _data = data || {};
        yield put({
          type: 'changeState',
          payload: {
            ajxx: _data,
          },
        });
      }
    },

    * saveProblem({payload}, {select, call, put}) {
      const problemDTO = {
        id: payload.id,
        dealdata: payload.data,
      };

      const stage = payload.stage;

      if (stage === 'GS') {
        const {success, data} = yield call(saveProblem, problemDTO);
        if (success && data) {
          message.success('问题处理成功');
        }
      } else {
        const {success, data} = yield call(saveSPProblem, problemDTO);
        if (success && data) {
          message.success('问题处理成功');
        }
      }
    },

    * getProblemByKey({payload}, {select, call, put}) {
      const stage = payload.stage;
      if (stage === 'GS') {
        const {success, data} = yield call(getProblemByKey, payload);
        if (success) {
          yield put({
            type: 'changeState',
            payload: {
              ...payload,
              problem: data,
            },
          });
        }
      } else {
        const {success, data} = yield call(getSPProblemByKey, payload);
        if (success) {
          yield put({
            type: 'changeState',
            payload: {
              ...payload,
              problem: data,
            },
          });
        }
      }
    },

    * openResultViewModal({payload}, {select, call, put}) {

      const stage = payload.stage;

      if (stage === 'GS') {
        const {data, success} = yield call(getProblemByKey, payload);

        if (success) {
          yield put({
            type: 'changeState',
            payload: {
              ...payload,
              problem: data,
              problemResultVisible: true,
            },
          });
        }
      } else {
        const {data, success} = yield call(getSPProblemByKey, payload);
        if (success) {
          yield put({
            type: 'changeState',
            payload: {
              ...payload,
              problem: data,
              problemResultVisible: true,
            },
          });
        }
      }

    },

    * openDocViewModal({payload}, {select, call, put}) {

      const _payload = {
        ...payload,
        docViewVisible: true,
        problem: {},
      };

      yield put({
        type: 'changeState',
        payload: _payload,
      });
    },

    * getSybs({payload}, {call, put}) {
      const {success, data} = yield call(getSybs, payload);
      if (success && data) {
        yield put({
          type: 'changeState',
          payload: {
            conclusion: data,
          },
        });
      }
    },

    * getFact({payload}, {call, put}) {
      const {success, data} = yield call(getFact, payload);
      if (success && data) {
        yield put({
          type: 'changeState',
          payload: {
            fact: data,
          },
        });
      }
    },

    * getAllProblem({payload}, {call, put}) {
      const {success, data} = yield call(getAllProblem, payload);
      if (success && data) {
        yield put({
          type: 'changeState',
          payload: {
            allProblem: data,
          },
        });
      }
    },
  },

  reducers: {
    changeState(state, action) {
      return {...state, ...action.payload};
    },
    updateQueryKey(state, action) {
      return {...state, ...action.payload};
    },
  },

};
