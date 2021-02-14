import React, {Component} from 'react';
import './TrackingEditor.css';


function TrackList(props) {
    console.log("TrackList props.children");
    console.log(props.children);
    return (
        <div className="TrackList" style={{backgroundColor: 'rgba(0, 0, 0, 0.7)'}} >
            {props.children}
        </div>
    );

}

export default TrackList;