const config = require('./config');

const Config = {
  get: function(key){
    if (key !== '/') {
      var newkey = key.replace(/\/+/g, '/');
      newkey = newkey.replace(/^\//i, '');
      newkey = newkey.replace(/\/$/, '');
      var keys = newkey.split('/');
      var value = keys.reduce(function (json, k) {
        return json[k];
      }, config.config);
      return value;
    }
    return '';
  },
};

module.exports = Config;
