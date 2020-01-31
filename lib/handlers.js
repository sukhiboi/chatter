const { readFileSync, existsSync, statSync } = require('fs');
const mimeTypes = require('./mimeTypes');

const fileExists = function(filename) {
  const stat = existsSync(filename) && statSync(filename);
  return stat && stat.isFile();
};

const notFound = function(req, res) {
  const filename = `${__dirname}/../templates/404.html`;
  const content = readFileSync(filename);
  const extension = filename.match(/.+\.(.*)/)[1];
  res.setHeader('Content-Type', mimeTypes[extension]);
  res.end(content);
};

const registerUser = function(req, res) {
  res.end(JSON.stringify(req.body));
};

const serveStaticPage = function(req, res, next) {
  let path = req.url;
  if (path == '/') path = '/index.html';
  const filename = `${__dirname}/../templates${path}`;
  if (!fileExists(filename)) {
    next();
    return;
  }
  const content = readFileSync(filename);
  const extension = filename.match(/.+\.(.*)/)[1];
  res.setHeader('Content-Type', mimeTypes[extension]);
  res.end(content);
};

module.exports = {
  serveStaticPage,
  registerUser,
  notFound
};
