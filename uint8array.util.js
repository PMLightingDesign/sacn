// Global utilities
const lerp = require('./general.util.js').lerp;

class Uint8ArrayUtil {

  //Expands arrays, defaults to triple length array
  static expand(array, factor){
    // Array: Source Array
    // Factor: How many many times to duplicate each index
    if (array.constructor === Uint8Array){
      factor = typeof factor !== 'undefined' ? factor : 3;
      let output = new Uint8Array(Math.floor(array.length * factor));
      for(let i = 0; i < output.length; i++){
        output[i] = array[Math.floor(i / factor)];
      }
    } else {
      return (new Uint8Array());
    }
  }

  // Interpolates between one array and another
  static lerp(arr1, arr2, delta){
    if(arr1.length == arr2.length){
      let output = new Uint8Array(arr1.length);
      for(let i = 0; i < arr1.length; i++){
        output[i] = lerp(arr1[i], arr2[i], delta);
      }
      return output;
    } else {
      let fallbackLength = typeof arr1.length !== 'undefined' ? arr1.length : 30;
      return (new Uint8Array(fallbackLength));
    }
  }

  // Merges two arrays, taking the max value of each
  static max(arrays){
    let out = new Uint8Array(arrays[0].length)
    for (let i = 0; i < arrays[0].length; i++){
      for(let j = 0; j < arrays.length; j++){
        out[i] = Math.max(out[i], arrays[j][i]);
      }
    }
    return out;
  }

  // Converts text to bytes
  static fromText(s) {
      let ua = new Uint8Array(s.length);
      for (let i = 0; i < s.length; i++) {
          ua[i] = s.charCodeAt(i);
      }
      return ua;
  }

  // Converts bytes to text
  static toText(ua) {
      let s = '';
      for (let i = 0; i < ua.length; i++) {
          s += String.fromCharCode(ua[i]);
      }
      return s;
  }
}

module.exports = Uint8ArrayUtil;
