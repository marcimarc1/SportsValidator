import { Box, Button, Menu, Typography, FormGroup, FormControlLabel, Switch } from "@mui/material";
import React from "react";

export const FieldDetailsButton = ({
  handleEnablingField,
  showField,
  editField,
  handleEnablingEditField,
  videoElement,
  fieldSize,
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
        data-testid="field-details-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        sx={{
          backgroundColor: "#BBC3C9 !important",
          color: "#1b1f22 !important",
        }}
      >
        Field Details
      </Button>
      <Menu
        id="field-details-menu"
        data-testid="field-details-menu"
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px" }} onClick={handleEnablingField}>
            <Typography>Show Field </Typography>
            <FormGroup sx={{ width: "115px" }}>
              <FormControlLabel
                control={
                  <Switch
                    data-testid="show-field-switch"
                    checked={showField}
                    onChange={handleEnablingField}
                    disabled={!videoElement?.paused}
                  />
                }
              />
            </FormGroup>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px" }} onClick={handleEnablingEditField}>
            <Typography>Edit Field </Typography>
            <FormGroup sx={{ width: "130px" }}>
              <FormControlLabel
                control={
                  <Switch
                    sx={{ marginLeft: "10px" }}
                    checked={editField}
                    onChange={handleEnablingEditField}
                    disabled={!videoElement?.paused || !showField}
                  />
                }
              />
            </FormGroup>
          </div>
          {fieldSize && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px" }}>
                <Typography>Field Width: </Typography>
                <Typography data-testid="field-menu-width" sx={{ width: "100px", marginLeft: "10px" }}>
                  {fieldSize.width.toFixed(2)}
                </Typography>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px" }}>
                <Typography>Field Length: </Typography>
                <Typography data-testid="field-menu-length" sx={{ width: "100px", marginLeft: "10px" }}>
                  {fieldSize.length.toFixed(2)}
                </Typography>
              </div>
            </>
          )}
        </Box>
      </Menu>
    </div>
  );
};
