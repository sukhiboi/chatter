const { readFileSync } = require('fs');
const { parseRequest, parseCookies } = require('./requestParser');
const { parserQuery } = require('./queryParser');

const USERS = [];

const generateUserId = function() {
  return Math.floor(Math.random() * 100000 + 1);
};

const generteCookie = function(key, value) {
  return `Set-Cookie: ${key}=${value}; SameSite=Strict`;
};

const generateDefaultResponse = (url, method) => {
  const html404 = readFileSync('./templates/404.html', 'utf8');
  const response = [
    'HTTP/1.1 404 File Not Found',
    'Content-Type: text/html',
    `Content-Length: ${html404.length}`,
    '',
    `${html404}`,
    ''
  ].join('\n');
  return {
    status: 404,
    statusMsg: 'File Not Found',
    url,
    method,
    data: response
  };
};

const generateResponse = (content, type, url, method, cookies) => {
  const response = [
    'HTTP/1.1 200 Ok',
    `Content-Type: text/${type}`,
    `Content-Length: ${content.length}`,
    ...cookies,
    ''
  ];
  response.push(content);
  response.push('');
  return {
    status: 200,
    statusMsg: 'OK',
    url,
    method,
    data: response.join('\n')
  };
};

const addNewUser = function(username) {
  if (!username)
    return {
      cookies: []
    };
  const id = generateUserId();
  USERS.push({
    name: username,
    chats: [],
    id
  });
  return {
    cookies: [generteCookie('username', username), generteCookie('id', id)]
  };
};

const addMessages = function(message, sender) {
  if (message) {
    USERS.forEach(user => {
      user.chats.push({
        message,
        sender
      });
    });
  }
};

const handleQuery = function(request) {
  const { username, message } = parserQuery(request.body[0]);
  let html = readFileSync(`./templates${request.path}`, 'utf8');
  const userExists = USERS.find(user => user.name === username);

  if (userExists) {
    const html = readFileSync(`./templates/userExists.html`, 'utf8');
    return generateResponse(html, 'html', request.url, request.method, cookies);
  }

  const { cookies } = addNewUser(username);
  addMessages(message, request.cookies.username);

  const htmlChats = USERS[0].chats.map(
    chat =>
      `<div class='chat-message'>
      ${chat.message}<br>
      <span class="sender user">${chat.sender}</span>
      <span class="sender" id="time"></span>
      </div>`
  );
  html = html.replace('CHAT', htmlChats.join('\n'));

  return generateResponse(html, 'html', request.url, request.method, cookies);
};

const processRequest = function(request) {
  let cookies = [];
  if (request.path === '/') {
    const html = readFileSync('./templates/index.html', 'utf8');
    return generateResponse(html, 'html', request.url, request.method, cookies);
  }
  try {
    const html = readFileSync(`./templates${request.path}`, 'utf8');
    const urlParts = request.path.split('.');
    const type = urlParts[urlParts.length - 1];
    return generateResponse(html, type, request.url, request.method, cookies);
  } catch (err) {
    return generateDefaultResponse(request.url, request.method);
  }
};

module.exports = {
  parseRequest,
  handleQuery,
  processRequest
};
