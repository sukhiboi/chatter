const currentTime = function() {
  const date = new Date();
  const formatTime = function(time) {
    return time.toString().padStart(2, '0');
  };
  const hours = formatTime(date.getHours());
  const minutes = formatTime(date.getMinutes());
  return `${hours}:${minutes}`;
};

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

document.querySelector('.user').innerText = `${cookie.username} `;

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

const sendPostRequest = function(url, content, cb) {
  const request = new XMLHttpRequest();
  request.onload = function() {
    cb(this.response);
  };
  request.open('POST', url);
  request.send(content);
};

setInterval(() => {
  sendGetRequest('chats', response => {
    console.log(response);
  });
}, 1000);
