import React, { Component } from 'react'

import { parseOSPath, pad } from '../../utilities/Utilities';

import CmdUnix from './CmdUnix/CmdUnix';
import CmdWin from './CmdWin/CmdWin';

export default class CmdView extends Component {

  render() {
    let session = this.props.session;
    let outpath = this.props.outpath;
    let channels = this.props.channels;

    let channelsArray = [];
    if(channels && channels !== "") {
        channelsArray = channels.split(",");
        for (let i in channelsArray) {
            channelsArray[i] = parseInt(channelsArray[i], 10);
        }
    }

    let cmd = []

    for (let i = 0; i < session.channelAmount; i++) {
        if(channelsArray.length === 0 || channelsArray.includes(i+1)) {
          cmd.push("-map_channel 0.0." + i + " \"" + parseOSPath(outpath ? outpath : "") + pad(i+1, 2) + ".wav\" ");
        }
    }

    return (
      <div>
        <CmdUnix
          cmd={cmd}
          session={this.props.session}
        />
        <CmdWin
          cmd={cmd}
          session={this.props.session}
        />
      </div>
    )
  }
}
