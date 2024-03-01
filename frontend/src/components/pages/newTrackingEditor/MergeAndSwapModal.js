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

export default function MergeAndSwapModal({
  playerChosenInList,
  playerNameMap,
  mergeModalState,
  handleClose,
  swapPlayerData,
  mergePlayerData,
}) {
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [operation, setOperation] = useState("swap");

  const handleChange = (event) => {
    setSelectedPlayer(event.target.value);
  };

  const handleClick = () => {
    if (operation === "swap") swapPlayerData(selectedPlayer);
    else mergePlayerData(selectedPlayer);
    handleClose();
  };

  return (
    <div>
      <Modal
        open={mergeModalState}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box textAlign="center" sx={style}>
          <FormControl component="fieldset">
            <Typography variant="h6" id="demo-simple-select-label">
              {"Choose Operation for " + playerChosenInList}{" "}
            </Typography>
            <RadioGroup
              sx={{ ml: 2 }}
              row
              aria-label="operation"
              name="operation"
              value={operation}
              onChange={(event) => setOperation(event.target.value)}
            >
              <FormControlLabel value="swap" control={<Radio />} label="Swap" />
              <FormControlLabel
                value="merge"
                control={<Radio />}
                label="Merge"
              />
            </RadioGroup>
          </FormControl>
          <Typography
            sx={{ mt: 2 }}
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            Choose player to {operation === "swap" ? "swap" : "merge"} with.
          </Typography>
          <Typography sx={{ mt: 2 }} id="modal-modal-title" component="h2">
            {operation === "swap"
              ? "This will swap " +
                playerChosenInList +
                " and the chosen player below from this frame and onwards"
              : "This will merge the player with frames that come later into the player with frames that come earlier to one in all frames, deleting the one that comes later."}
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Choose Player</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedPlayer}
              label="Age"
              onChange={handleChange}
            >
              {Array.from(playerNameMap.values()).map((name) => {
                if (name !== playerChosenInList) {
                  return <MenuItem value={name}>{name}</MenuItem>;
                }
              })}
            </Select>
          </FormControl>

          <Button
            style={{ marginTop: "2em" }}
            color="primary"
            variant="contained"
            onClick={handleClick}
          >
            Apply Changes
          </Button>
        </Box>
      </Modal>
    </div>
  );
}
