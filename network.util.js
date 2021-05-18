// Collection of network realted utilities

// Node modules
const os = require('os');

class Interfaces {
  // Get interfaces by family
  static getInterfacesByFamily(family){
    let ai = os.networkInterfaces(); // ai = All Interfaces

    let interfaces = {};

    for(let key in ai){
      for(let i = 0; i < ai[key].length; i++){
        if(ai[key][i].family == family){
          interfaces[key] = ai[key][i];
        }
      }
    }

    return interfaces;
  }

  // Get interfaces on ipv4 only
  static getIPV4(){
    return Interfaces.getInterfacesByFamily('IPv4');
  }

  // Get interfaces on ipv6 only
  static getIPV6(){
    return Interfaces.getInterfacesByFamily('IPv6');
  }

  //Filter address by a network scheme
  static filter(net, family){
    let ai = Interfaces.getInterfacesByFamily(family); // ai = All Interfaces

    let interfaces = {};

    for(let key in ai){
      if(ai[key].address.includes(net)){
        interfaces[key] = ai[key];
      }
    }

    return interfaces;
  }

  // Get a single interface, which will be the first one in the list
  static filterOne(net, family){
    let interfaces = Interfaces.filter(net, family);
    let iface = {};

    for(let key in interfaces){
      iface = interfaces[key];
      iface.name = key;
      return iface;
    }

    return iface;
  }

  // Return an interface based on an ordered list of prefered nets
  static filterPreferece(net, family){
    let iface = {};

    let ai = Interfaces.getInterfacesByFamily(family);
    for(let i = 0; i < net.length; i++){
      for(let key in ai){
        if(ai[key].address.includes(net[i])){
          return ai[key];
        }
      }
    }
    return iface;
  }

}

module.exports.Interfaces = Interfaces;
