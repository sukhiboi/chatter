const { readFileSync } = require('fs');
const { Response } = require('./response');

const USERS = [];

const getContent = function(filename) {
  const content = readFileSync(`./templates${filename}`, 'utf8');
  return content;
};

const generateUserId = function() {
  return Math.floor(Math.random() * 100000 + 1);
};

const generteCookie = function(key, value) {
  return {
    name: key,
    value
  };
};

const generateDefaultResponse = () => {
  const html404 = readFileSync('./templates/404.html', 'utf8');
  const response = new Response(404, html404);
  return response.asString;
};

const generateResponse = (content, type, cookies) => {
  const response = new Response(200, content);
  cookies.forEach(cookie => response.addCookie(cookie));
  response.addHeader('Content-Type', `text/${type}`);
  return response.asString;
};

const getContentType = function(filename) {
  const urlParts = filename.split('.');
  const type = urlParts[urlParts.length - 1];
  return type;
};

const userExists = function(username) {
  return USERS.find(user => user.name === username);
};

const addNewUser = function(username, id) {
  USERS.push({
    name: username,
    chats: [],
    id
  });
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

const getAllChats = function(username) {
  const chats = username.chats.map(
    chat =>
      `<div class='chat-message'>
      ${chat.message}<br>
      <span class="sender user">${chat.sender}</span>
      <span class="sender" id="time"></span>
      </div>`
  );
  return chats;
};

const updateChats = function(html, chats) {
  html = html.replace('CHAT', chats.join('\n'));
  return html;
};

const handleQuery = function(request) {
  const query = request.details.query;
  const newUsername = query.username;
  const message = query.message;

  let html = getContent(request.details.path);

  if (userExists()) {
    const html = getContent('/userExists.html');
    return generateResponse(html, 'html', []);
  }

  if (newUsername) {
    const userID = generateUserId();
    addNewUser(newUsername, userID);
    const cookies = [
      generteCookie('username', newUsername),
      generteCookie('id', userID)
    ];
    return generateResponse(html, 'html', cookies);
  }

  const cookies = request.details.cookies;
  const chats = getAllChats(USERS[0]);

  addMessages(message, cookies.username);
  html = updateChats(html, chats);

  return generateResponse(html, 'html', []);
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

const handleRequest = function(request) {
  const query = request.details.query;
  const isObjectEmpty = Object.entries(query).length === 0;
  if (isObjectEmpty) return processRequest(request);
  return handleQuery(request);
};

module.exports = {
  handleRequest
};
