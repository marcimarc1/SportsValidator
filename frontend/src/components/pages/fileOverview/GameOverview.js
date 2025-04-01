import React, {useState, useEffect} from 'react'
import GameListItem from "./ListItem/GameListItem";
import AddGameModal from "./Modals/AddGameModal";
import AddTeamModal from "./Modals/AddTeamModal";
import styles from "./GameOverview.css"
import api from "../../../api/api";
import axios from "axios";

const GameOverview =({modalTitle, onSave, titles}) => {

    const[games, setGames] = useState([])
    const[filter, setFilter] = useState({
        filter: '',
        skip: 0,
        take: 10,
        desc: false,
        hasFilter: false,

    })
    useEffect(() => {
        const debounceTimer = setTimeout(async() => {
            if (filter) {
                await fetchGames(filter);
            }
        }, 1000);
        return () => {
            clearTimeout(debounceTimer);
        };
    }, [filter]);

    useEffect(async () =>{
        await fetchGames()
    },[]);

    const fetchGames = async () => {
        try {
            const response = await axios.post("http://localhost:8000/game/list",
                filter,
                {headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true})
            setGames(response.data.games)
        } catch (error) {
            console.log("Error fetching games", error);
        }
    }
    const handleSave = async() => {
        await fetchGames();
    }

    const handleFilterChange = (e) => {
        let newFilter = filter;
        newFilter.filter = e.target.value;
        newFilter.hasFilter = true;
        setFilter(newFilter); // Update the state with textarea value
    };

    return (
        <div className="FileOverview">
            <div className="FileOverviewList">
                <div className="FileOverviewHeadingContainer">
                    <h1 className={"FileOverviewHeading"}>Game Overview</h1>
                    <div className="file-upload-container" style={{display: 'flex', justifyContent: 'space-between'}}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <AddGameModal modalTitle={"Add Game"} onSave={handleSave}/>
                            <AddTeamModal />
                        </div>
                        <input
                            className="FileButton"
                            type="text"
                            value={filter.filter}
                            onChange={handleFilterChange}
                            placeholder={"Search for Game..."}
                        />
                    </div>
                    <div>
                        {games.map((game) => (
                            <GameListItem key ={game.id} game={{game}}/>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GameOverview