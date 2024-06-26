import React from "react";

import './app.scss';

import Form from "./components/Form/Form";
import SessionView from "./components/SessionView/SessionView";

class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      logdata: [],
      scn: {},
      outpath: ""
    };

    this.processForm = this.processForm.bind(this);
  }

  processForm(formdata) {
    let logdata = formdata.logdata;
    logdata.sort((a, b) => {
      if(a.creationDate < b.creationDate) {
        return -1;
      }
      if(a.creationDate > b.creationDate) {
        return 1;
      }
      return 0;
    });
    this.setState({outpath: formdata.outpath});
    this.setState({logdata: logdata});
    this.setState({scn: formdata.scn});
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
        {this.state.logdata.length > 0 && this.state.logdata.map((session, index) => {
          return (
            <SessionView
              session={session}
              scn={this.state.scn}
              outpath={this.state.outpath}
              key={index}
            />
          )
        })}
      </div>
    )
  }
}

export default App;
