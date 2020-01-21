const { readFileSync } = require('fs');

const USERS = [];

const parseRequest = function(request, address, port) {
  const [req, ...headerAndBody] = request.split('\n');
  const [method, path, protocol] = req.split(' ');
  const { headers, body } = seprateHeadersAndBody(headerAndBody);
  return {
    url: `${address}${path}`,
    method,
    path,
    protocol,
    headers,
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

const addNewUser = function(username, port) {
  USERS.push({
    name: username,
    chats: [],
    port
  });
};

const parseQueryValue = function(value) {
  return value.split('+').join(' ');
};

const parserQuery = function(queryText) {
  const info = queryText.split('?');
  const pairs = info[1].split('&');
  const query = {};

  pairs.forEach(pair => {
    const [key, value] = pair.split('=');
    query[key] = value;
  });

  query['filePath'] = info[0];
  return query;
};

const handleQuery = function(request) {
  const { username, message, filePath } = parserQuery(request.path);
  let html = readFileSync(`./templates${filePath}`, 'utf8');

  if (username) {
    const user = parseQueryValue(username);
    addNewUser(user, request.port);
  }
  if (message) {
    const msg = parseQueryValue(message);
    USERS[0].chats.push(msg);
  }

  const user = USERS[0];
  const htmlChats = user.chats.map(
    chat => `<div class='chat-message'>${chat}</div>`
  );

  html = html.replace('user', user.name);
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
