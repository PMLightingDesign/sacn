// Node modules
const dgram = require('dgram');
const os = require('os');
const util = require('util');
const EventEmitter = require('events');

// Internal modules
const sACNPacket = require('./packet.sacn.js');
const Interfaces = require('./network.util.js').Interfaces;

// Standard options object
const OPTIONS = {
  ip: 'auto',
  universes: [1],
  priorities: [100]
}

const IP_ORDER = [
  '10.101.1',
  '10.101',
  '192.168.0',
  '192.168.1',
  '192.168'
];

// The universal sACN socket
const SOCKET = 5568;

class SACNSocket extends EventEmitter {
  constructor(options, log){
    super();

    // This objects actual socket
    this.udp = dgram.createSocket('udp4');

    // Assign logging function
    if (typeof(log) === 'undefined'){
      this.log = console.log;
    }

    if(typeof(options.universes) === 'undefined'){
      options.universes = OPTIONS.universes;
    }

    // This array holds all of our data
    this.u = new Array();

    /*
    {
      universe: Universe address (uint8),
      priority: Universe priority (uint8),
      ip: Universe multicast address (ipv4),
      packet: the sACN packet reference
      data: the Uint8Array which is the universe
    }
    */

    // Create our universe array
    for(let i = 0; i < options.universes.length; i++){
      // This entries packet and data
      let packet = new sACNPacket(options.universes[i], options.priorities[i], this.log);
      let data = new Uint8ClampedArray(512).fill(0);

      this.u.push({
        universe: options.universes[i],
        priority: options.priorities[i],
        ip: ('239.255.0.' + options.universes[i]),
        packet: packet,
        data: data
      });
    }

    this.log(util.inspect(this.u, { depth: 1 }));

    // Create universe map
    this.universeMap = {};

    for(let i = 0; i < this.u.length; i++){
      this.universeMap[this.u[i].universe] = i;
    }

    this.log(util.inspect(this.universeMap));

    // Specify network interface
    if(options.ip === 'auto'){
      // Service preference set as a constant, IP_ORDER
      let iface = Interfaces.filterPreferece(IP_ORDER, 'IPv4');
      if(typeof(iface) == undefined){
        // Do not proceed if automatic assignment fails
        throw new Error("Automatic address assignment failed, no valid interface");
      }
      this.ip = iface.address;
    } else if(typeof(options.ip) != 'undefined') {
      this.ip = options.op;
    } else {
      this.ip = OPTIONS.ip;
    }

    // Bind the socket
    this.udp.bind(SOCKET, this.ip, (err) => {
      if(err){
        throw(err);
      }
      this.log("Starting sACN output on " + this.ip);
      this.emit('ready');
    });

    // Release socket on disconnection
    process.on('exit', () => {
      this.udp.close();
    });
  }

  // Send by internal index
  sendIndex(i){
    // Send data for this universe
    this.u[i].packet.output.set(this.u[i].data, 126);
    this.u[i].packet.tick();
    let msg = this.u[i].packet.output.slice();
    this.udp.send(msg, 5568, this.u[i].ip, (err) => {
      if(err){
        this.log(err);
      }
    });
  }

  // Send by universe number
  send(u){
    this.sendIndex(this.universeMap[u]);
  }

  set(u, data){
    this.u[this.universeMap[u]].data = data.slice();
  }

  sendAll(){
    for(let i = 0; i < this.u.length; i++){
      this.sendIndex(i);
    }
  }

}

module.exports = SACNSocket;
