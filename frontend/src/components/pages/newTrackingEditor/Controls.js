import React, { useRef, useState, useEffect } from "react";
import "./NewTrackingEditor.css";
import {
  FormGroup,
  Switch,
  FormControlLabel,
  Button,
  Box,
  Typography,
} from "@mui/material";
import TextField from "@mui/material/TextField";

const Controls = ({
  isShowingAnnotation,
  handleDisplayingAnnotation,
  isShowingBox,
  handleDisplayingBox,
  handleAddPlayer,
  handleMultiSelectMerge,
  trailsEnabled,
  videoElement,
  handleEnablingTrails,
  trailFrameNumber,
  setTrailFrameNumber,
  drawBoundingBoxes,
  frameNumber,
  DownloadButton,
  annotations,
  video,
}) => {
  return (
    <div className="controls">
      <Box id="tools-container" sx={{ display: "flex", gap: "10px" }}>
        <div>Show Annotation:</div>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={isShowingAnnotation}
                onChange={handleDisplayingAnnotation}
              />
            }
          />
        </FormGroup>
        <div>Show Player Box:</div>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch checked={isShowingBox} onChange={handleDisplayingBox} />
            }
          />
        </FormGroup>
        <Button
          data-testid="add-player-button"
          variant="contained"
          onClick={handleAddPlayer}
        >
          Add player
        </Button>
        <Button
          data-testid="merge-button"
          variant="contained"
          onClick={handleMultiSelectMerge}
        >
          Merge
        </Button>
        <Typography sx={{ marginLeft: "10px" }}>Trails </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={trailsEnabled}
                disabled={!videoElement?.paused}
                onChange={handleEnablingTrails}
              />
            }
          />
        </FormGroup>
        <Typography sx={{ marginLeft: "10px" }}>Trail frames: </Typography>
        <TextField
          sx={{ bgcolor: "white", marginLeft: "10px", width: "80px" }}
          value={trailFrameNumber}
          type="number"
          onChange={(event, val) => setTrailFrameNumber(event.target.value)}
        />
        <div className="tests">
          <Button
            data-testid="from-annotation"
            className="tests"
            onClick={() => drawBoundingBoxes(frameNumber)}
          >
            draw players from annotation
          </Button>
        </div>
        <DownloadButton players={annotations} video={video} />
      </Box>
    </div>
  );
};

export default Controls;
