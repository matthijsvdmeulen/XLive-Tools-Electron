import React from "react";

import './app.scss';

import { dosDateTimeToString, dosToID, sampleArrayToTimestampArray, samplesToTimestamp, b64toBlob} from "./utilities/Utilities"

import Form from "./components/Form/Form";
import LogView from "./components/LogView/LogView";
import ListView from "./components/ListView/ListView";
import CmdView from "./components/CmdView/CmdView";

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
    let char = dataview.getUint8((i+1552), true)
    if(char !== 0) { stringbytes.push(char) }
  }
  output[9] = String.fromCharCode.apply(null, stringbytes);

  output[10] = dataview.getUint32(1572, true);
  output[11] = dataview.getUint32(1576, true);
  return output;
}

const convertLogdata = logdata => {
  return {
    sessionID: dosToID(logdata[0]),
    channelAmount: logdata[1],
    sampleRate: logdata[2],
    creationDate: dosDateTimeToString(logdata[3]),
    fileAmount: logdata[4],
    markerAmount: logdata[5],
    samplesAmount: logdata[6],
    sessionDuration: samplesToTimestamp(logdata[6], logdata[2]),
    filesSamplesAmount: logdata[7],
    filesDuration: sampleArrayToTimestampArray(logdata[7], logdata[2]),
    markersSamples: logdata[8],
    markersTimestamps: sampleArrayToTimestampArray(logdata[8], logdata[2]),
    sessionName: logdata[9],
    SDNumber: logdata[10],
    otherDuration: logdata[11]
  }
}

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      logdata: [],
      formdata: {
        seloga: [],
        selogb: [],
        inpatha: "",
        inpathb: "",
        outpath: "",
        channels: ""
      }
    };

    this.processForm = this.processForm.bind(this);
  }

  componentDidMount() {

    const testBlob = "yaGjUhAAAACAuwAAyaGjUgMAAAABAAAAADTxCADA/z8AwP8/AMATDwAAAAAAwP8/AMD/PwDA/z8AoGcYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQrXwFwOOaACAymwAgP50AIGydACCZnQAgxp0AIAKeACAgngAgiZ4AIKeeACBpoAAglqAAILSgACDSoAAgDqEAICyhACCkoQAg0aEAIO+hACANogAgK6IAIKOiACDQogAQ76IAIAyjACAqowAgwKMAIM+jACD8owAgHaQAIDikACD4pwAgJagAIEOoACBhqAAgyqgAIOioACAGqQAgJKkAIEKpACDJqQAg56kAEPepACAUqgAgMqoAIF+qACDXqgCw+6oAIBOrACAxqwCQV6sAIG2rACD0qwAgEqwAIDCsAIBUrAAgbKwAIDyvACBarwAgeK8AIP+vACAssAAglbAAIA2xABAvsQCQWrEAIHaxACCUsQAg/bEAIBuyACBIsgAgZrIAIGWzAKCHswAgobMAIBm0ACA3tACQYLQAIIK0ACCgtAAgGLUAIDa1ACBjtQAggbUAIJ+1ACBAugAgXroAIHy6ACCaugAgx7oAID+7ACBduwAge7sAIJm7ACDGuwAg5LsAIE28ACBrvAAgibwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="

    b64toBlob(testBlob).then(res => this.readFile(res));

  }

  processForm(formData) {
    this.setState({
      logdata: [],
      formdata: formData,
    });
    this.readFile(formData.seloga[0]);
    this.readFile(formData.selogb[0]);
  }

  // Read a given file, and print the output to the given element, sdnumber is not extracted from logfile, just based on order of opening
  readFile = (file) => {
      let reader = new FileReader();
      reader.onload = e => {
          // Extract array of data from binary data from the logfile
          let convertedLogData = convertLogdata(parseLogdata(e.target.result));

          let logdata = this.state.logdata;
          logdata[convertedLogData.SDNumber] = convertedLogData;
          this.setState({logdata: logdata});
      };
      reader.onerror = e => {
          // Error occurred
          throw e;
      };
      if(typeof file !== "undefined") {
        reader.readAsArrayBuffer(file);
      }
  }

  render() {
    return (
      <div className="app">
        <h1>X-Live Tools</h1>
        <h2>Convert X-Live files to separate wave files</h2>
        <p>Select your SE_LOG.BIN to extract all data</p>
        <Form
          processForm={this.processForm}
        />
        { this.state.logdata.length > 0 &&
        <div>
          <LogView
            logdata={this.state.logdata}
          />
          <ListView
            logdata={this.state.logdata}
            formdata={this.state.formdata}
          />
          <CmdView
            logdata={this.state.logdata}
            formdata={this.state.formdata}
          />
        </div>
        }
      </div>
    )
  }
}

export default App;
