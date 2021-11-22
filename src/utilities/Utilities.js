export const parseOSPath = path => {
  // First trim whitespace to make sure matches line up
  if(path) {
    path = path.trim();

    // Windows path
    if(path.split("\\").length > 1) {
      // Make sure last char is trailing slash
      if(path.charAt(path.length-1) !== "\\") {
        path = `${path}\\`
      }
    }

    // Unix path
    if(path.split("/").length > 1) {

      if(path.charAt(0) !== "/" && path.charAt(0) !== ".") {
        path = `./${path}`
      }
      // Make sure last char is trailing slash
      if(path.charAt(path.length-1) !== "/") {
        path = `${path}/`
      }
    }
  }
  return path;
}

export const pad = (n, width, z) => {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

export const dosToID = dos => {
  return dos.toString(16).toUpperCase()
}

export const samplesToTimestamp = (samples, rate) => {
  return (
    pad(Math.floor(samples/rate/60/60), 2) + ":" +
    pad(Math.floor(samples/rate/60%60), 2) + ":" +
    pad(Math.floor(samples/rate%60), 2) + "." +
    pad(Math.floor(samples%rate/rate*1000), 2)
  )
}

export const sampleArrayToTimestampArray = (sampleArray, rate) => {
  let output = [];
  for (let i = 0; i < sampleArray.length; i++) {
    output.push(samplesToTimestamp(sampleArray[i], rate));
  }
  return output
}

export const dosDateTimeToString = dosDateTime => {
  return ((dosDateTime >>> 25) + 1980) + "-" + //Year (first 7 bits +1980)
  ((dosDateTime << 7) >>> 28) + "-" + //Month (4 bits)
  ((dosDateTime << 11) >>> 27) + " " + //Day (5 bits)
  ((dosDateTime << 16) >>> 27) + ":" + //Hour (5 bits)
  ((dosDateTime << 21) >>> 26) + ":" + //Minute (6 bits)
  (((dosDateTime << 27) >>> 27)*2) //Second (5 bits *2)
}

export const b64toBlob = (base64, type = 'application/octet-stream') => fetch(`data:${type};base64,${base64}`).then(res => res.blob())
