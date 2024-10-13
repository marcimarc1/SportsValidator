import * as React from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import Input from "@material-ui/core/Input";

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

export default function ApplyHomographyModal({
  showApplyHomographyModal,
  handleClose,
  handleApply,
  handleContinueWithoutApplying,
}) {
  const [frameNumber, setFrameNumber] = React.useState(240);

  const applyHomography = () => {
    if(frameNumber < 1 || isNaN(frameNumber)) {
      alert("Frame number must be greater than 0");
      return;
    }
    handleApply(frameNumber);
  };

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
            {"Do you want to apply the homography to the next frames?"}
          </Typography>
            <Box marginTop={1}>
              <Input
                type="number"
                value={frameNumber}
                onChange={(e) => setFrameNumber(e.target.value)}
                style={{ width: '120px' }}
              />
              {" frames"}
            </Box>
          <Box marginTop={2}>
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{ marginRight: 2 }}
              style={{ marginRight: "10px" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleContinueWithoutApplying}
              style={{ marginRight: "10px" }}
            >
              Continue without applying
            </Button>
            <Button variant="contained" onClick={applyHomography}>
              Apply
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
