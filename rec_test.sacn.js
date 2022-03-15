// Runs some tests for the sACN socket module
let sACNReceiver = require('./receiver.sacn.js');

// We really need to test this with the network library

let sacn = new sACNReceiver();

sacn.on('universe-1', (data) => {
  console.log(data);
});
