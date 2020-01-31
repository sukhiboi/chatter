const getMatchingRoutes = function(req, route) {
  if (!route.path) return true;
  const pathEquality = req.url == route.path || req.url.match(route.path);
  const methodEquality = req.method === route.method;
  return methodEquality && pathEquality;
};

class App {
  constructor() {
    this.routes = [];
  }
  get(path, handler) {
    this.routes.push({ path, handler, method: 'GET' });
  }
  post(path, handler) {
    this.routes.push({ path, handler, method: 'POST' });
  }
  use(middleware) {
    this.routes.push({ handler: middleware });
  }
  serve(req, res) {
    const matchingRoutes = this.routes.filter(route =>
      getMatchingRoutes(req, route)
    );
    const next = function() {
      const route = matchingRoutes.shift();
      route.handler(req, res, next);
    };
    next();
  }
}

module.exports = {
  App
};
