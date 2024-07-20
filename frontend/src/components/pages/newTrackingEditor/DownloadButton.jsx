import { Box, Button, Menu, MenuItem, Paper } from "@mui/material";
import React from "react";

export const DownloadButton = ({ players, video, homographies }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleVideoDownload = async () => {
    if (video) {
      const element = document.createElement("a");
      const url = URL.createObjectURL(video);
      element.href = url;
      element.download = video.name || "downloadedVideo.mp4";

      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(url);
    } else {
      console.log("No video to download");
    }
  };

  const handlePlayersDownload = async () => {
    if (players && players.length > 0) {
      const csvRows = [];
      const headers = Object.keys(players[0]);
      csvRows.push(headers.join(","));

      for (const row of players) {
        const values = headers.map((header) => {
          const escaped = ("" + row[header]).replace(/"/g, '\\"');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(","));
      }

      const csvData = csvRows.join("\n");
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const element = document.createElement("a");
      element.href = url;
      element.download = "players.csv";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(url);
    } else {
      console.log("No players to download");
    }
  };

  const handleHomographyDownload = async () => {

    const homographiesData = JSON.stringify(homographies, null, 2);

    const blob = new Blob([homographiesData], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const element = document.createElement("a");

    element.href = url;
    element.download = "homographies2.json";

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Button
        variant="contained"
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
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
        </Box>
      </Menu>
    </div>
  );
};
