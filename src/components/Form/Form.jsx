import React from "react";

import "./form.scss";

import Input from "../Input/Input"
import { parseLogdata } from "../../utilities/Utilities";
// import { b64toBlob } from "../../utilities/Utilities";

class Form extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      logdata: [],
      inpatha: "",
      inpathb: "",
      outpath: "",
      channels: ""
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

  }

  // componentDidMount() {

  //   const testBlob = "yaGjUhAAAACAuwAAyaGjUgMAAAABAAAAADTxCADA/z8AwP8/AMATDwAAAAAAwP8/AMD/PwDA/z8AoGcYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQrXwFwOOaACAymwAgP50AIGydACCZnQAgxp0AIAKeACAgngAgiZ4AIKeeACBpoAAglqAAILSgACDSoAAgDqEAICyhACCkoQAg0aEAIO+hACANogAgK6IAIKOiACDQogAQ76IAIAyjACAqowAgwKMAIM+jACD8owAgHaQAIDikACD4pwAgJagAIEOoACBhqAAgyqgAIOioACAGqQAgJKkAIEKpACDJqQAg56kAEPepACAUqgAgMqoAIF+qACDXqgCw+6oAIBOrACAxqwCQV6sAIG2rACD0qwAgEqwAIDCsAIBUrAAgbKwAIDyvACBarwAgeK8AIP+vACAssAAglbAAIA2xABAvsQCQWrEAIHaxACCUsQAg/bEAIBuyACBIsgAgZrIAIGWzAKCHswAgobMAIBm0ACA3tACQYLQAIIK0ACCgtAAgGLUAIDa1ACBjtQAggbUAIJ+1ACBAugAgXroAIHy6ACCaugAgx7oAID+7ACBduwAge7sAIJm7ACDGuwAg5LsAIE28ACBrvAAgibwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="

  //   b64toBlob(testBlob).then(res => this.readFile(res));

  // }

  //Changes value based on change in the input field
  handleChange(event) {
		const name = event.target.name;
		this.setState({
			[name]: event.target.value
		});
	}

  handleFileChange(event) {
    let files = event.target.files;
		this.setState({logdata: []});

    Array.from(files).forEach(file => {
      if(file.name === "SE_LOG.BIN") {
        this.readFile(file);
      }
    });
	}

  // Read a given file, and print the output to the given element, sdnumber is not extracted from logfile, just based on order of opening
  readFile = file => {
    let reader = new FileReader();
    reader.onload = e => {
        // Extract array of data from binary data from the logfile
        let logData = parseLogdata(e.target.result);

        let logdata = this.state.logdata;
        logdata.push(logData);
        this.setState({logdata: logdata});

        let filepath = "";
        let outpath = "";
        let topfolder = file.webkitRelativePath.split("/")[0];
        if(file.path) {
          filepath = file.path;
          outpath = filepath.split(topfolder)[0] + topfolder;
        } else {
          filepath = file.webkitRelativePath;
          outpath = topfolder;
        }

        this.setState({outpath: outpath});

        switch (logData.SDNumber) {
          case 1:
            this.setState({inpatha: filepath.split("SE_LOG.BIN")[0]});
            break;

          case 0:
            this.setState({inpatha: filepath.split("SE_LOG.BIN")[0]});
            break;

          case 2:
            this.setState({inpathb: filepath.split("SE_LOG.BIN")[0]});
            break;

          default:
            break;
        }
    };
    reader.onerror = e => {
        // Error occurred
        throw e;
    };
    if(typeof file !== "undefined") {
      reader.readAsArrayBuffer(file);
    }
  }

  //Function that registers a user & logs in after registration
  handleSubmit(event) {
    event.preventDefault();

    if(this.state.logdata.value === []) {
      console.log('No file selected');
      // this.setState({outputa: 'No file selected'});
      return;
    }

    this.props.processForm(this.state);
  }

  render() {
    let logdata = this.state.logdata;
    let output = [];
    logdata.forEach(log => {
      output[log.SDNumber] = true;
    });

    let view2ndFileInput = false;
    if(output[1] ^ output[2]) {
      view2ndFileInput = true
    }

    let view2ndInpath = false;
    if(output[1] || output[2]) {
      view2ndInpath = true;
    }

    return (
      <form className="form" onSubmit={this.handleSubmit}>
        <Input
          type="file"
          onChange={this.handleFileChange}
          label={view2ndFileInput ? "SD card A" : "SD card(s)"}
          />
        { view2ndFileInput &&
        <Input
          type="file"
          onChange={this.handleFileChange}
          label="SD card B"
          />
        }
        <Input
          name="inpatha"
          type="text"
          value={this.state.inpatha}
          onChange={this.handleChange}
          label={view2ndInpath ? "Path of SD A files" : "Path of SD files"}
          placeholder="e.g. E:\X_LIVE\B2A59E2F or ./usb/X_LIVE/B2A59E2F"
          />
        { view2ndInpath &&
        <Input
          name="inpathb"
          type="text"
          value={this.state.inpathb}
          onChange={this.handleChange}
          label="Path of SD B files"
          placeholder="If left empty will use current directory"
          />
        }
        <Input
          name="outpath"
          type="text"
          value={this.state.outpath}
          onChange={this.handleChange}
          label="Path to output final stems"
          placeholder="If left empty will use script directory"
          />
        <Input
          name="channels"
          type="text"
          value={this.state.channels}
          onChange={this.handleChange}
          label="Channels to export"
          placeholder="(comma separated, empty exports all)"
          />
        <input type="submit" value="Load" />
      </form>
    );
  }
}

export default Form;