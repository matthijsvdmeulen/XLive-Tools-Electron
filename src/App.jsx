import React from "react";

import './app.scss';

import Form from "./components/Form/Form";
import LogView from "./components/LogView/LogView";
import ListView from "./components/ListView/ListView";
import CmdView from "./components/CmdView/CmdView";

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      logdata: [],
      formdata: {
        logdata: [],
        inpatha: "",
        inpathb: "",
        outpath: "",
        channels: ""
      }
    };

    this.processForm = this.processForm.bind(this);
  }

  processForm(formdata) {
    this.setState({
      logdata: [],
      formdata: formdata,
    });
    let logdata = [];
    formdata.logdata.forEach(log => {
      logdata[log.SDNumber] = log;
    });
    // if(logdata[1]) {
    //   logdata[0] = "";
    // }
    this.setState({logdata: formdata.logdata});
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
