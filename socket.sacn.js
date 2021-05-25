// Node modules
const dgram = require('dgram');
const os = require('os');
const util = require('util');
const EventEmitter = require('events');

// Internal modules
const sACNPacket = require('./packet.sacn.js');
const { Interfaces, ipAddress } = require('./network.util.js');
const { byteArray } = require('./byte.util.js');

// Standard options object
const OPTIONS = {
  interface: 'auto',
  universes: [1],
  priorities: [100],
  appname: "NodeJS sACN"
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
  constructor(options){
    super();

    // Create the real UDP socket
    this.udp = dgram.createSocket('udp4');

    // If no data us supplied, default to Universe 1, Priority 100
    if(typeof(options.universes) === 'undefined'){
      options.universes = OPTIONS.universes;
      options.priorities = OPTIONS.priorities;
    }

    // Store Universes and Priorities
    this.universes = options.universes;
    this.priorities = options.priorities;

    // Specify the network interface to bind to
    // This needs to take place before we assign the CID, which is based on the MAC
    if(options.interface === 'auto'){
      // Service preference set as a constant, IP_ORDER
      this.interface = Interfaces.filterPreferece(IP_ORDER, 'IPv4');
      if(typeof(this.interface) == undefined){
        // Do not proceed if automatic assignment fails
        throw new Error("Automatic address assignment failed, no valid interface");
      }
      this.ip = this.interface.address;
    } else if(typeof(options.ip) != 'undefined' && options.interface != 'auto') {
      this.interface = options.interface;
      this.ip = options.interface.ip;
    } else {
      throw new Error("No valid interface specified");
    }

    // Set the Appname
    if(typeof(options.appname) == 'undefined'){
      this.appname = OPTIONS.appname;
    } else {
      this.appname = options.appname;
    }

    // Set the CID
    if(typeof(options.CID) != 'undefined'){
      this.CID = options.CID;
    } else {
      this.CID = this.interface.mac;
    }

    console.log(`Setting base CID to: ${this.CID}`);

    // This object holds all universe records and references
    this.u = {}

    // Create our universe array
    for(let i = 0; i < options.universes.length; i++){
      this.addUniverse(options.universes[i], options.priorities[i]);
    }

    console.log(util.inspect(this.u, { depth: 1 }));

    // Bind the socket and set up the event handler
    this.udp.bind(SOCKET, this.ip, (err) => {
      if(err){
        throw(err);
      }

      console.log("Starting sACN output on " + this.ip);
      this.emit('ready');

      this.udp.on('message', (data) => {
        this.emit('data', data);
      });
    });

    // Release socket on disconnection
    process.on('exit', () => {
      this.udp.close();
    });
  }

  // Send one Universe
  sendUniverse(u){
    this.u[u].packet.output.set(this.u[u].data, 126);
    this.u[u].packet.tick();
    let msg = this.u[u].packet.output.slice();
    this.udp.send(msg, 5568, this.u[u].ip, (err) => {
      if(err){ this.log(err); }
    });
  }

  // Set one Universe
  setUniverse(u, data){
    this.u[u].data = data.slice();
  }

  // Takes an oject with universe numbers as keys, and Byte Array like objecs as values
  set(d){
    for(const [u, data] of Object.entries(d)){
      if(typeof(this.u[u]) != 'undefined'){
        this.setUniverse(u, data);
      }
    }
  }

  // Send All Universes
  send(){
    this.universes.forEach((u) => { this.sendUniverse(u); });
  }

  // Add or Overwrites an existing universe
  addUniverse(universe, priority){
    /*
    Universe record format
      universe: Universe address (uint8),
      priority: Universe priority (uint8),
      ip: Universe multicast address (ipv4),
      packet: An instance of the sACN packet class
      data: the Uint8Array which is the universe
    */

    // This entries packet and data
    let packet = new sACNPacket(universe, priority, this.appname, this.CID);
    let data = new Uint8ClampedArray(512).fill(0);

    let ip = [239, 255, 0, 0];
    byteArray.writeUint16(ip, 2, universe);

    this.u[universe] = {
      universe: universe,
      priority: priority,
      ip: ipAddress.bytesToIPv4(ip),
      packet: packet,
      data: data
    };
  }

}

module.exports = SACNSocket;
