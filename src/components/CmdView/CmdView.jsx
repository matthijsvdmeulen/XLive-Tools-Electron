import React, { Component } from 'react'

import { parseOSPath, pad } from '../../utilities/Utilities';

import CmdUnix from './CmdUnix/CmdUnix';
import CmdWin from './CmdWin/CmdWin';

export default class CmdView extends Component {

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

    for (let i = 0; i < logdata.channelAmount; i++) {
        if(channelsArray.length === 0 || channelsArray.includes(i+1)) {
          cmd.push("-map_channel 0.0." + i + " \"" + parseOSPath(formdata.outpath ? formdata.outpath : "") + pad(i+1, 2) + ".wav\" ");
        }
    }

    return (
      <div>
        <CmdUnix
          cmd={cmd}
          logdata={this.props.logdata}
          formdata={this.props.formdata}
        />
        <CmdWin
          cmd={cmd}
          logdata={this.props.logdata}
          formdata={this.props.formdata}
        />
      </div>
    )
  }
}
