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
      chats += `<div class="${this.id == chat.sender.id ? 'user' : 'sender'} "'>
      <div class="chat-message">
      <span class="info sendername">${chat.sender.username}</span>
      <span>${chat.message}</span><br>
      <span class="info" id="time">${chat.time}</span>
      </div>
      </div>`;
    });
    return chats;
  }

  addMessage(message, sender) {
    this._chats.unshift({
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
