const currentTime = function() {
  const date = new Date();
  const formatTime = function(time) {
    return time.toString().padStart(2, '0');
  };
  const hours = formatTime(date.getHours());
  const minutes = formatTime(date.getMinutes());
  return `${hours}:${minutes}`;
};

class User {
  constructor(username, id) {
    this.username = username;
    this._chats = [];
    this.id = id;
  }

  static generateUserId() {
    return Math.floor(Math.random() * 100000 + 1);
  }

  get htmlChat() {
    let chats = '';
    this._chats.forEach(chat => {
      chats += `<div class="${
        this.username == chat.sender ? 'user' : 'sender'
      } "'>
      <div class="chat-message">
      <span>${chat.message}</span><br>
      <span class="info">${chat.sender}</span>
      <span class="info" id="time">${chat.time}</span>
      </div>
      </div>`;
    });
    return chats;
  }

  addMessage(message, sender, time) {
    this._chats.push({
      message,
      sender,
      time: currentTime()
    });
  }

  get chats() {
    return this._chats;
  }
}

module.exports = {
  User
};
