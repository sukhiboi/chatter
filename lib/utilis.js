const { readFileSync } = require('fs');

const getContent = function(filename) {
  const content = readFileSync(`./templates${filename}`, 'utf8');
  return content;
};

const generteCookie = function(key, value) {
  return {
    name: key,
    value
  };
};

const getContentType = function(filename) {
  const urlParts = filename.split('.');
  const type = urlParts[urlParts.length - 1];
  return type;
};

const userExists = function(allUsers, username) {
  return allUsers.find(user => user.username === username);
};

const findUser = function(allUsers, userId) {
  return allUsers.find(user => user.id == userId);
};

const removeUser = function(allUsers, cookies) {
  allUsers.forEach(user => {
    if (user.id == cookies.id) {
      const index = allUsers.indexOf(user);
      if (index > -1) {
        allUsers.splice(index, 1);
      }
    }
  });
};

const printRequestLog = function(request, socketDetails) {
  console.log(`${request.method} ${request.path}            ${socketDetails}`);
};

module.exports = {
  getContent,
  generteCookie,
  getContentType,
  userExists,
  findUser,
  removeUser,
  printRequestLog
};