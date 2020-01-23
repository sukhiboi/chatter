const { readFileSync } = require('fs');

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
  const query = request.details.query;
  const username = query.username,
    message = query.message;
  let html = readFileSync(`./templates${request.details.path}`, 'utf8');
  const userExists = USERS.find(user => user.name === username);

  if (userExists) {
    const html = readFileSync(`./templates/userExists.html`, 'utf8');
    return generateResponse(
      html,
      'html',
      request.details.path,
      request.details.method,
      cookies
    );
  }

  const { cookies } = addNewUser(username);
  addMessages(message, request.details.cookies.username);

  const htmlChats = USERS[0].chats.map(
    chat =>
      `<div class='chat-message'>
      ${chat.message}<br>
      <span class="sender user">${chat.sender}</span>
      <span class="sender" id="time"></span>
      </div>`
  );
  html = html.replace('CHAT', htmlChats.join('\n'));

  return generateResponse(
    html,
    'html',
    request.details.path,
    request.details.method,
    cookies
  );
};

const processRequest = function(request) {
  let cookies = [];
  if (request.details.path === '/') {
    const html = readFileSync('./templates/index.html', 'utf8');
    return generateResponse(
      html,
      'html',
      request.details.path,
      request.details.method,
      cookies
    );
  }
  try {
    const html = readFileSync(`./templates${request.details.path}`, 'utf8');
    const urlParts = request.details.path.split('.');
    const type = urlParts[urlParts.length - 1];
    return generateResponse(
      html,
      type,
      request.details.path,
      request.details.method,
      cookies
    );
  } catch (err) {
    return generateDefaultResponse(
      request.details.path,
      request.details.method
    );
  }
};

module.exports = {
  handleQuery,
  processRequest
};
