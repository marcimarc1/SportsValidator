import React, {Component} from 'react';
import TrackingEditor from "./trackingEditor/TrackingEditor";
class Demo extends Component {

    render() {
        return (
            <div className="Demo full-page">
                <TrackingEditor video="Demo" />
            </div>
        );
    }
}

export default Demo;