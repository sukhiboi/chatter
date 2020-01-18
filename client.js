const { Socket } = require('net');

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const socket = new Socket();
const [, , host, username] = process.argv;
console.clear();

rl.setPrompt(`${username}> `);

socket.setEncoding('utf8');
socket.connect({
  host,
  port: 8000,
  family: 4
});

socket.on('connect', () => {
  socket.write(JSON.stringify({ username }));
  process.stdout.write('Connected to server');
  rl.prompt();
  rl.on('line', data => {
    socket.write(data.toString());
    rl.prompt();
  });
});

socket.on('data', data => {
  process.stdout.write(data);
  rl.prompt();
});
