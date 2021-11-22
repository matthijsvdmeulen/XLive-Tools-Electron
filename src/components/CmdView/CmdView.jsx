import React, { Component } from 'react'

import { parseOSPath, pad } from '../../utilities/Utilities';

import { list } from "../ListView/List/List"

export default class CmdView extends Component {

  constructor(props) {
    super(props);

    this.handleCopy = this.handleCopy.bind(this);
    this.handleCopy2 = this.handleCopy2.bind(this);
  }

  handleCopy(event) {
    navigator.clipboard.writeText(this.state.outcmd)
  }

  handleCopy2(event) {
    navigator.clipboard.writeText(this.state.outcmd2)
  }

  arrayToElement = (array, newline = "") => {
    let newelement = "";
    array.forEach(line => {
      newelement = newelement + line + newline;
    });
    return newelement;
  }

  render() {
    let logdata = {}
    this.props.logdata.forEach(sd => {
      logdata = sd;
    });
    let formdata = this.props.formdata;

    let channelsArray = [];
    if(formdata.channels && formdata.channels !== "") {
        channelsArray = formdata.channels.split(",");
        for (let i in channelsArray) {
            channelsArray[i] = parseInt(channelsArray[i], 10);
        }
    }

    let cmd = []
    cmd.push("ffmpeg -f concat -safe 0 -i <( ");
    let listtxt = list(this.props.logdata, this.props.formdata).split("\n");
    listtxt.pop();
    listtxt.forEach(item => {
      cmd.push("echo \"" + item.replace("\n", "") + "\"; ");
    });
    cmd.push(") ");
    for (let i = 0; i < logdata.channelAmount; i++) {
        if(channelsArray.length === 0 || channelsArray.includes(i+1)) {
          cmd.push("-map_channel 0.0." + i + " \"" + parseOSPath(formdata.outpath ? formdata.outpath : "") + pad(i+1, 2) + ".wav\" ");
        }
    }
    let outcmd = this.arrayToElement(cmd, "\\\n");
    let outcmd2 = this.arrayToElement(cmd);

    return (
      <div>
        <h4>ffmpeg command</h4>
        <code><pre>{outcmd}</pre></code>
        <button onClick={this.handleCopy}>Copy</button>
        <h4>ffmpeg command (windows safe)</h4>
        <code className="wincmd"><pre>{outcmd2}</pre></code>
        <button onClick={this.handleCopy2}>Copy</button>
      </div>
    )
  }
}
