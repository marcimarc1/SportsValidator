import * as React from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function SaveRefinementModal({
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
            {"Please make sure you have corrected every frame"}
          </Typography>
          <Typography variant="h8" id="demo-simple-select-label" color="error">
            {
              "This is very important, since these frames will be used for the next model training"
            }
          </Typography>
          <Box marginTop={2}>
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{ marginRight: 2 }}
              style={{ marginRight: "10px" }}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleApply}>
              Send
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
