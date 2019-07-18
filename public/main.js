document.addEventListener("DOMContentLoaded", async () => { "use strict"

const $ = s => document.querySelector(s);
const secure = location.protocol === "https:";
sock.init(`ws${secure?"s":""}://${location.host}/ws`);

sock.on("hello", e => {
  console.log("hello", e);
  sock.send("world", {foo:"bar"});
});

sock.on("yay", e => {
  console.log("yay", e);
});

});
