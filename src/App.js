import React from "react";

import './app.scss';

import Form from "./components/Form/Form";

// Extract data from binary logfile using offsets found by binary examination
const parseLogdata = logdata => {
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
    stringbytes[i] = dataview.getUint8((i+1552), true)
  }
  output[9] = String.fromCharCode.apply(null, stringbytes);

  output[10] = dataview.getUint32(1572, true);
  output[11] = dataview.getUint32(1576, true);
  return output;
}

const parseOSPath = path => {
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

const pad = (n, width, z) => {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

const dosToID = dos => {
  return dos.toString(16).toUpperCase()
}

// const samplesToSeconds = (samples, rate) => {
//   return Math.floor(samples/rate)
// }

const samplesToTimestamp = (samples, rate) => {
  return (
    pad(Math.floor(samples/rate/60/60), 2) + ":" +
    pad(Math.floor(samples/rate/60%60), 2) + ":" +
    pad(Math.floor(samples/rate%60), 2) + "." +
    pad(Math.floor(samples%rate/rate*1000), 2)
  )
}

const listOfTimestamps = (sampleArray, rate) => {
  let output = "";
  for (let i = 0; i < sampleArray.length; i++) {
    output += samplesToTimestamp(sampleArray[i], rate) + "  ";
  }
  return output
}

const dosDateTimeToString = dosDateTime => {
  return ((dosDateTime >>> 25) + 1980) + "-" + //Year (first 7 bits +1980)
  ((dosDateTime << 7) >>> 28) + "-" + //Month (4 bits)
  ((dosDateTime << 11) >>> 27) + " " + //Day (5 bits)
  ((dosDateTime << 16) >>> 27) + ":" + //Hour (5 bits)
  ((dosDateTime << 21) >>> 26) + ":" + //Minute (6 bits)
  (((dosDateTime << 27) >>> 27)*2) //Second (5 bits *2)
}

const b64toBlob = (base64, type = 'application/octet-stream') => fetch(`data:${type};base64,${base64}`).then(res => res.blob())

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      listtxt: [],
      cmd: [],
      outputa: "",
      outputb: "",
      outfile: "",
      outcmd: "",
      outcmd2: ""
    };

    this.handleCopy = this.handleCopy.bind(this);
    this.handleCopy2 = this.handleCopy2.bind(this);
  }



  handleCopy(event) {
    navigator.clipboard.writeText(this.state.outcmd)
  }

  handleCopy2(event) {
    navigator.clipboard.writeText(this.state.outcmd2)
  }

  componentDidMount() {

    const testBlob = "yaGjUhAAAACAuwAAyaGjUgMAAAABAAAAADTxCADA/z8AwP8/AMATDwAAAAAAwP8/AMD/PwDA/z8AoGcYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQrXwFwOOaACAymwAgP50AIGydACCZnQAgxp0AIAKeACAgngAgiZ4AIKeeACBpoAAglqAAILSgACDSoAAgDqEAICyhACCkoQAg0aEAIO+hACANogAgK6IAIKOiACDQogAQ76IAIAyjACAqowAgwKMAIM+jACD8owAgHaQAIDikACD4pwAgJagAIEOoACBhqAAgyqgAIOioACAGqQAgJKkAIEKpACDJqQAg56kAEPepACAUqgAgMqoAIF+qACDXqgCw+6oAIBOrACAxqwCQV6sAIG2rACD0qwAgEqwAIDCsAIBUrAAgbKwAIDyvACBarwAgeK8AIP+vACAssAAglbAAIA2xABAvsQCQWrEAIHaxACCUsQAg/bEAIBuyACBIsgAgZrIAIGWzAKCHswAgobMAIBm0ACA3tACQYLQAIIK0ACCgtAAgGLUAIDa1ACBjtQAggbUAIJ+1ACBAugAgXroAIHy6ACCaugAgx7oAID+7ACBduwAge7sAIJm7ACDGuwAg5LsAIE28ACBrvAAgibwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="

    b64toBlob(testBlob).then(res => this.readFile(res, "outputa"));

  }

  // Read a given file, and print the output to the given element, sdnumber is not extracted from logfile, just based on order of opening
  readFile = (file, outputElement) => {
      let reader = new FileReader();
      reader.onload = e => {
          // Extract array of data from binary data from the logfile
          let logData = parseLogdata(e.target.result);

          // Print the needed output to the "list.txt" output field
          this.displayListTxt(logData, logData[10]-1)

          // Print the needed output to both cmd output fields
          // this.displayCmd(logData)

          // Print the data from the logfile to the corresponding outputelement
          this.displayResult(logData, outputElement)
      };
      reader.onerror = e => {
          // Error occurred
          throw e;
      };
      if(typeof file !== "undefined") {
        reader.readAsArrayBuffer(file);
      }
  }

  displayResult = (data, outputElement) => {
      this.setState({[outputElement]: ""});
      let output = `
          <li>Session ID: ${dosToID(data[0])}</li>\n
          <li>Number of channels recorded: ${data[1]}</li>\n
          <li>Sample Rate: ${data[2]}</li>\n
          <li>Creation Date: ${dosDateTimeToString(data[3])}</li>\n
          <li>Number of files (takes) in session: ${data[4]}</li>\n
          <li>Number of markers in session: ${data[5]}</li>\n
          <li>Duration of session on card: ${samplesToTimestamp(data[6], data[2])}</li>\n
          <li>Duration of files (takes): ${listOfTimestamps(data[7], data[2])}</li>\n
          <li>Marker timestamps: ${listOfTimestamps(data[8], data[2], )}</li>\n
          <li>Session name: ${data[9]}</li>\n
          <li>SD card number: ${data[10]}</li>\n
          <li>Session duration on other card: ${samplesToTimestamp(data[11], data[2])}</li>\n
      `
      this.setState({[outputElement]: output});
  }

  displayListTxt = (data, sdnumber) => {
    let inputPath = [this.state.inpatha, this.state.inpathb];
    console.log(sdnumber);
    let listtxt = [];
    if(!sdnumber) {
      this.setState({listtxt: listtxt});
    } else {
      listtxt = this.state.listtxt;
    }
    for (let i = 0; i < data[4]; i++) {
      listtxt.push("file '" + parseOSPath(inputPath[sdnumber] ? inputPath[sdnumber] : "") + pad(i+1, 8) + ".WAV'\n")
    }
    this.setState({listtxt: listtxt});
    this.arrayToElement(this.state.listtxt, "outfile");
  }

  arrayToElement = (array, element, newline = "") => {
      this.setState({[element]: ""});
      if(array) {
          array.forEach(line => {
            let newelement = this.state[element] + line + newline
            this.setState({[element]: newelement});
          });
      }
  }

  displayCmd = (data) => {
      let channelsArray = [];
      if(this.state.channels !== "") {
          channelsArray = this.state.channels.split(",");
          for (let i in channelsArray) {
              channelsArray[i] = parseInt(channelsArray[i], 10);
          }
      }
      let cmd = []
      cmd.push("ffmpeg -f concat -safe 0 -i <( ");
      let listtxt = this.state.listtxt;
      listtxt.forEach(item => {
        cmd.push("echo \"" + item.replace("\n", "") + "\"; ");
      });
      cmd.push(") ");
      for (let i = 0; i < data[1]; i++) {
          if(channelsArray.length === 0 || channelsArray.includes(i+1)) {
            cmd.push("-map_channel 0.0." + i + " \"" + parseOSPath(this.state.outpath) + pad(i+1, 2) + ".wav\" ");
          }
      }
      this.setState({cmd: cmd});
      this.arrayToElement(this.state.cmd, "outcmd", "\\\n");
      this.arrayToElement(this.state.cmd, "outcmd2");
  }

  render() {
    return (
      <div className="app">
        <h1>X-Live Tools</h1>
        <h2>Convert X-Live files to separate wave files</h2>
        <p>Select your SE_LOG.BIN to extract all data</p>
        <Form
          readFile={this.readFile}
        />
        <h3>Data SD A</h3>
        <p dangerouslySetInnerHTML={{__html: this.state.outputa}}></p>
        <h3>Data SD B</h3>
        <p dangerouslySetInnerHTML={{__html: this.state.outputb}}></p>
        <h4>list.txt contents</h4>
        <code><pre>{this.state.outfile}</pre></code>
        <h4>ffmpeg command</h4>
        <code><pre>{this.state.outcmd}</pre></code>
        <button onClick={this.handleCopy}>Copy</button>
        <h4>ffmpeg command (windows safe)</h4>
        <code className="wincmd"><pre>{this.state.outcmd2}</pre></code>
        <button onClick={this.handleCopy2}>Copy</button>
      </div>
    )
  }
}

export default App;
