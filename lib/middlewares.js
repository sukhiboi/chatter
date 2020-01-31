const queryString = require('querystring');

const bodyParser = function (req, res, next) {
  let content = '';
  req.on('data', data => {
    content += data;
  });
  req.on('end', () => {
    req.body = queryString.parse(content);
    next();
  });
};

module.exports = {
  bodyParser
};
