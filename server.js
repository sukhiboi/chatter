const { Server } = require('net');

const server = new Server();
const PORT = 8000;

server.listen(PORT);

server.on('listening', () => {
  const localAddress = server.address().port;
  console.log(`Listening on port ${localAddress}`);
});

const users = {};

server.on('connection', socket => {
  socket.once('data', request => {
    const headers = JSON.parse(request);
    const username = headers.username;
    process.stdout.write(`${username} connected\n`);
    users[username] = {
      socket,
      name: username
    };

    socket.on('close', () => {
      delete users[username];
      console.log(`${username} disconnected`);

      const allUsers = Object.keys(users);
      allUsers.forEach(name => {
        const user = users[name];
        user.socket.write(`\nSERVER> ${username} disconnected\n`);
      });
    });

    socket.on('data', message => {
      const getSender = function() {
        const sender = Object.keys(users).filter(user => {
          return users[user].socket.remotePort == socket.remotePort;
        });
        return sender[0];
      };

      const sender = getSender();
      const allUsers = Object.keys(users);
      allUsers.forEach(name => {
        if (name !== sender) {
          const user = users[name];
          const msg = message.toString();
          user.socket.write(`\n${username}> ${msg}\n`);
        }
      });
    });
  });
});
