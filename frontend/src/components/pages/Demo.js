import React, { Component } from "react";
import TrackingEditor from "./trackingEditor/TrackingEditor";
class Demo extends Component {
  render() {
    return (
      <div className="Demo full-page">
        <TrackingEditor demo={true} startFrame={1} />
      </div>
    );
  }
}

export default Demo;
