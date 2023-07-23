class Color {
  constructor(value){
    if(typeof(value) == "undefined"){
      value = { r: 255, g: 255, b: 255 }
    }
    this.r = value.r;
    this.g = value.g;
    this.b = value.b;
  }

  shade(shade){
    shade = Math.round(shade);
    this.r += Math.min(255, Math.max(shade, -255));
    this.g += Math.min(255, Math.max(shade, -255));
    this.b += Math.min(255, Math.max(shade, -255));
    return this;
  }

  average(color){
    this.r = Math.round((color.r + this.r) / 2);
    this.g = Math.round((color.g + this.g) / 2);
    this.b = Math.round((color.b + this.b) / 2);
    return this;
  }

  add(color){
    this.r = Math.min(this.r + color.r, 255);
    this.g = Math.min(this.g + color.g, 255);
    this.b = Math.min(this.b + color.b, 255);
    return this;
  }

  subtract(color){
    this.r = Math.max(this.r - color.r, 0);
    this.g = Math.max(this.g - color.g, 0);
    this.b = Math.max(this.b - color.b, 0);
    return this;
  }

  invert(){
    this.r = 255 - this.r;
    this.g = 255 - this.g;
    this.b = 255 - this.b;
    return this;
  }

  set(color){
    this.r = Math.round(color.r);
    this.g = Math.round(color.g);
    this.b = Math.round(color.b);
    return this;
  }

  toHex(){
    let hexString = "#";
    hexString += Color.componentToHex(Math.round(this.r));
    hexString += Color.componentToHex(Math.round(this.g));
    hexString += Color.componentToHex(Math.round(this.b));
    return hexString;
  }

  toArray(){
    return [ this.r, this.g, this.b ];
  }

  copy(){
    return new Color(this);
  }

  static lerp(c1, c2, t){
    let f = function(a, b, t){ return (b - a) * t + a; }
    let r = f(c1.r, c2.r, t);
    let g = f(c1.g, c2.g, t);
    let b = f(c1.b, c2.b, t);
    return new Color({ r: r, g: g, b: b });
  }

  static componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  static fromHex(hex){
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return new Color({
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    });
  }

  static fromArray(arr){
    return new Color({
      r: arr[0],
      g: arr[1],
      b: arr[2]
    })
  }

  static fromHSL(h, s, l){
    s = Math.min(s, 1);
    l = Math.min(l, 1)
    h = h/360;
    let r, g, b;
    if(s == 0){
        r = g = b = l; // achromatic
    } else {
        let hue2rgb = (p, q, t) => {
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return new Color({r:Math.floor(r*255),g:Math.floor(g*255),b:Math.floor(b*255)});
  }

  static random8bit(){
    return Math.floor(Math.random() * 255);
  }

  static randomBounded8Bit(base, multiplier){
    return Math.floor(Math.random() * multiplier + base);
  }

  static random(){
    return new Color({
      r: Color.random8bit(),
      g: Color.random8bit(),
      b: Color.random8bit()
    });
  }

  static randomBounded(bounds){
    return new Color({
      r: Color.randomBounded8Bit(bounds.rBase, bounds.rMult),
      g: Color.randomBounded8Bit(bounds.gBase, bounds.gMult),
      b: Color.randomBounded8Bit(bounds.bBase, bounds.bMult)
    })
  }

  static red(){
    return new Color({r: 255, g: 0, b: 0});
  }

  static yellow(){
    return new Color({r: 255, g: 255, b: 0});
  }

  static green(){
    return new Color({r: 0, g: 255, b: 0});
  }

  static cyan(){
    return new Color({r: 0, g: 255, b: 255});
  }

  static blue(){
    return new Color({r: 0, g: 0, b: 255});
  }

  static purple(){
    return new Color({r: 255, g: 0, b: 255});
  }

  static white(){
    return new Color({r: 255, g: 255, b: 255});
  }

  static black(){
    return new Color({r: 0, g: 0, b: 0});
  }

  static greyscale(l){
    let level = Math.round(Math.max(0, Math.min(255, (l*255))));
    return new Color({
      r: level,
      g: level,
      b: level
    });
  }
}

function fillUniverse(color){
  let dmx = new Uint8ClampedArray(512).fill(64);
  for(let i = 0; i < 510; i+=3){
    let c = color.toArray();
    dmx.set([c[1], c[0], c[2]], i);
  }
  return dmx;s
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
