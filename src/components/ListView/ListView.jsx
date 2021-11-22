import React, { Component } from 'react'

import { parseOSPath, pad } from "../../utilities/Utilities"

export default class ListView extends Component {

  render() {
    let formdata = this.props.formdata;
    let logdata = this.props.logdata;
    let inputPath = [formdata.inpatha, formdata.inpathb];
    let list = "";

    logdata.forEach((sd, index) => {
      for (let i = 0; i < sd.fileAmount; i++) {
        list = list + "file '" +
        parseOSPath(logdata[0] ? inputPath[index] : inputPath[index-1]) +
        pad(i+1, 8) + ".WAV'\n"
      }
    });
    return (
      <div>
        <code><pre>{list}</pre></code>
      </div>
    )
  }
}
