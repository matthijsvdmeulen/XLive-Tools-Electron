import React, { Component } from 'react'

import Cmd from '../Cmd/Cmd'

import { list } from "../../ListView/List/List"

export default class CmdUnix extends Component {
  render() {
    let cmd = [];
    cmd.push("ffmpeg -f concat -safe 0 -i <( \\\n");
    let listtxt = list(this.props.session).split("\n");
    listtxt.pop();
    listtxt.forEach(item => {
      cmd.push("echo \"" + item.replace("\n", "") + "\"; \\\n");
    });
    cmd.push(") \\\n");

    this.props.cmd.forEach(line => {
      cmd.push(line + "\\\n");
    });

    return (
      <div>
        <Cmd
          title="ffmpeg command"
          cmd={cmd}
        />
      </div>
    )
  }
}
