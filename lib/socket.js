"use strict"

const WebSocket = require("ws");

class Client {
  constructor(ws) {
    this.ws = ws;
    this.handlers = {};

    ws.on("message", msg => { const d = JSON.parse(msg);
      (this.handlers[d.type]||[]).forEach(cb => cb(d.data));
    });

    const closecb = () =>
      (this.handlers["close"]||[]).forEach(cb => cb());

    ws.on("close", closecb);
    ws.on("error", closecb);
  }

  on(type, cb) {
    (this.handlers[type]||(this.handlers[type]=[])).push(cb);
  }

  send(type, data) {
    this.ws.send(JSON.stringify({type, data}));
  }
}

module.exports = class Socket {
  constructor(server) {
    this.wss = new WebSocket.Server({server});
    this.handlers = {};
    this.clients = [];

    this.wss.on("connection", ws => {
      const client = new Client(ws);
      this.clients.push(client);

      ws.on("message", msg => { const d = JSON.parse(msg);
        (this.handlers[d.type]||[]).forEach(cb => cb(client, d.data));
      });

      let pingTimeout;
      const ping = () => { client.send("ping", {});
        pingTimeout = setTimeout(() => ws.terminate(), 3e4); };
      client.on("pong", () => { clearTimeout(pingTimeout);
        setTimeout(ping, 1e3); }); ping();

      const closecb = () => {
        const i = this.clients.indexOf(client); if (i < 0) return;
        (this.handlers["close"]||[]).forEach(cb => cb(client));
        this.clients.splice(i, 1);
      }

      ws.on("close", closecb);
      ws.on("error", closecb);

      (this.handlers["open"]||[]).forEach(cb => cb(client));
    });
  }

  on(type, cb) {
    (this.handlers[type]||(this.handlers[type]=[])).push(cb);
  }

  sendAll(type, data) {
    this.clients.forEach(c => c.send(type, data));
  }
};
