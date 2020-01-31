const { Server } = require('http');
const { serveStaticPage, notFound, registerUser } = require('./lib/handlers');
const { bodyParser } = require('./lib/middlewares');
const { App } = require('./lib/app');
const app = new App();

app.use(bodyParser);
app.get('/', serveStaticPage);
app.post('/', registerUser);
app.get('', notFound);


const server = new Server(app.serve.bind(app));
const PORT = 8000;

server.listen(process.argv[2] || PORT);
