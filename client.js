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
  process.stdin.on('data', data => {
    const request = {
      user: username,
      message: data.toString()
    };
    socket.write(JSON.stringify(request));
  });
});
