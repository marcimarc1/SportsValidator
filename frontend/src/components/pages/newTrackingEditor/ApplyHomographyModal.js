import * as React from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import { useState } from "react";
import { mergePlayerData, swapPlayerData } from "../../../utils/validation";
import { useMemo } from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function ApplyHomographyModal({
  showApplyHomographyModal,
  handleClose,
  handleApply,
}) {
  return (
    <div>
      <Modal
        open={showApplyHomographyModal}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box textAlign="center" sx={style}>
            <Typography variant="h6" id="demo-simple-select-label">
              {"Do you want to apply the homography to the next 240 frames?"}
            </Typography>
            <Box marginTop={2}>
              <Button
                variant="contained"
                onClick={handleClose}
                sx={{ marginRight: 2 }}
              >
                Cancel
              </Button>
              <Button variant="contained" onClick={handleApply}>
                Apply
              </Button>
            </Box>
        </Box>
      </Modal>
    </div>
  );
}
