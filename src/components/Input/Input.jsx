import React from "react";
import './input.scss';

// Generic input field
class Input extends React.Component {
  render() {
    return (
      <div className='input'>
        <label
          className="input__label"
          htmlFor={this.props.name}
        >{this.props.label}</label>
        {this.props.type === "file" &&
        <div className="input__filediv">
          <input
            className="input__field"
            type={ this.props.type }
            name={ this.props.name }
            placeholder={ this.props.placeholder }
            onChange={this.props.onChange}
            webkitdirectory="true"
          />
        </div>}
        {this.props.type !== "file" &&
          <input
            className="input__field"
            type={ this.props.type }
            name={ this.props.name }
            placeholder={ this.props.placeholder }
            value={this.props.value}
            onChange={this.props.onChange}
            autoComplete='false'
          />
        }
      </div>
    )
  }

}

export default Input;