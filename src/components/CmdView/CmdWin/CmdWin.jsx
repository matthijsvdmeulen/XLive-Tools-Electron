import React, { Component } from 'react'

import Cmd from '../Cmd/Cmd'

import { list } from "../../ListView/List/List"

export default class CmdWin extends Component {
  render() {
    let cmd = [];

    let listtxt = list(this.props.logdata, this.props.formdata).split("\n");
    listtxt.pop();
    cmd.push("( \n");
    listtxt.forEach(item => {
      cmd.push("@echo " + item.replace("\n", "") + "\n");
    });
    cmd.push(") > list.txt \n");
    cmd.push("ffmpeg -f concat -safe 0 -i list.txt ");

    this.props.cmd.forEach(line => {
      cmd.push(line);
    });

    cmd.push("\ndel list.txt")

    return (
      <div>
        <Cmd
          title="ffmpeg command (windows safe)"
          cmd={cmd}
          class="wincmd"
          newline=""
        />
      </div>
    )
  }
}
