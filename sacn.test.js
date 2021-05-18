// Runs some tests for the sACN socket module
let sACNSocket = require('./sacn.js');

// We really need to test this with the network library

let sacn = new sACNSocket({
  universes: [1, 2, 4],
  priorities: [100, 100, 100],
  ip: 'auto'
});

sacn.on('ready', () => {
  console.log("Performing send tests");
  setInterval(() => {
    sacn.send();
  }, 25);
});
