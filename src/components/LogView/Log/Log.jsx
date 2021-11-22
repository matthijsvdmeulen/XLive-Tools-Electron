import React, { Component } from 'react'

import "./log.scss";

export default class Log extends Component {
  render() {
    let data = this.props.logdata;
    return (
      <div className="log">
        <ul>
          <li>Session ID: {data.sessionID}</li>
          <li>Number of channels recorded: {data.channelsAmount}</li>
          <li>Sample Rate: {data.sampleRate}</li>
          <li>Creation Date: {data.creationDate}</li>
          <li>Number of files (takes) in session: {data.fileAmount}</li>
          <li>Number of markers in session: {data.markerAmount}</li>
          <li>Duration of session on card: {data.sessionDuration}</li>
          <li>Duration of files (takes): {data.filesDuration.toString()}</li>
          <li>Marker timestamps: {data.markersTimestamps.toString()}</li>
          <li>Session name: {data.sessionName}</li>
          <li>SD card number: {data.SDNumber}</li>
          <li>Session duration on other card: {data.otherDuration}</li>
        </ul>
      </div>
    )
  }
}
