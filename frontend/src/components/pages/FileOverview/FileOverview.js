import React, {Component} from 'react';
import FileListItem from "./FileListItem";
import "./FileOverview.css"

import videofiles from "../../../data/videofiles.json";


class FileOverview extends Component {

    state = {
        fileListItems: []
    }

    componentDidMount() {
        let files = videofiles.files;
        console.log(files);
        let fileListItems = [];
        for(const f of files) {
            console.log(f);
            fileListItems[f.id] = {name: f.name, duration: f.duration};
        }
        this.setState({fileListItems});
    }

    changeName(id, name) {
        // TODO BACKEND
        // BACKEND.changeName(id, name)
        this.fileListItems[id].name = name;
    }

    render() {
        let fileListItemComponents = this.state.fileListItems.map((e, id) => <FileListItem id={id} name={e.name} duration={e.duration} changeName={this.changeName} />);
        // let test = this.fileListItems[1];
        // console.log("****************");
        // console.log(test);
        // test = <FileListItem id={1} name={test.name} duration={test.duration} changeName={this.changeName} />;

        return (
            <div className="FileOverview">
                <h1 className={"FileOverviewHeading"}>File Overview</h1>
                <div className="FileOverviewList">

                    {fileListItemComponents}
                </div>
            </div>
        );
    }
}

export default FileOverview;