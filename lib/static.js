"use strict"

const Path = require("path");
const url = require("url");
const fs = require("fs");

const mimeTypes = {
  ".html": "text/html",
  ".css":  "text/css",
  ".js":   "text/javascript",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".pdf":  "application/pdf",
  ".txt":  "text/plain",
  ".md":   "text/markdown",

  ".png":  "image/png",
  ".jpg":  "image/jpg",
  ".svg":  "image/svg+xml",
  ".gif":  "image/gif",
  ".ico":  "image/x-icon",

  ".wav":  "audio/wav",
  ".mp3":  "audio/mpeg",
  ".mp4":  "video/mp4",

  ".eot":  "application/vnd.ms-fontobject",
  ".ttf":  "application/font-ttf",
  ".woff": "application/font-woff",
};

module.exports = class Static {
  constructor(root) {
    this.root = `${root||"."}`;
    this.e404 = fs.readFileSync(`${this.root}/404.html`);
    this.e500 = fs.readFileSync(`${this.root}/500.html`);
  }

  route(req, res) {
    if (req.method !== "GET") {
      res.writeHead(405, {"Content-Type": "text/plain"});
      res.end("405 Method Not Allowed");
      return;
    }

    const pathname = url.parse(req.url).pathname;
    const sane = Path.normalize(pathname).replace(/^(\.\.\/)+/, "");
    let path = `${this.root}${sane}`; //Path.join(__dirname, sane);

    fs.stat(path, (err, stats) => {
      if (err) { if (["EACCES", "ENOENT", "EPERM"].includes(err.code)) {
        res.writeHead(404, {"Content-Type": "text/html"});
        return res.end(this.e404);
      } else { console.log(err);
        res.writeHead(500, {"Content-Type": "text/html"});
        return res.end(this.e500);
      }}

      if (stats.isDirectory()) path += "/index.html";
      const ext = `${Path.extname(path)}`.toLowerCase();
      const stream = fs.createReadStream(path);

      stream.on("error", e => { console.log(e);
        res.writeHead(500, {"Content-Type": "text/html"});
        //res.end(`<pre>Error getting the file: ${e}</pre>`);
        res.end(this.e500);
      });

      res.setHeader("Content-Type", mimeTypes[ext]||"application/octet-stream");
      // TODO Caching?

      stream.pipe(res);
    });
  }
};
