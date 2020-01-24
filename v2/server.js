const { Server } = require('net');
const { handleRequest } = require('./lib/responseHandler');

const server = new Server();
const PORT = 8000;

server.listen(process.argv[2] || PORT);

server.on('listening', () => {
  const { address, family, port } = server.address();
  console.clear();
  console.log(`\nListening on port ${address}:${port} with ${family}\n`);
});

server.on('connection', socket => {
  socket.setEncoding('utf8');
  socket.on('data', data => {
    const socketDetails = `${socket.remoteAddress}:${socket.remotePort} using ${socket.remoteFamily}`;
    const response = handleRequest(data, socketDetails);
    socket.write(response);
    socket.end();
  });
});
