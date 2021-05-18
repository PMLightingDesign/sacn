// Repo for global generic useful functions
function lerp(a, b, d){
  return (1 - d) * a + d * b;
}
module.exports.lerp = lerp;

// Linear interpolation between arrays of the same length
function lerpArray(arr1, arr2, d){
  let arr3 = new Array(arr1.length);
  if(arr1.length != arr2.length){
    throw new Error("Cannot interpolate between arrays, lengths do not match!");
  } else {
    for(let i = 0; i < arr1.length; i++){
      arr3[i] = lerp(arr1[i], arr2[i], d);
    }
  }
  return arr3;
}
module.exports.lerpArray = lerpArray;
