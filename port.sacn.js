// This is a re-write of the classic sACNSocket
// Node modules
const dgram = require('dgram');
const os = require('os');
const util = require('util');

// Magicbox modules
const sACNPacket = require('./packet.sacn.js')
const DataOutput = require('../super.io.js');
const Interfaces = require('../../utils/network.util.js').Interfaces;

// The internal IP order, consider revising to config file
const IP_ORDER = [
  '10.101.1',
  '10.101',
  '192.168.0',
  '192.168.1',
  '192.168'
];

// The universal sACN socket
const SOCKET = 5568;

class sACNOutput extends DataOutput {
  constructor(config){
    super(config);
    // Set status flag
    this.status = "NOT READY";

    // ------------------------------
    // INIT OPTIONS
    // Universes will already be set up by the super class
    // Do priorities if not defined
    this.priorities = {};
    if(typeof(config.priorities) == 'undefined'){
      for(let key in this.unviverses){
        this.priorities[key] = 100;
      }
    } else {
      for(let key in this.unviverses){
        this.priorities[key] = config.priorities[key];
      }
    }

    // ------------------------------
    // INIT PACKETS
    // sACN may care about the msg order
    // We can't just create packets on the fly :(
    this.packets = {};
    for(let i = 0; i < this.universes.length; i++){
      console.log("Creating Packet");
      let key = this.universes[i];
      this.packets[key] = new sACNPacket(key, this.priorities[key], console.log);
    }

    // ------------------------------
    // INIT NETWORK
    // Are we in automatic IP mode?
    if(typeof(config.ip) == 'undefined'){
      config.ip = 'auto';
    }
    // The actual udp connection
    this.udp = dgram.createSocket('udp4');
    // Specify network interface
    if(config.ip === 'auto'){
      // Service preference set as a constant, IP_ORDER
      let iface = Interfaces.filterPreferece(IP_ORDER, 'IPv4');
      if(typeof(iface) == undefined){
        // Do not proceed if automatic assignment fails
        console.log("Automatic address assignment failed, no valid interface");
      }
      this.ip = iface.address;
    } else if(typeof(config.ip) != 'undefined') {
      this.ip = config.ip;
    } else {
      console.log("sACN: Warning, address assigned to local loopback!");
      this.ip = `127.0.0.1`;
    }

    // ------------------------------
    // FINAL SETUP

    this.inputIPC;

    if(os.type() =='Linux' && os.arch() == 'arm'){
      this.udp.bind(SOCKET, (err) => {
        if(err){
          this.error(err);
        }
        console.log("sACN: Started output on " + this.ip);

        // Subscribe to multicast if we are receiving universes
        if(config.input_mask.length > 0){

          // if(os.type == 'Windows_NT'){
            this.udp.setBroadcast(true);
            this.udp.setMulticastTTL(128);
        //  }

          for(let i = 0; i < config.input_mask.length; i++){
            this.watchUniverse(config.input_mask[i]);
          }

          // Setup the IPC Channel
          const IPCClient = require('../../ipc/client.ipc.js');

          let cfg = {
            world: 'io.input',
            silent: true
          }

          this.inputIPC = new IPCClient(cfg, () => {
            // this.inputIPC.send('app.input', "BEAN!");
            this.ingestData = function(msg){
              this.inputIPC.send('app.input', msg);
            }
          });

        }

        this.status = "READY";
      });
    } else {
      this.udp.bind(SOCKET, this.ip,(err) => {
        if(err){
          this.error(err);
        }
        console.log("sACN: Started output on " + this.ip);

        // Subscribe to multicast if we are receiving universes
        if(config.input_mask.length > 0){

          // if(os.type == 'Windows_NT'){
            this.udp.setBroadcast(true);
            this.udp.setMulticastTTL(128);
        //  }

          for(let i = 0; i < config.input_mask.length; i++){
            this.watchUniverse(config.input_mask[i]);
          }

          // Setup the IPC Channel
          const IPCClient = require('../../ipc/client.ipc.js');

          let cfg = {
            world: 'io.input',
            silent: true
          }

          this.inputIPC = new IPCClient(cfg, () => {
            // this.inputIPC.send('app.input', "BEAN!");
            this.ingestData = function(msg){
              this.inputIPC.send('app.input', msg);
            }
          });

        }

        this.status = "READY";
      });
    }

    // We need to kick back incoming sACN to the input broker
    this.udp.on('message', (msg) => {
      this.ingestData(msg);
    });
  }

  ingestData(msg){
    console.log(`NOT CONNECTED!`);
    console.log(msg);
  }

  watchUniverse(u){
    console.log(this.udp.address().address);
    this.udp.addMembership(`239.255.0.${u}`, this.udp.address().address);
    console.log(`Listening for packets on Universe ${u}`);
  }

  ignoreUniverse(u){
    this.udp.dropMembership(`239.255.0.${u}`);
    console.log(`Ignoring packets on Universe ${u}`);
  }

  updateOne(u){
    this.packets[u].output.set(this.data[u], 126);
    this.packets[u].tick();
    let msg = Buffer.from(this.packets[u].output);
    this.udp.send(msg, 5568, `239.255.0.${u}`, (err) => {
      if(err){
        this.error(err);
      } else {
        this.status = "READY";
      }
    });
  }
}

module.exports = sACNOutput;
