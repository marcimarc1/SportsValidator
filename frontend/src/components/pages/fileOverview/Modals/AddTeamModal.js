import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Form from "react-bootstrap/Form";
import api from "../../../../api/api";
import {useState} from "react";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

const AddTeamModal = () => {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = useState({
        name: '',
    });

  const handleOpen = () => {
    setOpen(true);
    setFormData({
      ...formData,
        name: ''
    })
  };

  const handleClose = () => {
    setOpen(false);
  };

      const handleInputChange = (event) => {

        let value = event.target.value;
        setFormData({
            ...formData,
            [event.target.name]: value,
        });
    }

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        await api.post('/team/', formData)
    }

  return (
    <React.Fragment>
      <button className="FileButton" onClick={handleOpen}>Add Team</button>
      <Modal
          open={open}
          onClose={handleClose}
      >
        <Box sx={style}>
          <div className="overlay">
            <div className="modal-content"></div>
            <h2>Add Team</h2>
            <form onSubmit={handleFormSubmit}>
              <div className='mb-3 mt-3'>
                <label htmlFor='name' className="form-label">Name:</label>
                <input type='text' className='form-control' id='name' name='name'
                       onChange={handleInputChange} value={formData.name}/>
              </div>
              <button className="FileButton" type='submit'>Save</button>
              <button className="FileButton" onClick={handleClose}>Close</button>
            </form>
          </div>
        </Box>
      </Modal>
    </React.Fragment>
  );
}

export default AddTeamModal;