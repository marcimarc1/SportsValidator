import React, { Component } from "react";
import FileListItem from "./FileListItem";
import "./FileOverview.css";
import IconButton from "@material-ui/core/IconButton";

import videofiles from "../../../data/videofiles.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCheck } from "@fortawesome/free-solid-svg-icons";

class FileOverview extends Component {
  constructor(props) {
    super(props);
    this.fileInput = React.createRef();
  }

  state = {
    fileListItems: [],
    uploadExpanded: false,
    firstTime: true, // used to not trigger any animations when component is mounted
    fileSelectionVisible: false,
  };

  fileInput;

  componentDidMount() {
    // TODO BACKEND: files = BACKEND.getFiles();
    let files = videofiles.files;
    let fileListItems = [];
    for (const f of files) {
      fileListItems[f.id] = {
        name: f.name,
        videoName: f.videoName,
        duration: f.duration,
        notes: f.notes,
      };
    }
    this.setState({ fileListItems });
  }

  changeName = (id, name) => {
    // TODO BACKEND
    // BACKEND.changeName(id, name)
    this.setState((prevState) => {
      let updatedFileListItems = [...prevState.fileListItems]; // shallow copy which is fine here
      updatedFileListItems[id].name = name;
      return { fileListItems: updatedFileListItems };
    });
    // when Backend is added, might make sense to leave the above setState call in the code and just rerender the
    // changed object instead of getting the complete data again and rerendering everything
  };

  changeNotes = (id, notes) => {
    // TODO BACKEND
    //BACKEND.changeNotes(id, notes); then rerender component so that uploaded file shows up in List

    // not really required for rerender because EditTextArea from notes handles that itself, just here to keep the data consistent
    this.setState((prevState) => {
      let updatedFileListItems = [...prevState.fileListItems]; // shallow copy which is fine here
      updatedFileListItems[id].notes = notes;
      return { fileListItems: updatedFileListItems };
    });
  };

  delete = (id) => {
    // TODO BACKEND
    //BACKEND.deleteVideofile(id)
    this.setState((prevState) => {
      let updatedFileListItems = [...prevState.fileListItems]; // shallow copy which is fine here
      updatedFileListItems[id] = undefined;
      return { fileListItems: updatedFileListItems };
    });
  };

  addButtonClicked = () => {
    this.setState(
      (prevState) => ({
        uploadExpanded: !prevState.uploadExpanded,
        firstTime: false,
        fileSelectionVisible: false,
      }),
      () =>
        setTimeout(() => {
          if (this.state.uploadExpanded)
            this.setState({ fileSelectionVisible: true });
        }, 400),
    );
  };

  fileHandler = (event) => {
    event.preventDefault();
    if (this.fileInput.current.files[0]) {
      // TODO BACKEND.upload(file); plus maybe add some checks for file size, type, etc?
      alert(`Selected file - ${this.fileInput.current.files[0].name}`);
    }
  };

  render() {
    let classNameExpansionPostfix = this.state.uploadExpanded
      ? " expanded"
      : this.state.firstTime
        ? ""
        : " unexpanded";
    let classNameFileUploadPostfix = this.state.fileSelectionVisible
      ? ""
      : " hide";

    let fileListItemComponents = this.state.fileListItems.map(
      // ternary operator to catch case where e is undefined
      (e, id) =>
        e ? (
          <FileListItem
            key={id}
            id={id}
            name={e.name}
            videoName={e.videoName}
            duration={e.duration}
            notes={e.notes}
            changeName={this.changeName}
            changeNotes={this.changeNotes}
            delete={this.delete}
          />
        ) : undefined,
    );
    // let test = this.fileListItems[1];
    // console.log("****************");
    // console.log(test);
    // test = <FileListItem id={1} name={test.name} duration={test.duration} changeName={this.changeName} />;

    return (
      <div className="FileOverview">
        <div className="FileOverviewList">
          <div className="FileOverviewHeadingContainer">
            <div
              className={
                "FileOverviewAddButtonContainer" + classNameExpansionPostfix
              }
            >
              <div></div>{" "}
              {/*dummy element so + / x button moves to the right of container with space-between*/}
              <form
                className={"FileInput" + classNameFileUploadPostfix}
                onSubmit={this.fileHandler}
              >
                <input type="file" ref={this.fileInput} name="file" />
                {/*<input type="submit">*/}
                <IconButton
                  className="FileInputCheckmark"
                  type="submit"
                  size="medium"
                  variant="contained"
                  aria-label="upload selected file"
                >
                  <FontAwesomeIcon className="" icon={faCheck} />
                </IconButton>
                {/*</input>*/}
              </form>
              <IconButton
                size="medium"
                variant="contained"
                className={"FileOverviewAddButton"}
                onClick={this.addButtonClicked}
                aria-label="upload new videofile"
              >
                <FontAwesomeIcon
                  className={"PlusIcon" + classNameExpansionPostfix}
                  icon={faPlus}
                />
              </IconButton>
            </div>
            <h1 className={"FileOverviewHeading"}>File Overview</h1>
          </div>

          {fileListItemComponents}
        </div>
      </div>
    );
  }
}

export default FileOverview;
