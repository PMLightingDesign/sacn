
const { byteArray } = require('./byte.util.js');

class sACNPacket {
  constructor(universe, priority, appname, CID){
    // This constitutes the full length
    this.output = new Uint8Array(638);

    // Assign the App Name
    this._name = "nodejs_sacn"
    if(typeof(appname) != 'undefined'){ this._name = appname }

    // Merges the supplied CID with sequencial numbers
    this.CID = sACNPacket.getCID(CID);

    console.log(`new sACNPacket created at universe: ${universe}`);

    this.priority = priority;
    this.universe = universe;
    this.sequence = 0;
    this.options = 0b00000000;

    // Preamble Size - Define RLP Preamble Size.
    this.output.set([0x00, 0x10], 0);
    // Post-amble Size - RLP Post-amble Size.
    this.output.set([0x00, 0x00], 2);
    // ACN Packet Identifier -Identifies this packet as E1.17
    this.output.set([0x41, 0x53, 0x43, 0x2d, 0x45, 0x31, 0x2e, 0x31, 0x37, 0x00, 0x00, 0x00], 4);
    // Flags and Length - Protocol Flags and Length
    byteArray.writeUint16(this.output, 16, (0x7 << 12) | (this.output.length - 16));
    // Vector - Identifies RLP Data as 1.31 Protocol PDU
    this.output.set([0x00, 0x00, 0x00, 0x04], 18);
    // CID - Sender's CID
    this.output.set(this.CID, 22);
    // Flags and Length - Protocol Flags and Length
    byteArray.writeUint16(this.output, 38, (0x7 << 12) | (this.output.length - 38));
    // Vector - Identifies RLP Data as 1.31 Protocol PDU
    this.output.set([0x00, 0x00, 0x00, 0x02], 40);
    // Source Name - User Assigned Source Name
    this.output.set(Buffer.from(this._name + "-" + this.universe, 'ascii'), 44);
    // Priority - Data priority if multiple sources
    this.output.set([ this.priority ], 108);
    // Sync Address - Universe address on which sync packets will be sent
    byteArray.writeUint16(this.output, 109, 0x0000);
    // Sequence Number - Sequence Number
    this.output[111] = this.sequence;
    // Options - Options Flags
    this.output[112] = this.options;
    // Universe - Universe Number
    byteArray.writeUint16(this.output, 113, this.universe);
    // Flags and Length - Protocol Flags and Length
    byteArray.writeUint16(this.output, 115, (0x7 << 12) | (this.output.length - 115));
    // Vector - Identifies DMP Set Property Message PDU
    this.output.set([0x02], 117);
    // Address Type & Data Type - Identifies format of address and data
    this.output.set([0xa1], 118);
    // First Property Address - Indicates DMX512-A START Code is at DMP address 0
    byteArray.writeUint16(this.output, 119, 0x0000);
    // Address Incriment - Indicates each property is 1 octet
    byteArray.writeUint16(this.output, 121, 0x0001);
    // Property value count - DMX Frame Length
    byteArray.writeUint16(this.output, 123, 513);

  }

  // Needed to advance the sequence number each frame
  tick(){
    if(this.sequence < 255){
      this.sequence++;
    } else {
      this.sequence = 0;
    }
    this.output[111] = this.sequence;
  }

  static getCID(base){

    let output = new Uint8Array(16);

    base = base.split(':');

    if(typeof(base) != 'undefined'){
      for (let i = 0; i < output.length; i++){
        if(i < base.length){
          output[i] = parseInt(base[i], 16);
        } else {
          output[i] = i;
        }
      }
    } else {
      for (let i = 0; i < output.length; i++){
        output[i] = i;
      }
    }

    console.log(`Returning new CID: ${output.toString()}`);

    return output;
  }
}

module.exports = sACNPacket;
