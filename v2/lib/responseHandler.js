const { Response } = require('./response');
const { Request } = require('./request');
const { User } = require('./user');
const {
  getContent,
  generteCookie,
  getContentType,
  userExists,
  findUser,
  userExistsWithID
} = require('./utilis');

const USERS = [];

const generateDefaultResponse = () => {
  const html404 = getContent('/404.html');
  const response = new Response(404, html404);
  return response.asString;
};

const generateResponse = (content, type, cookies) => {
  const response = new Response(200, content);
  cookies.forEach(cookie => response.addCookie(cookie));
  response.addHeader('Content-Type', `text/${type}`);
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
  let cookies = [];
  if (request.details.path === '/') {
    const html = getContent('/index.html');
    getContent('/index.html');
    return generateResponse(html, 'html', cookies);
  }
  try {
    const html = getContent(request.details.path);
    const type = getContentType(request.details.path);
    return generateResponse(html, type, cookies);
  } catch (err) {
    return generateDefaultResponse();
  }
};

const handleRequest = function(requestText, socketDetails) {
  const request = Request.parse(requestText);
  console.log(`${request.method} ${request.path}            ${socketDetails}`);
  if (request.path == '/chats') {
    if (userExistsWithID(USERS, request.cookies.id)) {
      return sendChats(request.cookies);
    }
    return generateResponse('USER NOT FOUND', 'plain', []);
  }
  const query = request.details.query;
  const isObjectEmpty = Object.entries(query).length === 0;
  if (isObjectEmpty) return processRequest(request);
  return handleQuery(request);
};

module.exports = {
  handleRequest
};
