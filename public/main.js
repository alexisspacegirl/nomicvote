document.addEventListener("DOMContentLoaded", async () => { "use strict"

const $ = s => document.querySelector(s);
const sock = new WebSocket(`ws://${location.host}/ws`);

sock.onmessage = e => console.log("sock", e);
sock.onopen = () => sock.send("yay");

});
