const crypto = require('crypto');

function md5(...rest) {
  const md5 = crypto.createHash('md5');

  let str = '';

  for (let item of rest) {
    str = `${str}${item}`;
  }
  return md5.update(str).digest('hex');
}

module.exports = {
  md5
};
