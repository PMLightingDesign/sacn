const Color = require('./color.js');

function fillUniverse(color){
  let dmx = new Uint8ClampedArray(512).fill(64);
  for(let i = 0; i < 510; i+=3){
    let c = color.toArray();
    dmx.set([c[1], c[0], c[2]], i);
  }
  return dmx;
}

// Runs some tests for the sACN socket module
let sACNSocket = require('../socket.sacn.js');

// We really need to test this with the network library

let color = new Color({r:255, g:127, b:0});
console.log(color);
let h = 0;

let sacn = new sACNSocket({
  universes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 41,42,43,44,45,46,46,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74],
  priorities: [100, 100, 100, 100, 100, 100, 100, 100],
  interface: 'auto'
});

function advanceColor(color){
  h++;
  if(h > 360){
    h = 0;
  }
  return Color.fromHSL(h, 1, 0.5);
}

sacn.on('ready', () => {
  console.log("Performing send tests");
  setInterval(() => {
    color = advanceColor(color);
    // console.log(color);
    sacn.set({
      1: fillUniverse(color),
      2: fillUniverse(color),
      3: fillUniverse(color),
      4: fillUniverse(color),
      5: fillUniverse(color),
      6: fillUniverse(color),
      7: fillUniverse(color),
      8: fillUniverse(color),
      9: fillUniverse(color),
      10: fillUniverse(color),
      11: fillUniverse(color),
      41: fillUniverse(color),
      42: fillUniverse(color),
      43: fillUniverse(color),
      44: fillUniverse(color),
      45: fillUniverse(color),
      46: fillUniverse(color),
      47: fillUniverse(color),
      48: fillUniverse(color),
      49: fillUniverse(color),
      50: fillUniverse(color),
      51: fillUniverse(color),
      52: fillUniverse(color),
      53: fillUniverse(color),
      54: fillUniverse(color),
      55: fillUniverse(color),
      56: fillUniverse(color),
      57: fillUniverse(color),
      58: fillUniverse(color),
      59: fillUniverse(color),
      60: fillUniverse(color),
      61: fillUniverse(color),
      62: fillUniverse(color),
      63: fillUniverse(color),
      64: fillUniverse(color),
      65: fillUniverse(color),
      66: fillUniverse(color),
      67: fillUniverse(color),
      68: fillUniverse(color),
      69: fillUniverse(color),
      70: fillUniverse(color),
      71: fillUniverse(color),
      72: fillUniverse(color),
      73: fillUniverse(color),
      74: fillUniverse(color)
    });
    // console.log(sacn.u[1].packet.output.slice(126, 129));
    sacn.send();
  }, 33);
});
