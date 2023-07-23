// Runs some tests for the sACN socket module
let sACNSocket = require('../socket.sacn.js');
const color = require('./color');
const readline = require('readline');

function fillUniverse(color){
    let dmx = new Uint8ClampedArray(512).fill(64);
    for(let i = 0; i < 510; i+=3){
        let c = color.toArray();
        dmx.set([c[1], c[0], c[2]], i);
    }
    return dmx;
}

let colors = [
    [255, 0, 0],
    [255, 255, 0],
    [0, 255, 0],
    [0, 255, 255],
    [0, 0, 255],
    [255, 0, 255]
]

let dmx = new Uint8ClampedArray(512);
let dmxZero = new Uint8ClampedArray(512).fill(0);

let x = 0;
for(let i = 0; i < 510; i+=3){
    let c = colors[x % colors.length];
    dmx.set([c[0], c[1], c[2]], i);
    x++;
}

let selected = 0;

let universeCount = 32;

// Create an array of universes
let universes = [];
let priorities = [];

for(let i = 0; i < universeCount; i++){
  universes.push(i+1);
  priorities.push(100);
}

let sacn = new sACNSocket({
  universes: universes,
  priorities: priorities,
  interface: 'auto'
});

sacn.on('ready', () => {
    console.log("Sending");
    setInterval(() => {
        let setObject = {};

        for(let i = 0; i < universeCount; i++){
            setObject[i+1] = dmxZero;
        }

        setObject[selected+1] = dmx;

        sacn.set(setObject);
        // console.log(sacn.u[1].packet.output.slice(126, 129));
        sacn.send();
    }, 33);
});

// Use the up and down arrow keys to select a universe
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
    if(key.name == 'up'){
        selected--;
        if(selected < 0){
            selected = universeCount - 1;
        }
        console.log("Selected universe " + selected);
    } else if(key.name == 'down'){
        selected++;
        if(selected >= universeCount){
            selected = 0;
        }
        console.log("Selected universe " + selected);
    }

    // allow ctrl-c to exit
    if(key.ctrl && key.name == 'c'){
        process.exit();
    }
});