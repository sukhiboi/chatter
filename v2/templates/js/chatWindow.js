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
