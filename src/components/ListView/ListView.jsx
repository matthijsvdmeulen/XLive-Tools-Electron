import React, { Component } from 'react'

import { list } from './List/List'

export default class ListView extends Component {

  render() {

    return (
      <div>
        <h4>list.txt contents</h4>
        <code>
          <pre>
            {list(this.props.logdata, this.props.formdata)}
          </pre>
        </code>
      </div>
    )
  }
}
