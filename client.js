const { Socket } = require('net');

const socket = new Socket();
const [, , host, username] = process.argv;

socket.setEncoding('utf8');
socket.connect({
  host,
  port: 8000,
  family: 4
});

socket.on('connect', () => {
  socket.write(JSON.stringify({ username }));
  process.stdin.on('data', data => {
    socket.write(data.toString());
  });
});

socket.on('data', data => {
  process.stdout.write(data);
});
