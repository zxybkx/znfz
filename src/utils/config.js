module.exports = {
  name: '统一权限管理系统',
  layoutConfig: {
    '/passport' : 'user',
    '/passport/sign-in' : 'user',
    '/passport/chose-portal': 'user',
    '/passport/RegisterResult': 'user',
    '/currencydeal.*': 'blank',
    '/xdeal.*': 'blank',
    '/spdeal.*': 'blank',
    '/znfz/view.*': 'blank',
    '/znfz/ocr': 'blank',
  },
};
