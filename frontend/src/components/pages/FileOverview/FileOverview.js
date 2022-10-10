import React, {Component} from 'react';
import FileListItem from "./FileListItem";
import "./FileOverview.css"

class FileOverview extends Component {
    render() {
        return (
            <div className="FileOverview">
                File Overview
                <FileListItem/>
                <FileListItem/>
            </div>
        );
    }
}

export default FileOverview;