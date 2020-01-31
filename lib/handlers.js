const querystring = require('querystring');
const { readFileSync, existsSync, statSync } = require('fs');
const { Users } = require('./users');
const mimeTypes = require('./mimeTypes');

const users = new Users();

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

const registerUser = function(req, res, next) {
  const { username } = req.body;
  const userID = users.addUser(username);
  const filename = `${__dirname}/../templates/chatWindow.html`;
  if (!fileExists(filename)) {
    next();
    return;
  }
  const content = readFileSync(filename);
  const extension = filename.match(/.+\.(.*)/)[1];
  res.setHeader('Content-Type', mimeTypes[extension]);
  res.setHeader('Set-Cookie', [`username=${username}`, `id=${userID}`]);
  res.end(content);
};

const sendChats = function(req, res) {
  const cookieString = req.headers.cookie.replace('; ', '&');
  const cookies = querystring.parse(cookieString);
  const user = users.findUserWithID(cookies.id);
  if (user) {
    res.end(user.htmlChat);
  }
  res.end('USER NOT FOUND');
};

const addMessage = function(req, res) {
  const cookieString = req.headers.cookie.replace('; ', '&');
  const cookies = querystring.parse(cookieString);
  users.users.forEach(user =>
    user.addMessage(req.body.message, cookies.username)
  );
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
  sendChats,
  addMessage,
  notFound
};
