const { readFileSync } = require('fs');

const parseRequest = function(request) {
  const [req, ...headerAndBody] = request.split('\n');
  const [method, path, protocol] = req.split(' ');
  const { headers, body } = seprateHeadersAndBody(headerAndBody);
  return {
    method,
    path,
    protocol,
    headers,
    body
  };
};

const seprateHeadersAndBody = function(headerAndBody) {
  const bodyIndex = headerAndBody.findIndex(text => text === '\r');
  const headers = headerAndBody.slice(0, bodyIndex);
  const body = headerAndBody.slice(bodyIndex + 1);
  return { headers, body };
};

const generateDefaultResponse = () => {
  const html404 = readFileSync('./templates/404.html', 'utf8');
  return [
    'HTTP/1.1 404 File Not Found',
    'Content-Type: text/html',
    `Content-Length: ${html404.length}`,
    '',
    `${html404}`,
    ''
  ].join('\n');
};

const generateResponse = (content, type) => {
  const response = [
    'HTTP/1.1 200 Ok',
    `Content-Type: text/${type}`,
    `Content-Length: ${content.length}`,
    ''
  ];
  response.push(content);
  response.push('');
  return response.join('\n');
};

const handleQuery = function(request) {
  const queryText = request.path;
  const info = queryText.split('?')[1];
  const pairs = info.split('&');
  const query = {};
  pairs.forEach(pair => {
    const [key, value] = pair.split('=');
    query[key] = value;
  });
  let html = readFileSync('./templates/chatWindow.html', 'utf8');
  html = html.replace('user', query.username);
  return generateResponse(html, 'html');
};

const processRequest = function(request) {
  if (request.path === '/') {
    const content = readFileSync('./templates/index.html', 'utf8');
    return generateResponse(content, 'html');
  }
  try {
    const content = readFileSync(`./templates${request.path}`, 'utf8');
    const urlParts = request.path.split('.');
    const type = urlParts[urlParts.length - 1];
    return generateResponse(content, type);
  } catch (err) {
    return generateDefaultResponse();
  }
};

module.exports = {
  parseRequest,
  handleQuery,
  processRequest
};