const { readFileSync } = require('fs');

const getContent = function (filename) {
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

module.exports = {
  getContent,
  generteCookie,
  getContentType,
  userExists
};
