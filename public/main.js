document.addEventListener("DOMContentLoaded", async () => { "use strict"

const $ = s => document.querySelector(s);
const secure = location.protocol === "https:";
const sock = new WebSocket(`ws${secure?"s":""}://${location.host}/ws`);

sock.onmessage = e => console.log("sock", e);
sock.onopen = () => sock.send("yay");

});
