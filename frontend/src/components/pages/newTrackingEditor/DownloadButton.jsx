import { Box, Button, Menu, MenuItem, Paper } from "@mui/material";
import React from "react";
import toast, {Toaster} from "react-hot-toast";
import ImExport from "../../../controllers/imexport.controller";
import VideoController from "../../../controllers/video.controller";


export const DownloadButton = ({videoId}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [loading, setLoading] = React.useState(false);
  const [loaderText, setLoaderText] = React.useState("");
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  function downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  const handleVideoDownload = async () => {
    try {
      setLoaderText("Downloading Video...");
      setLoading(true);

      const response = await VideoController.getVideoFileById(videoId);
      const videoBlob = new Blob([response.data], {type: "video/mp4"});
      downloadFile(videoBlob, `video_${videoId}.mp4`);
      toast.success("Video downloaded.");
    } catch (error) {
      toast.error(error.message);
      console.error("Error downloading video", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayersDownload = async () => {
    try {
      setLoaderText("Downloading Player CSV...");
      setLoading(true);

      const response = await ImExport.GetPlayerCSV(videoId);
      const blob = new Blob([response.data], {type: "blob"});
      downloadFile(blob, `player_annotations.csv`);
      toast.success("Player CSV downloaded.");
    } catch (error) {
      toast.error(error.message);
      console.error("Error downloading Player CSV", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBallDownload = async () => {
    try {
      setLoaderText("Downloading Ball CSV...");
      setLoading(true);

      const response = await ImExport.GetBallCSV(videoId);
      const blob = new Blob([response.data], {type: "blob"});
      downloadFile(blob, `ball_annotations.csv`);
      toast.success("Ball CSV downloaded.");
    } catch (error) {
      toast.error(error.message);
      console.error("Error downloading Ball CSV", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHomographyDownload = async () => {
    try {
      setLoaderText("Downloading Homographie JSON...");
      setLoading(true);

      const response = await ImExport.GetHomographieJSON(videoId);

      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      downloadFile(blob, `homographie_${videoId}.json`);
      toast.success("Homographie JSON downloaded.");
    } catch (error) {
      toast.error(error.message);
      console.error("Error downloading JSON", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <Toaster
          position="top-right"
          reverseOrder={false}
      />
      <Button
        variant="contained"
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        sx={{
          backgroundColor: "#BBC3C9 !important",
          color: "#1b1f22 !important",
        }}
      >
        Download
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        sx={{ marginTop: "5px" }}
      >
        <Box
          sx={{
            width: "115px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <MenuItem onClick={handleVideoDownload}>
            <Button>Video</Button>
          </MenuItem>
          <MenuItem onClick={handlePlayersDownload}>
            <Button>Players</Button>
          </MenuItem>
          <MenuItem onClick={handleHomographyDownload}>
            <Button>Homographies</Button>
          </MenuItem>
          <MenuItem onClick={handleBallDownload}>
            <Button>Balls</Button>
          </MenuItem>
        </Box>
      </Menu>
    </div>
  );
};
