import { Box, Button, Menu, Typography, FormGroup, FormControlLabel, Switch } from "@mui/material";
import React from "react";

export const SettingsBallButton = ({
    disabled,
    isShowingBallBox, 
    handleShowBallBox,
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

    const handleAddBallButton = () => {
      //can be removed if user is know to this tool
      if (window.confirm("To add a ball, click on the field")) {
        handleClose();
        handleAddBall();
    }   
    };

    return (
    <div>
      <Button
        variant="contained"
        id="basic-button"
        disabled={disabled}
        data-testid="settings-ball-button"
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
          </Box>
          <Button
            data-testid="add-ball-button"
            variant="contained"
            onClick={handleAddBallButton}
            title="After clicked on this button, click on the field to add a ball"
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


