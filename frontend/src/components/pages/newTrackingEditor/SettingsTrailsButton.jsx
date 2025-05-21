import {
  Box,
  Button,
  Menu,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Slider,
  TextField,
} from "@mui/material";
import React from "react";

export const SettingsTrailsButton = ({
  disabled,
  trailsEnabled,
  handleEnablingTrails,
  isShowingPlayerTrails,
  isShowingBallTrails,
  handleShowPlayerTrails,
  handleShowBallTrails,
  trailSize,
  handleSwitchingTrailSize,
  trailFrameNumber,
  setTrailFrameNumber,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        disabled={disabled}
        variant="contained"
        id="basic-button"
        data-testid="settings-trails-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        sx={{
          backgroundColor: "#BBC3C9 !important",
          color: "#1b1f22 !important",
        }}
      >
        Trails Settings
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
            width: "250px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 16px",
            }}
            onClick={handleEnablingTrails}
          >
            <Typography>show Trails </Typography>
            <FormGroup sx={{ width: "115px" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={trailsEnabled}
                    onChange={handleEnablingTrails}
                  />
                }
              />
            </FormGroup>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 16px",
            }}
            onClick={handleShowPlayerTrails}
          >
            <Typography>Show Player Trails</Typography>
            <FormGroup sx={{ width: "130px" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isShowingPlayerTrails}
                    onChange={handleShowPlayerTrails}
                  />
                }
              />
            </FormGroup>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 16px",
            }}
            onClick={handleShowBallTrails}
          >
            <Typography>Show Ball Trails</Typography>
            <FormGroup sx={{ width: "130px" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isShowingBallTrails}
                    onChange={handleShowBallTrails}
                  />
                }
              />
            </FormGroup>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 16px",
            }}
          >
            <Typography>Trails Size</Typography>
            <FormGroup sx={{ width: "130px" }}>
              <FormControlLabel
                control={
                  <Slider
                    sx={{
                      width: "60px",
                      "& .MuiSlider-thumb": {
                        color: "white",
                      },
                      "& .MuiSlider-track": {
                        color: "var(--accent)",
                      },
                      "& .MuiSlider-rail": {
                        color: "var(--main-bg)",
                      },
                    }}
                    value={trailSize}
                    onChange={handleSwitchingTrailSize}
                    min={10}
                    max={100}
                    step={10}
                    aria-label="Default"
                    valueLabelDisplay="auto"
                  />
                }
              />
            </FormGroup>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 16px",
            }}
          >
            <Typography>Trail Frames</Typography>
            <FormGroup sx={{ width: "130px" }}>
              <FormControlLabel
                control={
                  <TextField
                    variant="standard"
                    sx={{
                      width: "50px",
                      input: { color: "black" },
                      mr: 2,
                    }}
                    value={trailFrameNumber}
                    type="number"
                    onChange={(event, val) =>
                      setTrailFrameNumber(event.target.value)
                    }
                  />
                }
              />
            </FormGroup>
          </div>
        </Box>
      </Menu>
    </div>
  );
};
