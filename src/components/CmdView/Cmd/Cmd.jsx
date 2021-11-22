import React, { Component } from 'react'

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
    return (
      <div>
        <h4>{this.props.title}</h4>
        <code className={this.props.class}><pre>{this.arrayToElement(this.props.cmd)}</pre></code>
        <button onClick={this.handleCopy}>Copy</button>
      </div>
    )
  }
}
