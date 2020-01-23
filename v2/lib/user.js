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
      chats += `<div class='chat-message'>
      ${chat.message}<br>
      <span class="sender user">${chat.sender}</span>
      <span class="sender" id="time"></span>
      </div>`;
    });
    return chats;
  }

  addMessage(message, sender) {
    this._chats.push({
      message,
      sender
    });
  }

  get chats() {
    return this._chats;
  }
}

module.exports = {
  User
};
