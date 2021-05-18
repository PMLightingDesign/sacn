function readBit(array, index, bit){
  let byte = array[index];
  if((byte >> bit) & 0b00000001 > 0){ return 1 } else { return 0 }
}
module.exports.readBit = readBit;

function readCrumb(array, index, crumb){
  let byte = array[index];
  return (readBit(array, index, crumb+1) << 1) + readBit(array, index, crumb);
}

module.exports.readCrumb = readCrumb;

module.exports.writeBit = function(buffer, i = 0, bit = 0, value = 1){
  if(value == 0){
    buffer[i] &= ~(1 << bit);
  }else{
    buffer[i] |= (1 << bit);
  }
}

function concatUint8Array(arrays){
  let len = 0;
  arrays.forEach((arr) => { len += arr.length; });
  let conArr = new Uint8Array(len);
  let offset = 0;
  arrays.forEach((arr) => {
    conArr.set(arr, offset);
    offset += arr.length;
  });
  return conArr;
}

module.exports.concatUint8Array = concatUint8Array;

let byteArray = {
  getBit: readBit,
  getCrumb: readCrumb,
  getUint8: function(array, index){
    return array[index];
  },
  getUint16: function(array, index){
    return (array[index] << 8) + array[index+1];
  },
  getUint24: function(array, index){
    return (array[index] << 16) + (array[index+1] << 8)  + array[index+2];
  },
  getUint32: function(array, index){
    return (array[index] << 24) + (array[index+1] << 16) + (array[index+2] << 8)  + array[index+3];
  },
  getMultipleUint8: function(array, index, length){
    let arr = new Array();
    for(let i = 0; i < length; i++){ arr.push(array[i+index]); }
    return arr;
  },
  getMultipleUint16: function(array, index, length){
    let arr = new Array();
    for(let i = 0; i < length*2; i+=2){
      arr.push((array[i+index] << 8) + array[i+index+1]);
    }
    return arr;
  },
  getMultipleUint24: function(array, index, length){
    let arr = new Array();
    for(let i = 0; i < length*3; i+=3){
      arr.push((array[i+index] << 16) + (array[i+index+1] << 8)  + array[i+index+2]);
    }
    return arr;
  },
  getMultipleUint32: function(array, index, length){
    let arr = new Array();
    for(let i = 0; i < length*4; i+=4){
      arr.push((array[i+index] << 24) + (array[i+index+1] << 16) + (array[i+index+2] << 8)  + array[i+index+3]);
    }
    return arr;
  },
  writeUint16: function(array, index, value){
    array[index] = ((value >> 8) & 0xFF);
    array[index+1] = ((value >> 0) & 0xFF);
  },
  writeUint24: function(array, index, value){
    array[index] = ((value >> 16) & 0xFF);
    array[index+1] = ((value >> 8) & 0xFF);
    array[index+2] = ((value >> 0) & 0xFF);
  },
  writeUint32: function(array, index, value){
    array[index] = ((value >> 24) & 0xFF);
    array[index+1] = ((value >> 16) & 0xFF);
    array[index+2] = ((value >> 8) & 0xFF);
    array[index+3] = ((value >> 0) & 0xFF);
  },
  writeMultipleUint16: function(array, index, values){
    values.forEach((val, i) => {
      byteArray.writeUint16(array, index+(i*2), val);
    });
  },
  writeMultipleUint24: function(array, index, values){
    values.forEach((val, i) => {
      byteArray.writeUint24(array, index+(i*3), val);
    });
  },
  writeMultipleUint32: function(array, index, values){
    values.forEach((val, i) => {
      byteArray.writeUint32(array, index+(i*4), val);
    });
  },
  newUint16: function(value){
    let arr = new Uint8Array(2);
    byteArray.writeUint16(arr, 0, value);
    return arr;
  },
  newUint24: function(value){
    let arr = new Uint8Array(3);
    byteArray.writeUint24(arr, 0, value);
    return arr;
  },
  newUint32: function(value){
    let arr = new Uint8Array(4);
    byteArray.writeUint32(arr, 0, value);
    return arr;
  }
}

module.exports.byteArray = byteArray;
