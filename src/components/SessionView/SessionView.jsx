import React from 'react'
import { DateTime } from 'luxon';

import Cmd from "../Cmd/Cmd";

import "./sessionview.scss";
import RadioInput from './RadioInput';

class SessionView extends React.Component {

  constructor(props) {
    super(props);

    let channels = [];
    for(let i = 0; i < props.session.channelAmount; i++) {
      channels.push(true);
    }

    this.state = {
      channels: channels,
      codec: "pcm_s16le"
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleRadio = this.handleRadio.bind(this);
    this.handleChannels = this.handleChannels.bind(this);
    this.handleTab = this.handleTab.bind(this);
  }

  handleChange(event) {
    const name = event.target.name;
    let channels = this.state.channels;
    channels[name] = event.target.checked;
		this.setState({
			channels: channels
		});
  }

  handleRadio(event) {
		this.setState({
			codec: event.target.value
		});
  }

  handleChannels(event) {
    let channels = [];
    if(event.currentTarget.name === "all" + this.props.session.sessionID) {
      for(let i = 0; i < this.props.session.channelAmount; i++) {
        channels.push(true);
      }
    }
    if(event.currentTarget.name === "clr" + this.props.session.sessionID) {
      for(let i = 0; i < this.props.session.channelAmount; i++) {
        channels.push(false);
      }
    }
    this.setState({
			channels: channels
		});
  }

  handleTab(event) {
    if(document.getElementById(event.currentTarget.name).style.display === "block") {
      document.getElementById(event.currentTarget.name).style.display = "none";
    } else {
      var elements = document.getElementsByClassName("listTab" + this.props.session.sessionID)
      var i;
      for(i = 0; i < elements.length; i++) {
        elements[i].style.display = "none";
      }
      document.getElementById(event.currentTarget.name).style.display = "block";
    }
  }

  render() {
    let data = this.props.session;
    return (
      <details className="session">
        <summary>{data.creationDate.toLocaleString(DateTime.DATE_HUGE) + " " + data.creationDate.toLocaleString(DateTime.TIME_SIMPLE) + " - " + data.sessionID}</summary>
        <ul>
          <li>Folder: {data.folder ? data.folder : data.sessionID}</li>
          <li>Channels: {data.channelAmount}</li>
          <li>Sample Rate: {data.sampleRate}</li>
          <li>Duration: {data.sessionDuration.toFormat("hh:mm:ss.SSS")}</li>
          <li>Source files: {data.fileAmount}</li>
          {data.markersTimestamps.length === 0 ? "" : <li>Markers:</li> }
          {data.markersTimestamps.length === 0 ? "" :
          <ol>
            {data.markersTimestamps.map((take, index) => { return (
              <li key={index}>{take.toFormat("hh:mm:ss.SSS")}</li>
            )})}
          </ol>}
          {data.sessionName ? <li>Session name: {data.sessionName}</li> : "" }
          {data.SDNumber ? <li>SD card number: {data.SDNumber}</li> : "" }
          {data.SDNumber ? <li>Session duration on other card: {data.otherDuration.toFormat("hh:mm:ss.SSS")}</li> : "" }
        </ul>
        <div>
          <button onClick={this.handleChannels} name={"all" + data.sessionID }>ALL</button>
          <button onClick={this.handleChannels} name={"clr" + data.sessionID}>CLR</button>
        </div>
        <ul className="channelsList">
          {[...Array(data.channelAmount)].map((x, i) =>
            <li key={i}>
              <input type="checkbox" name={i} id={i + data.sessionID + data.SDNumber} checked={this.state.channels[i]} onChange={this.handleChange}/>
              <label htmlFor={i + data.sessionID + data.SDNumber}>{i+1}</label>
            </li>
          )}
        </ul>
        <div >
          <RadioInput name={"codec" + data.sessionID + data.SDNumber} value="pcm_s24le" label="24bit PCM" codec={this.state.codec} onChange={this.handleRadio}/>
          <RadioInput name={"codec" + data.sessionID + data.SDNumber} value="pcm_s16le" label="16bit PCM" codec={this.state.codec} onChange={this.handleRadio}/>
          <RadioInput name={"codec" + data.sessionID + data.SDNumber} value="libmp3lame -b:a 320k" label="320k MP3" codec={this.state.codec} onChange={this.handleRadio}/>
        </div>
        <div>
          <button onClick={this.handleTab} name={"unix" + data.sessionID + data.SDNumber}>Unix</button>
          <button onClick={this.handleTab} name={"win" + data.sessionID + data.SDNumber}>Win</button>
        </div>

        <Cmd
          title="ffmpeg command"
          session={this.props.session}
          outpath={this.props.outpath}
          channels={this.state.channels}
          codec={this.state.codec}
          os="unix"
        />
        <Cmd
          title="ffmpeg command (windows safe)"
          session={this.props.session}
          outpath={this.props.outpath}
          channels={this.state.channels}
          codec={this.state.codec}
          os="win"
        />

      </details>
    )
  }
}

export default SessionView;