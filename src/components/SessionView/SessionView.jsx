import React from 'react'
import { DateTime } from 'luxon';

import ListView from "../ListView/ListView";
import CmdView from "../CmdView/CmdView";

import "./sessionview.scss";

class SessionView extends React.Component {
  render() {
    let data = this.props.session;
    return (
      <div className="session">
        <h3>{data.creationDate.toLocaleString(DateTime.DATETIME_FULL)}</h3>
        <ul>
          <li>Folder: {data.folder ? data.folder : data.sessionID}</li>
          <li>Channels: {data.channelAmount}</li>
          <li>Sample Rate: {data.sampleRate}</li>
          <li>Creation Date: {data.creationDate.toString()}</li>
          <li>Duration: {data.sessionDuration.toFormat("hh:mm:ss:SSS")}</li>
          <li>Source files:</li>
          <ol>
            {data.filesDuration.map((take, index) => { return (
              <li key={index}>{take.toFormat("hh:mm:ss:SSS")}</li>
            )})}
          </ol>
          <li>Markers:</li>
          <ol>
            {data.markersTimestamps.length === 0 ? "none" : data.markersTimestamps.map((take, index) => { return (
              <li key={index}>{take.toFormat("hh:mm:ss:SSS")}</li>
            )})}
          </ol>
          <li>Session name: {data.sessionName ? data.sessionName : "none"}</li>
          <li>SD card number: {data.SDNumber ? data.SDNumber : "none"}</li>
          <li>Session duration on other card: {data.SDNumber ? data.otherDuration.toFormat("hh:mm:ss:SSS") : "none"}</li>
        </ul>
        <ListView
          session={this.props.session}
        />
        <CmdView
          session={this.props.session}
        />
      </div>
    )
  }
}

export default SessionView;