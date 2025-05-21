import React, { Component } from "react";
import FileListItem from "./FileListItem";
import "./GameOverview.css";
import IconButton from "@material-ui/core/IconButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fabric } from "fabric";
import {
  faPlus,
  faExclamationTriangle,
  faInfoCircle,
  faTrash,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";

class FileOverview extends Component {
  constructor(props) {
    super(props);
    this.fileInput = React.createRef();
    this.isGameSelected = false;
    this.isVideoSelected = false;
  }

  state = {
    fileListItems: [],
    uploadExpanded: false,
    firstTime: true,
    fileSelectionVisible: false,
    errorMessage: "",
    infoMessage:
      "Please upload the mandatory video file and processed players file. Homographies, processed ball and log files are optional.",
    selectedFiles: [],
    requiredFilesUploaded: false,
  };

  fileInput;

  fileHandler = async (event) => {
    const files = Array.from(event.target.files);

    // Check for duplicate files
    const newFiles = files.filter(
      (file) => !this.state.selectedFiles.find((f) => f.name === file.name),
    );

    if (newFiles.length === 0) {
      this.setState({
        errorMessage:
          "Error: Duplicate files detected. Please select different files.",
      });
      return;
    }

    this.setState(
      (prevState) => ({
        selectedFiles: [...prevState.selectedFiles, ...newFiles],
        errorMessage: "",
      }),
      this.checkRequiredFiles,
    );
  };

  checkRequiredFiles = () => {
    const { selectedFiles } = this.state;
    const tempProcessedPlayers = selectedFiles.find(
      (file) => file.name === "processed_players.csv",
    );
    const tempProcessedBallTracks = selectedFiles.find(
      (file) => file.name === "processed_ball.csv",
    );
    const tempVideo = selectedFiles.find((file) =>
      file.name.match(/\.(mp4|avi|mov|wmv)$/i),
    );

    const requiredFilesUploaded = tempProcessedPlayers && tempVideo;

    if (!requiredFilesUploaded) {
      this.setState({
        errorMessage:
          "Please make sure to upload at least the video file and processed_players.csv.",
        infoMessage: "",
        requiredFilesUploaded: false,
      });
    } else if (!tempProcessedBallTracks) {
      this.setState({
        errorMessage: "",
        infoMessage:
          "Files uploaded successfully! Is it intentional not uploading processed_ball.csv?",
        requiredFilesUploaded: true,
      });
    } else {
      this.setState({
        errorMessage: "",
        infoMessage: "Files uploaded successfully!",
        requiredFilesUploaded: true,
      });
    }
  };

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

        const posterSrc = canvas.toDataURL({
          format: "jpeg",
          quality: 1,
        });
        resolve(posterSrc);
      });

      videoElement.addEventListener("error", () => {
        reject(new Error("Failed to load video file"));
      });
    });
  };

  changeName = (id, name) => {
    this.setState((prevState) => {
      let updatedFileListItems = [...prevState.fileListItems];
      updatedFileListItems[id].name = name;
      return { fileListItems: updatedFileListItems };
    });
  };

  changeNotes = (id, notes) => {
    this.setState((prevState) => {
      let updatedFileListItems = [...prevState.fileListItems];
      updatedFileListItems[id].notes = notes;
      return { fileListItems: updatedFileListItems };
    });
  };

  delete = (id) => {
    this.setState((prevState) => {
      let updatedFileListItems = [...prevState.fileListItems];
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

  fileSelectionHandler = (event) => {
    const files = event.target.files;
  };

  deleteSelectedFile = (fileName) => {
    this.setState(
      (prevState) => ({
        selectedFiles: prevState.selectedFiles.filter(
          (file) => file.name !== fileName,
        ),
      }),
      this.checkRequiredFiles,
    );
  };

  confirmUpload = async () => {
    const { selectedFiles } = this.state;

    let tempProcessedPlayers = selectedFiles.find(
      (file) => file.name === "processed_players.csv",
    );
    let tempProcessedBallTracks = selectedFiles.find(
      (file) => file.name === "processed_ball.csv",
    );
    let tempHomographies = selectedFiles.find(
      (file) => file.name === "homographies.json",
    );
    let tempLog = selectedFiles.find((file) => file.name === "log.txt");
    let tempVideo = selectedFiles.find((file) =>
      file.name.match(/\.(mp4|avi|mov|wmv)$/i),
    );
    let tempFieldSize = selectedFiles.find(
      (file) => file.name === "homographiesoptimized_field_size.json",
    );
    let tempFilterBoxes = selectedFiles.find(
      (file) => file.name === "homographies_filter_boxes.json",
    );

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
      tempProcessedBallTracks
        ? readCSV(tempProcessedBallTracks, "processedBallTracks")
        : Promise.resolve(null),
      tempHomographies
        ? readJson(tempHomographies, "homographies")
        : Promise.resolve(null),
      tempLog ? readCSV(tempLog, "log") : Promise.resolve(null),
      tempFieldSize
        ? readJson(tempFieldSize, "fieldSize")
        : Promise.resolve(null),
      tempFilterBoxes
        ? readJson(tempFilterBoxes, "filterBoxes")
        : Promise.resolve(null),
    ])
      .then((results) => {
        this.setState((prevState) => {
          const newFileListItem = {
            videoName: tempVideo.name,
            duration: videoDuration,
            processedPlayers: tempProcessedPlayers,
            processedBallTracks: tempProcessedBallTracks,
            homographies: tempHomographies,
            filterBoxes: tempFilterBoxes,
            log: tempLog,
            video: tempVideo,
            fieldSize: tempFieldSize,
          };
          results.forEach((result) => {
            if (result) {
              newFileListItem[result.key] = result.content;
            }
          });
          return {
            fileListItems: [...prevState.fileListItems, newFileListItem],
            selectedFiles: [], // Clear selected files after confirmation
            infoMessage: "Files uploaded and processed successfully!",
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

    let fileListItemComponents = this.state.fileListItems.map((e, id) =>
      e ? (
        <FileListItem
          key={id}
          videoName={e.videoName}
          duration={e.duration}
          notes={e.log}
          processedPlayers={e.processedPlayers}
          video={e.video}
          processedBallTracks={e.processedBallTracks}
          // Enable once filterBoxes data is correct, to pass filterBoxes to refinement
          // filterBoxes={e.filterBoxes}
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
            <h1 className={"FileOverviewHeading"}>File Overview</h1>

            <div className="file-upload-container">
              <label className="file-upload" for="file-upload">
                Upload Files
              </label>

              <input
                id="file-upload"
                type="file"
                ref={this.fileInput}
                name="file"
                multiple
                onChange={this.fileHandler}
              />
            </div>
          </div>
          {this.state.selectedFiles.length > 0 && (
            <div className="selected-files-list">
              <div>Uploaded Files:</div>
              <ul>
                {this.state.selectedFiles.map((file, index) => (
                  <li key={index}>
                    {file.name}
                    <IconButton
                      size="small"
                      variant="contained"
                      aria-label="delete file"
                      onClick={() => this.deleteSelectedFile(file.name)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </IconButton>
                  </li>
                ))}
              </ul>
              <IconButton
                size="medium"
                variant="contained"
                aria-label="confirm upload"
                color="default"
                onClick={this.confirmUpload}
                disabled={!this.state.requiredFilesUploaded}
              >
                <FontAwesomeIcon icon={faUpload} />
                Confirm Upload
              </IconButton>
            </div>
          )}
          {fileListItemComponents}
        </div>
      </div>
    );
  }
}

export default FileOverview;
