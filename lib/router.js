"use strict" // https://github.com/mixu/minimal

const url = require("url");
const degroup = path => Object.assign(path, path.groups);

class Router {
  constructor() {
    this.routes = [];
  }

  route(req, res) {
    const pathname = url.parse(req.url).pathname;
    return this.routes.some(route => {
      const isMatch = route.method === req.method && route.re.test(pathname);
      if (isMatch) route.cb(req, res, degroup(route.re.exec(pathname)));
      return isMatch;
    });
  }

  gather(cb, max) { // Handle POST data
    return (req, res, match) => {
      let data = "";
      req.on("data", chunk => {
        if ((data += chunk).length > (max||1e6)) // ~1MB
          req.connection.destroy();
      }).on("end", () => cb(req, res, match, data));
    };
  }

  gpost(re, cb, max) { // Laziness
    this.post(re, this.gather(cb, max));
  }
}

["get", "post", "put", "delete"].forEach(method =>
  Router.prototype[method] = function(re, cb) {
    this.routes.push({method: method.toUpperCase(), cb,
      re: (re instanceof RegExp)? re : new RegExp(`^${re}$`)})});

module.exports = Router;
