
const Uint8ArrayUtil = require('./uint8array.util.js');

class sACNPacket {
  constructor(universe, priority, log, appname, CID){

    this._name = "magicbox"

    if (typeof(log) === 'undefined'){
      log = console.log;
    }

    if(typeof(appname) != 'undefined'){
      this._name = appname
    }

    log("new sACNPacket created at universe: " + universe);

    this.output = new Uint8Array(638);
    this.priority = [priority];
    this.universe = [0, universe];

    //Write this all out in case it ever changes
    this.preambleSize = [0,16];
    this.output.set(this.preambleSize, 0);

    this.postambleSize = [0,0];
    this.output.set(this.postambleSize, 2);

    this.ACNPacketIdentifier = [65,83,67,45,69,49,46,49,55,0,0,0];
    this.output.set(this.ACNPacketIdentifier, 4);

    this.FandL = [114,110];
    this.output.set(this.FandL, 16);

    this.vector = [0,0,0,4];
    this.output.set(this.vector, 18);

    this.CID = sACNPacket.getCID();
    this.output.set(this.CID, 22);

    this.FandL2 = [114,88];
    this.output.set(this.FandL2, 38);

    this.vector2 = [0,0,0,2];
    this.output.set(this.vector2, 40);

    this.name = Uint8ArrayUtil.fromText(this._name + "-" + this.universe[1]);
    this.output.set(this.name, 44);

    //this.priority
    this.output.set(this.priority, 108);

    this.reserved = [0,0];
    this.output.set(this.reserved, 109);

    this.seq = [0];
    this.output.set(this.seq, 111);

    this.options = [0];
    this.output.set(this.options, 112);

    //this.universe
    this.output.set(this.universe, 113);

    this.FandL3 = [114, 11];
    this.output.set(this.FandL3, 115);

    this.vector3 = [2];
    this.output.set(this.vector3, 117);

    this.types = [161];
    this.output.set(this.types, 118);

    this.firstPropAdr = [0,0];
    this.output.set(this.firstPropAdr, 119);

    this.adrIncriment = [0,1];
    this.output.set(this.adrIncriment, 121);

    this.propCount = [2,1];
    this.output.set(this.propCount, 123);

  }

  tick(){
    if(this.seq < 255){
      this.seq++;
    } else {
      this.seq = 0;
    }
    this.output[111] = this.seq;
  }

  static getCID(base){

    let output = new Uint8Array(16);

    if(typeof(base) != 'undefined'){
      for (let i = 0; i < output.length; i++){
        if(i < base.length){
          output[i] = base[i];
        } else {
          output[i] = i;
        }
      }
    } else {
      for (let i = 0; i < output.length; i++){
        output[i] = i;
      }
    }

    return output;
  }
}

module.exports = sACNPacket;
