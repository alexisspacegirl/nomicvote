"use strict"

const http = require("http");
const fs = require("fs");

const Router = require("./lib/router");
const Static = require("./lib/static");
const Socket = require("./lib/socket");

if (!fs.existsSync("./logs")) fs.mkdirSync("./logs");

Math.clamp = Math.clamp || ((x,l,h) => Math.max(l,Math.min(x,h)));
const PORT = Math.clamp(+process.env.PORT||8080, 1, 65535);
const HOST = "0.0.0.0";

const server = http.createServer();
const stat = new Static("./public");
const wss = new Socket(server);
const app = new Router();

function sj(res, data) { // For convenience
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

app.get("/hist.json", (req, res) => sj(res, []));

//app.get("/(?<id>[0-9A-Z]+)", (req, res, path) => {
//  res.setHeader("Content-Type", "text/plain");
//  res.end(path[id]);
//});

//app.gpost("/(?<id>[0-9A-Z]+)/file", (req, res, path, data) => {
//  res.end(data);
//}, 1<<28); // 256MB Max

//app.put("/file/(.+)", (req, res, path) => {
//  req.pipe(fs.createWriteStream("./static/"+path[1]));
//});

wss.on("open", client => {
  console.log(`${Date.now()} SOCK open`);
  client.send("hello", {foo:"bar"});
});

wss.on("close", client => {
  console.log(`${Date.now()} SOCK close`);
});

wss.on("world", (client, data) => {
  console.log(`${Date.now()} SOCK world`, data);
  wss.sendAll("yay", {meh:"woot"});
});

server.on("request", (req, res) => {
  console.log(`${Date.now()} ${req.method} ${req.url}`);
  app.route(req, res) || stat.route(req, res);
});

server.listen(PORT/*, HOST*/);
console.log(`${Date.now()} Running on http://${HOST}:${PORT}`);
