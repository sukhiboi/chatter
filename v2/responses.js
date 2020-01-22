const { readFileSync } = require('fs');
const { parseRequest } = require('./requestParser');
const { parserQuery } = require('./queryParser');

const USERS = [];

const generateUserId = function() {
  return Math.floor(Math.random() * 100000 + 1);
};

const generteCookie = function(key, value) {
  return `Set-Cookie: ${key}=${value}; SameSite=Strict;Secure; HttpOnly`;
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

const generateResponse = (content, type, url, method) => {
  const response = [
    'HTTP/1.1 200 Ok',
    `Content-Type: text/${type}`,
    `Content-Length: ${content.length}`,
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
  USERS.push({
    name: username,
    chats: [],
    id: generateUserId()
  });
};

const currentTime = function() {
  const date = new Date();
  const formatTime = function(time) {
    return time.toString().padStart(2, '0');
  };
  const hours = formatTime(date.getHours());
  const minutes = formatTime(date.getMinutes());
  return `${hours}:${minutes}`;
};

const handleQuery = function(request) {
  const { username, message } = parserQuery(request.body[0]);
  let html = readFileSync(`./templates${request.path}`, 'utf8');
  const userExists = USERS.find(user => user.name === username);

  if (!userExists) {
    addNewUser(username);
  }
  if (message) {
    USERS.forEach(user => {
      user.chats.push({
        message,
        sender: username
      });
    });
  }

  const htmlChats = USERS[0].chats.map(
    chat =>
      `<div class='chat-message'>${chat.message}<br><span class="sender">~ ${
        chat.sender
      } ${currentTime()}</span></div>`
  );

  html = html.replace('user', username);
  html = html.replace('"user"', `"${username}"`);
  html = html.replace('CHAT', htmlChats.join('\n'));

  return generateResponse(html, 'html', request.url, request.method);
};

const processRequest = function(request) {
  if (request.path === '/') {
    const content = readFileSync('./templates/index.html', 'utf8');
    return generateResponse(content, 'html', request.url, request.method);
  }
  try {
    const content = readFileSync(`./templates${request.path}`, 'utf8');
    const urlParts = request.path.split('.');
    const type = urlParts[urlParts.length - 1];
    return generateResponse(content, type, request.url, request.method);
  } catch (err) {
    return generateDefaultResponse(request.url, request.method);
  }
};

module.exports = {
  handleQuery,
  processRequest
};
