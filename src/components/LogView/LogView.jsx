import React from 'react'
import Log from './Log/Log';

import "./logview.scss";

class LogView extends React.Component {
  render() {
    return (
      <div>
        {this.props.logdata.map((log, index) => {
          return (
            <div key={index}>
              <h3>Data SD {index}</h3>
              <Log
                logdata={log}
              />
            </div>
          )
        })}
      </div>
    )
  }
}

export default LogView;