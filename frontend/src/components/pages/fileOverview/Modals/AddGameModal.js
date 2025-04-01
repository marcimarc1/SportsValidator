import {Container, Row, Col} from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.css';
import Form from 'react-bootstrap/Form';
import Modal from "@material-ui/core/Modal";
import {Box} from "@mui/material";
import {useEffect, useState} from "react";
import api from "../../../../api/api";
import * as React from "react";
import axios from "axios";

const AddGameModal = ({modalTitle, onSave}) => {

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

    const [open, setOpen] = React.useState(false);
    const [teams, setTeams] = useState([]);
    const [sports, setSports] = useState([]);
    const [loading, setLoading] = useState(true); // State for loading
    const [formData, setFormData] = useState({
        name: '',
        date_played: '',
        team1_id: '',
        team2_id: '',
        sportType: '',

    });

    const fetchTeams = async () => {
        try {
            const response = await api.get(`/team/list/`);
            setTeams(response.data.teams);
        } catch (error) {
            console.log("Error fetching teams", error);
        }
    }

    const fetchSports = async () => {
        try {
            const response = await api.get(`/sport/list/`);
            setSports(response.data.sports);
        } catch (error) {
            console.log("Error fetching sports", error);
        }
    }

    useEffect(() => {
    }, []);

    const handleOpen = async() => {
        setFormData({
            ...formData,
            name: '',
            date_played: '',
            team1_id: '',
            team2_id: '',
            sportType: '',
        })
        await fetchTeams();
        await fetchSports();
        setOpen(true);
        console.log(teams)
    };

    const handleInputChange = (event) => {
        let value;
        switch (event.target.name) {
            case "team1_id":
            case "team2_id":
                value = teams.find(team => team.team_name === event.target.value).id;
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
        try {
            await axios.post("http://localhost:8000/game/",
                formData,
                {headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true})
        }catch(err) {
            console.log(err);
        }finally {
            onSave()
            handleClose()

        }
    }

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <button className="FileButton" onClick={handleOpen}>{modalTitle}</button>
            <Modal
                open={open}
                onClose={handleClose}
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
                                <label htmlFor='sportType' className="form-label">Sport:</label>
                                <Form.Select aria-label="Default select example" name='sportType'
                                             onChange={handleInputChange}>
                                    <option>Select Sport</option>
                                    {sports.map((sport) => (<option key={sport.id}>{sport.name}</option>))}
                                </Form.Select>
                            </div>
                            <div className='mb-3'>
                                <label htmlFor='team1_id' className="form-label">Team 1:</label>
                                <Form.Select name='team1_id' onChange={handleInputChange}>
                                    <option>Select Team</option>
                                    {teams.map((team, index) => (
                                        <option key={index}>{team.team_name}</option>
                                    ))}
                                </Form.Select>
                            </div>

                            <div className='mb-3'>
                                <label htmlFor='team2_id' className="form-label">Team 2:</label>
                                <Form.Select name='team2_id' onChange={handleInputChange}>
                                    <option>Select Team</option>
                                    {teams.map((team, index) => (
                                        <option key={index}>{team.team_name}</option>
                                    ))}
                                </Form.Select>
                            </div>
                            <button className="FileButton" type='submit'>Save</button>
                            <button className="FileButton" onClick={handleClose}>Close</button>
                        </form>
                    </div>
                </Box>
            </Modal>
        </React.Fragment>
    )
}

export default AddGameModal;
