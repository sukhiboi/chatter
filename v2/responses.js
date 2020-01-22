const { readFileSync } = require('fs');

const USERS = [];

const parseRequest = function(request, address, port) {
  const [req, ...headerAndBody] = request.split('\n');
  const [method, path, protocol] = req.split(' ');
  const { headers, body } = seprateHeadersAndBody(headerAndBody);
  const headersObj = {};
  headers.forEach(header => {
    const headerParts = header.split(': ');
    const headerName = headerParts[0];
    const headerValue = headerParts[1].replace('\r', '');

    headersObj[headerName] = headerValue;
  });
  return {
    url: `${address}${path}`,
    method,
    path,
    protocol,
    headersObj,
    body,
    port,
    host: address
  };
};

const seprateHeadersAndBody = function(headerAndBody) {
  const bodyIndex = headerAndBody.findIndex(text => text === '\r');
  const headers = headerAndBody.slice(0, bodyIndex);
  const body = headerAndBody.slice(bodyIndex + 1);
  return { headers, body };
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
    chats: []
  });
};

const parseQueryValue = function(value) {
  return value.split('+').join(' ');
};

const parserQuery = function(queryText) {
  const info = queryText.split('?');
  const pairs = info[0].split('&');
  const query = {};

  pairs.forEach(pair => {
    const [key, value] = pair.split('=');
    query[key] = parseQueryValue(value);
  });
  return query;
};

const getCurrentTime = function() {
  const date = new Date();
  const hours = date
    .getHours()
    .toString()
    .padStart(2, '0');
  const minutes = date
    .getMinutes()
    .toString()
    .padStart(2, '0');
  return `${hours}:${minutes}`;
};

const handleQuery = function(request) {
  const { username, message } = parserQuery(request.body[0]);
  let html = readFileSync(`./templates${request.path}`, 'utf8');

  if (!USERS.find(user => user.name === username)) {
    const user = parseQueryValue(username);
    addNewUser(user);
  }
  if (message) {
    const msg = parseQueryValue(message);
    USERS.forEach(user => {
      user.chats.push({
        msg,
        sender: username
      });
    });
  }

  const user = USERS[0];
  const currentTime = getCurrentTime();
  const htmlChats = user.chats.map(
    chat =>
      `<div class='chat-message'>${chat.msg}<br><span class="sender">~ ${chat.sender} ${currentTime}</span></div>`
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
  parseRequest,
  handleQuery,
  processRequest
};
