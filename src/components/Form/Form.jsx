import React from "react";

import "./form.scss";

import Input from "../Input/Input"

class Form extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      seloga: [],
      selogb: [],
      inpatha: "",
      inpathb: "",
      outpath: "",
      channels: ""
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

  }

  //Changes value based on change in the input field
  handleChange(event) {
		const name = event.target.name;
		this.setState({
			[name]: event.target.value
		});
	}

  handleFileChange(event) {
		const name = event.target.name;
		this.setState({
			[name]: event.target.files
		});
	}

  //Function that registers a user & logs in after registration
  handleSubmit(event) {
    event.preventDefault();

    if(this.state.seloga.value === '') {
      console.log('No file selected');
      // this.setState({outputa: 'No file selected'});
      return;
    }
    this.props.processForm(this.state);
  }

  render() {
    return (
      <form className="form" onSubmit={this.handleSubmit}>
        <Input
          name="seloga"
          type="file"
          onChange={this.handleFileChange}
          label="SD card A"
          />
        <Input
          name="selogb"
          type="file"
          onChange={this.handleFileChange}
          label="SD card B"
          />
        <Input
          name="inpatha"
          type="text"
          value={this.state.inpatha}
          onChange={this.handleChange}
          label="Path of SD A files"
          placeholder="e.g. E:\X_LIVE\B2A59E2F or ./usb/X_LIVE/B2A59E2F"
          />
        <Input
          name="inpathb"
          type="text"
          value={this.state.inpathb}
          onChange={this.handleChange}
          label="Path of SD B files"
          placeholder="If left empty will use current directory"
          />
        <Input
          name="outpath"
          type="text"
          value={this.state.outpath}
          onChange={this.handleChange}
          label="Path to output final stems"
          placeholder="If left empty will use script directory"
          />
        <Input
          name="channels"
          type="text"
          value={this.state.channels}
          onChange={this.handleChange}
          label="Channels to export"
          placeholder="(comma separated, empty exports all)"
          />
        <input type="submit" value="Load" />
      </form>
    );
  }
}

export default Form;