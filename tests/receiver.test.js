const sACNReceiver = require('../receiver.sacn.js');

let sacn = new sACNReceiver({
  interface: '0.0.0.0',
  universes: [ 11, 12, 13, 4 ]
});


sacn.on('universe-11', (data) => {
  console.log(data.slice(0,3));
});


setInterval(() => {
  // console.log(sacn.data);
}, 500);