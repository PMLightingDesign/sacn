const EventEmitter = require('events');
const { byteArray } = require('./byte.util.js');

class sACNReceiver extends EventEmitter {
  constructor(options){
    super();

    this.udp = require('dgram').createSocket('udp4');

    let iface = '0.0.0.0';

    this.universes = [ 1 ];

    this.msgCount = 0;

    if(typeof(options) != 'undefined'){
      if(options.interface){
        iface = options.interface;
      } if(options.universes) {
        this.universes = options.universes;
      }
    }

    this.data = {};

    this.universes.forEach( universe => {
      this.data[universe] = new Uint8Array(512);
    });

    this.udp.bind(5568, (err) => {
      if(err){
        this.emit('error', err);
      } else {
        console.log(this.udp.address());
      }

      this.universes.forEach(universe => {
        let mCastAdr = '239.255.0.' + universe;
        this.udp.addMembership(mCastAdr, '0.0.0.0');
        console.log(`Adding membership ${mCastAdr}`);
      });

      this.udp.on('message', (buf, rinfo) => {
        this.emit("raw-data", buf);

        this.msgCount++;

        let frame = Uint8Array.from(buf);
        let universe = byteArray.getUint16(frame, 113);
        this.data[universe] = frame.slice(126);

        this.emit(`universe-${universe.toString()}`, this.data[universe]);
      });
    });
  }

  addUniverse(universe, priority){
    if(!this.universes.includes(universe)){
      this.universes.push(universe);
      this.data[universe] = new Uint8Array(512);
    }
  }

  setUniverse(universe, data){
    this.data[universe] = data;
  }

  close(){
    this.udp.close();
  }
}

module.exports = sACNReceiver;