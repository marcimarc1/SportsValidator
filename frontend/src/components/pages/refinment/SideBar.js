import React from "react";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  Grid,
  Paper,
} from "@material-ui/core";

import config from "../../../config.json";
import { saveHomographyAsJsonFile } from "./util";

const SideBar = ({
  watchedFrames,
  onClickFrame,
  onSendUpdates,
  maxHeight,
  homography,
  logFile,
  canvas,
  fieldSize,
}) => {
  return (
    <div className="TrackList" style={{ padding: 15 }}>
      <div>
        {/* "Send Data" Button at the top */}
        <div style={{ marginBottom: "20px" }}>
          <Button
            variant="contained"
            style={{
              backgroundColor: config.general.trackingEditor.color.accent,
              color: config.general.trackingEditor.color.mainText,
            }}
            onClick={onSendUpdates}
            fullWidth
          >
            Send Updates
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              saveHomographyAsJsonFile(
                homography,
                watchedFrames,
                logFile,
                canvas,
                fieldSize,
              )
            }
            style={{
              marginTop: "15px",
              backgroundColor: config.general.trackingEditor.color.accent,
              color: config.general.trackingEditor.color.mainText,
            }}
            fullWidth
          >
            Download
          </Button>
        </div>
        {/* Scrollable container */}
        <div
          style={{
            maxHeight: `${maxHeight}px`,
            overflowY: "auto",
            paddingRight: "10px",
          }}
        >
          <Grid container direction="column" spacing={1}>
            {watchedFrames?.map((element, index) => (
              <Grid item key={index}>
                <Paper
                  elevation={3}
                  style={{ padding: 1, cursor: "pointer" }}
                  onClick={() => onClickFrame(index)}
                >
                  <List>
                    <ListItem>
                      <ListItemText primary={`Frame: ${element[0]}`} />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
