import React, { Component } from "react";
import FileListItem from "./FileListItem";
import "./FileOverview.css";
import IconButton from "@material-ui/core/IconButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fabric } from "fabric";
import {
  faPlus,
  faCheck,
  faExclamationTriangle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

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
    processedPlayers: null, // State variable for processed_players.csv
    ballTracks: null, // State variable for ball_tracks.csv
    homographies: null, // State variable for homographies.csv
    log: null, // State variable for log.txt
    video: null, // State variable for the video file,
    fieldSize: null, // State variable for the field size
    errorMessage: "", // To store error messages
    infoMessage:
      "Please upload the mandatory video file and processed players file. Ball tracks, homographies, and log files are optional.", // Updated informational message
  };

  fileInput;

  // componentDidMount() {
  //     // TODO BACKEND: files = BACKEND.getFiles();
  //     let files = videofiles.files;
  //     let fileListItems = [];
  //     for(const f of files) {
  //         fileListItems[f.id] = {name: f.name, videoName: f.videoName, duration: f.duration, notes: f.notes};
  //     }
  //     this.setState({fileListItems});
  // }

  //generate a poster to be displayed as file overview
  generatePosterSrc = (videoFile) => {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement("video");
      videoElement.preload = "metadata";
      videoElement.src = window.URL.createObjectURL(videoFile);

      videoElement.addEventListener("canplay", () => {
        const canvas = new fabric.StaticCanvas(null, {
          width: videoElement.width,
          height: videoElement.height,
        });

        const poster = new fabric.Image(videoElement, {
          left: 0,
          top: 0,
          selectable: true,
        });
        canvas.add(poster);
        canvas.renderAll();

        // Convert canvas content to data URL
        const posterSrc = canvas.toDataURL({
          format: "jpeg",
          quality: 1,
        });
        resolve(posterSrc);
      });

      // error handling
      videoElement.addEventListener("error", () => {
        reject(new Error("Failed to load video file"));
      });
    });
  };

  changeName = (id, name) => {
    // TODO BACKEND
    // BACKEND.changeName(id, name)
    this.setState((prevState) => {
      let updatedFileListItems = [...prevState.fileListItems]; // shallow copy which is fine here
      updatedFileListItems[id].name = name;
      return { fileListItems: updatedFileListItems };
    });
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

  fileHandler = async (event) => {
    event.preventDefault();
    const files = Array.from(this.fileInput.current.files);

    let tempProcessedPlayers = null;
    let tempBallTracks = null;
    let tempHomographies = null;
    let tempLog = null;
    let tempVideo = null;
    let tempFieldSize = null;

    // Determine the type of each file
    files.forEach((file) => {
      switch (file.name) {
        case "processed_players.csv":
          tempProcessedPlayers = file;
          break;
        case "ball_tracks.csv":
          tempBallTracks = file;
          break;
        case "homographies.json":
          tempHomographies = file;
          console.log("homographies.json");
          break;
        case "log.txt":
          tempLog = file;
          break;
        case "homographiesoptimized_field_size.json":
          tempFieldSize = file;
        default:
          if (file.name.match(/\.(mp4|avi|mov|wmv)$/i)) {
            tempVideo = file;
          }
          break;
      }
    });

    // Check if the required files are present, and set an error message if not
    if (!tempProcessedPlayers || !tempVideo) {
      this.setState({
        errorMessage:
          "Error: Missing required files. Please make sure to upload at least the video file and processed_players.csv.",
        infoMessage: "",
      });
      return; // Exit the function if required files are missing
    } else {
      this.setState({
        errorMessage: "",
        infoMessage: "Files uploaded successfully!",
      });
    }

    const readCSV = (file, key) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({ key, content: e.target.result });
        };
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });
    };

    const readJson = (file, key) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({ key, content: JSON.parse(e.target.result) });
        };
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });
    };

    let videoDuration = await new Promise((resolve) => {
      const videoElement = document.createElement("video");
      videoElement.preload = "metadata";
      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src);
        resolve(videoElement.duration);
      };
      videoElement.src = window.URL.createObjectURL(tempVideo);
    });

    Promise.all([
      readCSV(tempProcessedPlayers, "processedPlayers"),
      tempBallTracks
        ? readCSV(tempBallTracks, "ballTracks")
        : Promise.resolve(null),
      tempHomographies
        ? readJson(tempHomographies, "homographies")
        : Promise.resolve(null),
      tempLog ? readCSV(tempLog, "log") : Promise.resolve(null),
      tempFieldSize
        ? readJson(tempFieldSize, "fieldSize")
        : Promise.resolve(null),
    ])
      .then((results) => {
        this.setState((prevState) => {
          const newFileListItem = {
            videoName: tempVideo.name,
            duration: videoDuration,
            processedPlayers: tempProcessedPlayers,
            ballTracks: tempBallTracks,
            homographies: tempHomographies,
            log: tempLog,
            video: tempVideo,
            fieldSize: tempFieldSize,
          };

          // Add CSV content to the new object
          results.forEach((result) => {
            if (result) {
              newFileListItem[result.key] = result.content;
            }
          });

          // Update the fileListItems state
          return {
            fileListItems: [...prevState.fileListItems, newFileListItem],
          };
        });
      })
      .catch((error) => {
        console.error("Error reading files:", error);
        this.setState({
          errorMessage: "Error reading uploaded files. Please try again.",
        });
      });
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
            videoName={e.videoName}
            duration={e.duration}
            notes={e.log}
            processedPlayers={e.processedPlayers}
            video={e.video}
            ballTracks={e.ballTracks}
            homographies={e.homographies}
            fieldSize={e.fieldSize}
            log={e.log}
            poster={this.generatePosterSrc(e.video)}
            changeName={this.changeName}
            changeNotes={this.changeNotes}
            delete={this.delete}
          />
        ) : undefined,
    );

    return (
      <div className="FileOverview">
        {this.state.errorMessage && (
          <div className="message-container error-message">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="message-icon"
            />
            {this.state.errorMessage}
          </div>
        )}
        {this.state.infoMessage && (
          <div className="message-container info-message">
            <FontAwesomeIcon icon={faInfoCircle} className="message-icon" />
            {this.state.infoMessage}
          </div>
        )}
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
                <input type="file" ref={this.fileInput} name="file" multiple />
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
