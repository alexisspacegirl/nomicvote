const sock = (() => { "use strict"
const refresh = () => setTimeout(() => location.reload(), 1e3);

let ws, pingTimeout;
const prequeue = [];
const handlers = {
  "reset": [refresh],
  "ping": [() => {
    clearTimeout(pingTimeout);
    pingTimeout = setTimeout(refresh, 3e4);
    sock.send("pong", {});
  }],
};

const sock = {
  init: url => {
    ws = new WebSocket(url);
    ws.addEventListener("close", refresh);
    ws.addEventListener("error", refresh);
    ws.addEventListener("message", e => {
      const d = JSON.parse(e.data);
      (handlers[d.type]||[]).forEach(cb => cb(d.data));
    });
    ws.addEventListener("open", e => {
      while (prequeue.length) sock.send(...prequeue.shift());
      (handlers["open"]||[]).forEach(cb => cb());
      delete handlers["open"];
    });
  },

  on: (type, cb) => {
    if (type === "open" && ws && ws.readyState === WebSocket.OPEN) cb();
    else (handlers[type]||(handlers[type]=[])).push(cb);
  },

  send: (type, data) => {
    if (ws && ws.readyState === WebSocket.OPEN)
      ws.send(JSON.stringify({type, data}));
    else prequeue.push([type, data]);
  },
};

return sock })();
