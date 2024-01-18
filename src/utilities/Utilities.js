import { DateTime, Duration } from "luxon";
// Extract data from binary logfile using offsets found by binary examination
export const parseLogdata = logdata => {
  let dataview = new DataView(logdata);

  let output = [];

  for (let i = 0; i < 7; i++) {
    output[i] = dataview.getUint32(i*4, true)
  }

  output[7] = [];
  for (let i = 0; i < output[4]; i++) {
    output[7][i] = dataview.getUint32((i+7)*4, true)
  }

  output[8] = [];
  for (let i = 0; i < output[5]; i++) {
    output[8][i] = dataview.getUint32((i+7+256)*4, true)
  }

  let stringbytes = []
  for (let i = 0; i < 19; i++) {
    let char = dataview.getUint8((i+1552), true)
    if(char !== 0) { stringbytes.push(char) }
  }
  output[9] = String.fromCharCode.apply(null, stringbytes);

  output[10] = dataview.getUint32(1572, true);
  output[11] = dataview.getUint32(1576, true);

  return {
    sessionID: dosToID(output[0]),
    channelAmount: output[1],
    sampleRate: output[2],
    creationDate: DateTime.fromISO(dosDateTimeToString(output[3])),
    fileAmount: output[4],
    markerAmount: output[5],
    samplesAmount: output[6],
    sessionDuration: samplesToDuration(output[6], output[2]),
    filesSamplesAmount: output[7],
    filesDuration: sampleArrayToDurationArray(output[7], output[2]),
    markersSamples: output[8],
    markersTimestamps: sampleArrayToDurationArray(output[8], output[2]),
    sessionName: output[9],
    SDNumber: output[10],
    otherDuration: samplesToDuration(output[11], output[2])
  }
}

export const list = session => {
  let list = "";
  for (let i = 0; i < session.fileAmount; i++) {
    list = list + "file '" +
    parseOSPath(session.folder) +
    pad((i+1).toString(16).toUpperCase(), 8) + ".WAV'\n"
  }
  return list;
}

export const ffmpegChannels = (session, outpath, channels) => {
  let cmd = []

  for (let i = 0; i < session.channelAmount; i++) {
      if(channels[i]) {
        cmd.push("-map_channel 0.0." + i + " \"" + parseOSPath(outpath ? outpath : "") + pad(i+1, 2) + ".wav\" ");
      }
  }
  return cmd;
}

export const cmd = (session, os, outpath, channels) => {
  let cmd = [];
  if(os === "unix") {
    cmd.push("ffmpeg -f concat -safe 0 -i <( \\\n");
    let listtxt = list(session).split("\n");
    listtxt.pop();
    listtxt.forEach(item => {
      cmd.push("echo \"" + item.replace("\n", "") + "\"; \\\n");
    });
    cmd.push(") \\\n");


    ffmpegChannels(session, outpath, channels).forEach(line => {
      cmd.push(line + "\\\n");
    });
  }
  if(os === "win") {
    let listtxt = list(session).split("\n");
    listtxt.pop();
    cmd.push("( \n");
    listtxt.forEach(item => {
      cmd.push("@echo " + item.replace("\n", "") + "\n");
    });
    cmd.push(") > list.txt \n");
    cmd.push("ffmpeg -f concat -safe 0 -i list.txt ");

    ffmpegChannels(session, outpath, channels).forEach(line => {
      cmd.push(line);
    });

    cmd.push("\ndel list.txt")
  }
  return cmd;
}

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

export const samplesToDuration = (samples, rate) => {
  return Duration.fromMillis(samples/rate*1000)
}

export const sampleArrayToDurationArray = (sampleArray, rate) => {
  let output = [];
  for (let i = 0; i < sampleArray.length; i++) {
    output.push(Duration.fromMillis(sampleArray[i]/rate*1000));
  }
  return output
}

export const dosDateTimeToString = dosDateTime => {
  return ((dosDateTime >>> 25) + 1980) + "-" + //Year (first 7 bits +1980)
  pad(((dosDateTime << 7) >>> 28), 2) + "-" + //Month (4 bits)
  pad(((dosDateTime << 11) >>> 27), 2) + "T" + //Day (5 bits)
  pad(((dosDateTime << 16) >>> 27), 2) + ":" + //Hour (5 bits)
  pad(((dosDateTime << 21) >>> 26), 2) + ":" + //Minute (6 bits)
  pad((((dosDateTime << 27) >>> 27)*2), 2) //Second (5 bits *2)
}

export const ab64toBlob = (base64, type = 'application/octet-stream') => fetch(`data:${type};base64,${base64}`).then(res => res.blob())

export const b64toBlob = (b64Data, contentType='application/octet-stream', sliceSize=512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}