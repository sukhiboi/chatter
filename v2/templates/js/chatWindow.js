const parseCookies = function(cookies) {
  const cookieArr = cookies.split('; ');
  const cookieObj = cookieArr.reduce((cookiesObj, cookie) => {
    const [key, value] = cookie.split('=');
    cookiesObj[key] = value;
    return cookiesObj;
  }, {});
  return cookieObj;
};

const cookie = parseCookies(document.cookie);

document.querySelector('.username').innerText = `${cookie.username} `;

Array.from(document.querySelectorAll('#time')).forEach(element => {
  element.innerText = currentTime();
});

const sendGetRequest = function(url, cb) {
  const request = new XMLHttpRequest();
  request.onload = function() {
    cb(this.response);
  };
  request.open('GET', url);
  request.send();
};

const sendPostRequest = function(url, content) {
  const request = new XMLHttpRequest();
  request.open('POST', url);
  request.send(content);
};

const sendMessage = function() {
  const message = document.querySelector('.message-bar').value;
  const content = `message=${message}`;
  sendPostRequest('chatWindow.html', content);
  document.querySelector('.message-bar').value = '';
};

setInterval(() => {
  const chatWindow = document.querySelector('.window');
  sendGetRequest('chats', response => {
    if (response == 'USER NOT FOUND') {
      document.body.innerHTML = response;
    }
    chatWindow.innerHTML = response;
  });
}, 1000);

document.body.addEventListener('keydown', () => {
  if (event.key == 'Enter') {
    sendMessage();
  }
});

window.addEventListener('beforeunload', () => {
  event.preventDefault();
  sendPostRequest('close', 'user-state=disconnected');
});
