class Users {
  constructor() {
    this.users = [];
  }
  findUserWithID(id) {
    return this.users.find(user => user.id === id);
  }
  findUserWithName(name) {
    return this.users.find(user => user.name === name);
  }
  addUser(user) {
    this.users.push(user);
  }
  deleteUser(givenUser) {
    this.users.find((user, index) => {
      if (user.id === givenUser.id) {
        this.users(index, 1);
      }
    });
  }
}

module.exports = {
  Users
};
