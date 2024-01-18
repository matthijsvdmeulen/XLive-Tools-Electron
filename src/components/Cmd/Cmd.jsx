import React, { Component } from 'react'

import "./cmd.scss";

import { cmd } from "../../utilities/Utilities"

export default class Cmd extends Component {

  constructor(props) {
    super(props);

    this.handleCopy = this.handleCopy.bind(this);
  }

  handleCopy() {
    navigator.clipboard.writeText(this.arrayToElement(this.props.cmd))
  }

  arrayToElement = (array) => {
    let newelement = "";
    array.forEach(line => {
      newelement = newelement + line;
    });
    return newelement;
  }

  render() {
    let session = this.props.session;
    let os = this.props.os;
    let outpath = this.props.outpath;
    let channels = this.props.channels;

    return (
      <div style={{display: "none"}} className={"cmdItem listTab" + session.sessionID} id={os + session.sessionID}>
        <h4>{this.props.title}</h4>
        <code><pre>{this.arrayToElement(cmd(session, os, outpath, channels))}</pre></code>
        <button onClick={this.handleCopy}>Copy</button>
      </div>
    )
  }
}
