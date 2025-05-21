import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import Form from 'react-bootstrap/Form';
import Modal from '@material-ui/core/Modal';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../../../../api/api';
import * as React from 'react';
import axios from 'axios';
import TeamController from '../../../../controllers/team.controller';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import IconButton from '@material-ui/core/IconButton';
import GameController from "../../../../controllers/game.controler";

const AddGameModal = ({ modalTitle, onSave, game }) => {
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

    const [open, setOpen] = useState(false);
    const [teams, setTeams] = useState([]);
    const [sports, setSports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        date_played: '',
        team1_id: '',
        team2_id: '',
        sportType: '',
    });

    const fetchTeams = async () => {
        try {
            const response = await TeamController.getTeamList();
            setTeams(response.data.teams);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    const fetchSports = async () => {
        try {
            const response = await api.get('/sport/list/');
            setSports(response.data.sports);
        } catch (error) {
            console.error('Error fetching sports:', error);
        }
    };

    const handleOpen = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchTeams(), fetchSports()]);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleInputChange = (event) => {
        debugger;
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const mapSportEnum = (id) => {
        switch (id) {
            case '1': return "Football"
            case '2': return "Tennis"
            default: return null
        }
    }

    useEffect(() => {
        if (game) {
            setFormData((prev) => ({
                ...prev,
                name: game.name ?? '',
                date_played: game.date_played
                    ? new Date(game.date_played).toISOString().split('T')[0]
                    : '',
                team1_id: game.team1_id ?? '',
                team2_id: game.team2_id ?? '',
                sportType: mapSportEnum(game.sportType) ?? '',
            }));
        }
        const x = formData
        debugger;
    }, [game]);

    useEffect(() => {
        if (teams.length > 0 && sports.length > 0) {
            setLoading(false);
            setOpen(true);
        }
    }, [teams, sports]);

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        try {
            if(game)
            {
                await GameController.updateGame(formData, game.id);
            }
            else
            {
                await GameController.addGame(formData);
            }

            onSave();
            handleClose();
        } catch (err) {
            console.error('Error saving game:', err);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            {game ? (
                <IconButton
                    size="medium"
                    variant="contained"
                    className="FileOverviewListItemButton"
                    aria-label="show analysis"
                    onClick={handleOpen}
                >
                    <FontAwesomeIcon icon={faEdit} />
                </IconButton>
            ) : (
                <button className="FileButton" onClick={handleOpen}>
                    {modalTitle}
                </button>
            )}

            <Modal open={open && !loading} onClose={handleClose}>
                <Box sx={style}>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="overlay">
                            <div className="modal-content"></div>
                            <h2>{modalTitle}</h2>
                            <form onSubmit={handleFormSubmit}>
                                <div className="mb-3 mt-3">
                                    <label htmlFor="name" className="form-label">
                                        Name:
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        onChange={handleInputChange}
                                        value={formData.name}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="date" className="form-label">
                                        Date:
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="date"
                                        name="date_played"
                                        onChange={handleInputChange}
                                        value={formData.date_played}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label
                                        htmlFor="sportType"
                                        className="form-label"
                                    >
                                        Sport:
                                    </label>
                                    <Form.Select
                                        name="sportType"
                                        onChange={handleInputChange}
                                        value={formData.sportType}
                                    >
                                        <option value="">Select Sport</option>
                                        {sports.map((sport) => (
                                            <option
                                                key={sport.name}
                                                value={sport.name}
                                            >
                                                {sport.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>
                                <div className="mb-3">
                                    <label
                                        htmlFor="team1_id"
                                        className="form-label"
                                    >
                                        Team 1:
                                    </label>
                                    <Form.Select
                                        name="team1_id"
                                        onChange={handleInputChange}
                                        value={formData.team1_id}
                                    >
                                        <option value="">Select Team</option>
                                        {teams.map((team) => (
                                            <option
                                                key={team.id}
                                                value={team.id}
                                            >
                                                {team.team_name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>
                                <div className="mb-3">
                                    <label
                                        htmlFor="team2_id"
                                        className="form-label"
                                    >
                                        Team 2:
                                    </label>
                                    <Form.Select
                                        name="team2_id"
                                        onChange={handleInputChange}
                                        value={formData.team2_id}
                                    >
                                        <option value="">Select Team</option>
                                        {teams.map((team) => (
                                            <option
                                                key={team.id}
                                                value={team.id}
                                            >
                                                {team.team_name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>
                                <button
                                    className="FileButton"
                                    type="submit"
                                >
                                    Save
                                </button>
                                <button
                                    className="FileButton"
                                    onClick={handleClose}
                                >
                                    Close
                                </button>
                            </form>
                        </div>
                    )}
                </Box>
            </Modal>
        </React.Fragment>
    );
};

export default AddGameModal;