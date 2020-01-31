const { Server } = require('http');
const handlers = require('./lib/handlers');
const { bodyParser } = require('./lib/middlewares');
const { App } = require('./lib/app');
const app = new App();

app.use(bodyParser);
app.get('/', handlers.serveStaticPage);
app.get('/chats', handlers.sendChats);

app.post('/message', handlers.addMessage);
app.post('/', handlers.registerUser);

app.get('', handlers.notFound);

const server = new Server(app.serve.bind(app));
const PORT = 8000;

server.listen(process.argv[2] || PORT);
