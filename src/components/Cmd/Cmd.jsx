import React, { Component } from 'react'

import "./cmd.scss";

import { cmd } from "../../utilities/Utilities"

export default class Cmd extends Component {

  constructor(props) {
    super(props);

    this.handleCopy = this.handleCopy.bind(this);
  }

  handleCopy() {
    navigator.clipboard.writeText(this.getCmd())
  }

  arrayToElement = (array) => {
    let newelement = "";
    array.forEach(line => {
      newelement = newelement + line;
    });
    return newelement;
  }

  getCmd() {
    let session = this.props.session;
    let os = this.props.os;
    let outpath = this.props.outpath;
    let channels = this.props.channels;
    let codec = this.props.codec
    return this.arrayToElement(cmd(session, os, outpath, channels, codec))
  }

  render() {


    return (
      <div
        style={{display: "none"}}
        className={"cmdItem listTab" + this.props.session.sessionID + this.props.session.SDNumber}
        id={this.props.os + this.props.session.sessionID + this.props.session.SDNumber}
      >
        <h4>{this.props.title}</h4>
        <code><pre>{this.getCmd()}</pre></code>
        <button onClick={this.handleCopy}>Copy</button>
      </div>
    )
  }
}
