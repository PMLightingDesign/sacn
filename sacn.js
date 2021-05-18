// Node modules
const dgram = require('dgram');
const os = require('os');
const util = require('util');
const EventEmitter = require('events');

// Internal modules
const sACNPacket = require('./packet.sacn.js');
const Interfaces = require('../../utils/network.util.js').Interfaces;

// The universal sACN socket
const SOCKET = 5568;

// Standard options object
const OPTIONS = {
  ip: 'auto',
  universes: [1],
  priorities: [100]
}

// Default IP Order
const IP_ORDER = [
  '10.101.1',
  '10.101',
  '192.168.0',
  '192.168.1',
  '192.168'
];

class sACNSocket extends EventEmitter {
  constructor(options){
    super();

    if(typeof(options) == 'undefined'){
      options = OPTIONS;
    }

    // IO UPD Socket
    this.udp = dgram.createSocket('udp4');

    // Assign logging function
    if(typeof(options.log) == 'undefined'){
      this.log = console.log;
    } else {
      this.log = options.log;
    }

    //
    if(typeof(options.universes) == 'undefined'){
      options.universes = OPTIONS.universes;
    }

    // These objects will hold our input and output data
    // Universes will be keyed to their human readable value
    this.uno = {}; // uno = universe_output
    // Container for data from external sources
    this.uni = {}; // uni = universe_input

    // Create our universe array
    for(let i = 0; i < options.universes.length; i++){
      // This entries packet and data
      let packet = new sACNPacket(options.universes[i], options.priorities[i], this.log);
      let data = new Uint8ClampedArray(512).fill(0);

      // Add new universe by key
      this.uno[options.universes[i]] = {
        universe: options.universes[i], // universe: Universe address (uint8)
        priority: options.priorities[i], // priority: Universe priority (uint8)
        ip: ('239.255.0.' + options.universes[i]), // ip: Universe multicast address (ipv4)
        packet: packet, // packet: instance of sACNPacket Class
        data: data // Real data
      }

    }

    // Sanity check
    if(options.DEBUG){ this.log(util.inspect(this.uno, { depth: 1 })); }

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
      this.ip = options.ip;
    } else {
      this.ip = OPTIONS.ip;
    }

    // Bind the socket
    this.udp.bind(SOCKET, this.ip, (err) => {
      if(err){
        throw(err);
      }
      this.log("Starting sACN output on " + this.ip);
      this.ready = true;
      this.emit('ready');
    });

    // Release socket on disconnection
    process.on('exit', () => {
      this.udp.close();
    });
  }

  setData(u, data){
    this.uno[u].data.set(data);
  }

  // Send by universe number
  send(u){
    if(typeof(u) != 'undefined'){
      this.uno[u].packet.output.set(this.uno[u].data, 126);
      this.uno[u].packet.tick();
      let msg = new Buffer(this.uno[u].packet.output);
      this.udp.send(msg, 5568, this.uno[u].ip, (err) => {
        if(err){ this.log(err); }
      });
    } else {
      for(let key in this.uno){
        this.send(key);
      }
    }
  }

}

module.exports = sACNSocket;
