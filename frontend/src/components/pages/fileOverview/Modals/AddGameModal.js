import {Container,Row,Col} from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.css';
import Form from 'react-bootstrap/Form';
import Modal from "@material-ui/core/Modal";
import {Box} from "@mui/material";
import {useEffect, useState} from "react";
import api from "../../../../api/api";
const AddGameModal = ({modalTitle, gameModal, toggleGameModal}) => {

    if(gameModal) {
        document.body.classList.add('active-modal')
    } else {
        document.body.classList.remove('active-modal')
    }

    const style = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 800,
      bgcolor: 'background.paper',
      border: '2px solid #000',
      boxShadow: 24,
      p: 4,
    };


    const [teams, setTeams] = useState({1:"Team1", 2:"Team2", 3:"Team3", 4:"Team4"});
    const [sports, setSports] = useState({"KeyFoot":"Football", "KeyTennis":"Tennis"});
    const [formData, setFormData] = useState({
        name: '',
        date_played: '',
        team1: '',
        team2: '',
        sport: '',

    });

    const fetchTeams = async () => {
        const response = await api.get(`/teams/`);
        setTeams(response.data);
    }

    const fetchSports = async () => {
        const response = await api.get(`/sports/`);
        setTeams(response.data);
    }

    useEffect(()=>{
        fetchTeams();
        fetchSports();
    }, []);

    const handleInputChange = (event) => {
        let value;
        switch(event.target.name) {
            case "sport":
                value = Object.keys(sports).find((key) => sports[key] === event.target.value);
                break;
            case "team1":
            case "team2":
                value = Object.keys(teams).find((key) => teams[key] === event.target.value);
                break;
            default:
                value = event.target.value;
        }
        setFormData({
            ...formData,
            [event.target.name]: value,
        });
    }

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        await api.post('/games/', formData)
    }

    return (
        <div className="AddGameModal">
        <Modal
            open={gameModal}
            onClose={toggleGameModal}

        >
            <Box sx={style}>
                <div className="overlay">
                    <div className="modal-content"></div>
                    <h2>{modalTitle}</h2>
                    <form onSubmit={handleFormSubmit}>
                        <div className='mb-3 mt-3'>
                            <label htmlFor='name' className="form-label">Name:</label>
                            <input type='text' className='form-control' id='name' name='name'
                                   onChange={handleInputChange} value={formData.name}/>
                        </div>
                        <div className='mb-3'>
                            <label htmlFor='date' className="form-label">Date:</label>
                            <input type='date' data-date-format="DD MMMM YYYY" className='form-control' id='date'
                                   name='date_played' onChange={handleInputChange}
                                   value={formData.date_played}/>
                        </div>
                        <div className='mb-3'>
                            <label htmlFor='sport' className="form-label">Sport:</label>
                            <Form.Select aria-label="Default select example" name='sport' onChange={handleInputChange}>
                                <option>Select Sport</option>
                                {Object.entries(sports).map(([key, value]) => <option key={key}
                                                                                      value={value}>{value}</option>)}
                            </Form.Select>
                        </div>

                        <div className='mb-3'>
                            <label htmlFor='team1' className="form-label">Team 1:</label>
                            <Form.Select name='team1' onChange={handleInputChange}>
                                <option>Select Team</option>
                                {Object.entries(teams).map(([key, value]) => <option key={key}
                                                                                      value={value}>{value}</option>)}
                            </Form.Select>
                        </div>

                        <div className='mb-3'>
                            <label htmlFor='team2' className="form-label">Team 2:</label>
                            <Form.Select name='team2' onChange={handleInputChange}>
                                <option>Select Team</option>
                                {Object.entries(teams).map(([key, value]) => <option key={key}
                                                                                      value={value}>{value}</option>)}
                            </Form.Select>
                        </div>


                    </form>
                    <button className="FileButton" onClick={toggleGameModal}>Save</button>
                    <button className="FileButton" onClick={toggleGameModal}>Close</button>
                </div>
            </Box>
        </Modal>
        </div>
    )
}

export default AddGameModal;
