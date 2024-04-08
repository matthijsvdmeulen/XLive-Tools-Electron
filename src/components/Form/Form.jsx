import React from "react";

import "./form.scss";

import Input from "../Input/Input"
import { parseLogdata, b64toBlob, scnFileReader } from "../../utilities/Utilities";

class Form extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      logdata: [],
      scn: {},
      outpath: ""
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleScnFileChange = this.handleScnFileChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

  }

  componentDidMount() {

    const testBlob = "yaGjUhAAAACAuwAAyaGjUgMAAAABAAAAADTxCADA/z8AwP8/AMATDwAAAAAAwP8/AMD/PwDA/z8AoGcYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQrXwFwOOaACAymwAgP50AIGydACCZnQAgxp0AIAKeACAgngAgiZ4AIKeeACBpoAAglqAAILSgACDSoAAgDqEAICyhACCkoQAg0aEAIO+hACANogAgK6IAIKOiACDQogAQ76IAIAyjACAqowAgwKMAIM+jACD8owAgHaQAIDikACD4pwAgJagAIEOoACBhqAAgyqgAIOioACAGqQAgJKkAIEKpACDJqQAg56kAEPepACAUqgAgMqoAIF+qACDXqgCw+6oAIBOrACAxqwCQV6sAIG2rACD0qwAgEqwAIDCsAIBUrAAgbKwAIDyvACBarwAgeK8AIP+vACAssAAglbAAIA2xABAvsQCQWrEAIHaxACCUsQAg/bEAIBuyACBIsgAgZrIAIGWzAKCHswAgobMAIBm0ACA3tACQYLQAIIK0ACCgtAAgGLUAIDa1ACBjtQAggbUAIJ+1ACBAugAgXroAIHy6ACCaugAgx7oAID+7ACBduwAge7sAIJm7ACDGuwAg5LsAIE28ACBrvAAgibwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="

    // b64toBlob(testBlob).then(res => this.readFile(res));
    this.readFile(b64toBlob(testBlob));

  }

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

  handleScnFileChange(event) {
    let files = event.target.files;
    let reader = new FileReader();
    reader.onload = e => {
      this.setState({scn: scnFileReader(e.target.result)});
    };
    reader.readAsText(files[0]);
  }

  // Read a given file, and print the output to the given element, sdnumber is not extracted from logfile, just based on order of opening
  readFile = file => {
    let reader = new FileReader();
    reader.onload = e => {
        // Extract array of data from binary data from the logfile
        let session = parseLogdata(e.target.result);

        let filepath = "";
        if(file.path) {
          filepath = file.path;
        } else if (file.webkitRelativePath) {
          filepath = file.webkitRelativePath;
        }
        let folderpath = filepath.split("SE_LOG.BIN")[0]
        session.folder = folderpath

        session.outpath = this.props.outpath;
        session.channels = this.props.channels;

        let logdata = this.state.logdata;
        logdata.push(session);
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

  //Function that registers a user & logs in after registration
  handleSubmit(event) {
    event.preventDefault();

    // if(this.state.logdata.value === []) {
    //   console.log('No file selected');
    //   // this.setState({outputa: 'No file selected'});
    //   return;
    // }

    this.props.processForm(this.state);
  }

  render() {
    let logdata = this.state.logdata;
    let output = [];
    logdata.forEach(session => {
      output[session.SDNumber] = true;
    });

    let view2ndFileInput = false;
    if(output[1] ^ output[2]) {
      view2ndFileInput = true
    }

    return (
      <form className="form" onSubmit={this.handleSubmit}>
        <Input
          name="filea"
          type="file"
          directory="true"
          onChange={this.handleFileChange}
          label={view2ndFileInput ? "SD card A" : "SD card(s)"}
          />
        <Input
          name="scnfile"
          type="file"
          onChange={this.handleScnFileChange}
          label="X32 Scene file (optional)"
          />
        <Input
          name="outpath"
          type="text"
          value={this.state.outpath}
          onChange={this.handleChange}
          label="Path to output final stems"
          placeholder="If left empty will use script directory"
          />
        <input type="submit" value="Load" />
      </form>
    );
  }
}

export default Form;