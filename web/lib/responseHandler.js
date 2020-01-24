const { Response } = require('./response');
const { Request } = require('./request');
const { User } = require('./user');
const {
  getContent,
  generteCookie,
  getContentType,
  userExists,
  findUser,
  removeUser,
  printRequestLog
} = require('./utilis');
const mimeTypes = require('./mimeTypes');

const USERS = [];

const generateDefaultResponse = () => {
  const html404 = getContent('/404.html');
  const response = new Response(404, html404);
  return response.asString;
};

const generateResponse = (content, type, cookies) => {
  const response = new Response(200, content);
  cookies.forEach(cookie => response.addCookie(cookie));
  response.addHeader('Content-Type', mimeTypes[type]);
  return response.asString;
};

const addUser = function(username, html) {
  if (userExists(USERS, username)) {
    const html = getContent('/userExists.html');
    return generateResponse(html, 'html', []);
  }
  const userID = User.generateUserId();
  USERS.push(new User(username, userID));
  const cookies = [
    generteCookie('username', username),
    generteCookie('id', userID)
  ];
  return generateResponse(html, 'html', cookies);
};

const sendChats = function(cookies) {
  const user = findUser(USERS, cookies.id);
  return generateResponse(user.htmlChat, 'plain', []);
};

const handleQuery = function(request) {
  const query = request.details.query;
  const username = query.username;
  let html = getContent(request.details.path);

  if (username) {
    const response = addUser(username, html);
    return response;
  }

  const message = query.message;
  const cookies = request.details.cookies;

  USERS.forEach(user => user.addMessage(message, cookies));
  const updatedHTML = html.replace('CHAT', USERS[0].htmlChat);

  return generateResponse(updatedHTML, 'html', []);
};

const processRequest = function(request) {
  const date = new Date();
  date.setTime(date.getTime() + 2000);
  if (request.details.path === '/') {
    const html = getContent('/index.html');
    return generateResponse(html, 'html', [
      generteCookie('username', `null; Expires=${date.toUTCString()}`),
      generteCookie('id', `null; Expires=${date.toUTCString()}`)
    ]);
  }
  try {
    const html = getContent(request.details.path);
    const type = getContentType(request.details.path);
    return generateResponse(html, type, []);
  } catch (err) {
    return generateDefaultResponse();
  }
};

const chatHandler = function(cookies) {
  if (findUser(USERS, cookies.id)) {
    return sendChats(cookies);
  }
  const html = "USER NOT FOUND";
  const type = mimeTypes['txt'];
  return generateResponse(html, type, []);
};

const logoutHandler = function(cookies) {
  removeUser(USERS, cookies);
  const html = getContent('/index.html');
  return generateResponse(html, 'html', []);
};

const handleRequest = function (requestText, socketDetails) {
  const request = Request.parse(requestText);
  printRequestLog(request, socketDetails);
  if (request.path == '/chats') return chatHandler(request.cookies);
  if (request.path == '/close') return logoutHandler(request.cookies);

  const query = request.details.query;
  const isObjectEmpty = Object.entries(query).length === 0;
  if (isObjectEmpty) return processRequest(request);
  return handleQuery(request);
};

module.exports = {
  handleRequest
};
