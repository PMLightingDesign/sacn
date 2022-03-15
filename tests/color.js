// Runs some tests for the sACN socket module
let sACNSocket = require('../socket.sacn.js');

let sacn = new sACNSocket({
  universes: [10, 21, 22, 23, 31],
  priorities: [100, 100, 100],
  interface: 'auto'
});

let color = new Uint8Array(512);

for(let i = 2; i < color.length; i+=4){
  color[i] = 127;
}

let relays = new Uint8Array(512);
relays[2] = 255;
relays[5] = 255;

let neon = new Uint8Array(512).fill(127);

sacn.set({
  10: neon,
  21: color,
  22: color,
  23: color,
  31: relays
});

sacn.on('ready', () => {
  console.log("Performing send tests");
  setInterval(() => {
    sacn.send();
  }, 33);
});
