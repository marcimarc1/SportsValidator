import { Box, Button, Menu, Typography, FormGroup, FormControlLabel, Switch } from "@mui/material";
import React from "react";

export const SettingsBallButton = ({
    isShowingBallBox, 
    isShowingBallTrails, 
    handleShowBallBox,
    handleShowBallTrails,
    handleAddBall,
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
        Ball Settings
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px" }} onClick={handleShowBallBox}>
            <Typography>show Ball Box </Typography>
            <FormGroup sx={{ width: "115px" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isShowingBallBox}
                    onChange={handleShowBallBox}
                  />
                }
              />
            </FormGroup>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px" }} onClick={handleShowBallTrails}>
            <Typography>Show Ball Tracks</Typography>
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
          </Box>
          <Button
            data-testid="add-ball-button"
            variant="contained"
            onClick={handleAddBall}
            sx={{
              backgroundColor: "#BBC3C9 !important",
              color: "#1b1f22 !important",
              
            }}
          >
            Add Ball
          </Button>
      </Menu>
    </div>
    );
}


