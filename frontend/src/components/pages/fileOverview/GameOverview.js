import React, {useState, useEffect} from 'react'
import GameListItem from "./ListItem/GameListItem";
import AddGameModal from "./Modals/AddGameModal";
import AddTeamModal from "./Modals/AddTeamModal";
import toast, {Toaster} from "react-hot-toast"
import LoadingOverlay from "react-loading-overlay-ts"
import styles from "./GameOverview.css"
import api from "../../../api/api";
import axios from "axios";


//Todo
// - add Date Filter(Datepicker)
// - Add Sport Filter(Dropdown)
// - Add Paging
// - Fix Name Filter

const GameOverview =() => {

    const[loading, setLoading] = useState(false);
    const[loaderText, setLoaderText] = useState("Loading...");
    const[games, setGames] = useState([])
    const[filter, setFilter] = useState({
        filter: '',
        skip: 0,
        take: 10,
        desc: false,
        hasFilter: false,

    })

    useEffect(async () =>{
        await fetchGames()
    },[]);

    const fetchGames = async () => {
        try {
            setLoaderText("Loading Games...");
            setLoading(true);
            const response = await axios.post("http://localhost:8000/game/list",
                filter,
                {headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true})
            setGames([...response.data.games])
            toast.success("Games loaded successfully.");
        } catch (error) {
            toast.error(error.message);
            console.log("Error fetching games", error);
        }finally {
            setLoading(false);
        }
    }

    const deleteGame = async(id) => {
        try{
            setLoaderText("Deleting game...");
            setLoading(true);
            const response = await api.get(`/game/delete/${id}`);
            setLoading(false);
            const message = response.data.message;
            if(message === "success"){
                toast.success("Successfully deleted!");
                await triggerReload();
            }
            else{
                toast.error(message);
            }
        }
        catch(error){
            console.log(error);
        }
        finally {
            setLoading(false);
        }
    }

    const triggerReload = async() => {
        await fetchGames();
    }

    const handleFilterChange = (e) => {
        let newFilter = filter;
        newFilter.filter = e.target.value;
        newFilter.hasFilter = true;
        setFilter(newFilter); // Update the state with textarea value
    };

    return (
        <LoadingOverlay className="FileOverview" active={loading} spinner text={loaderText}>
            <div className="FileOverview">
                <Toaster
                    position="top-right"
                    reverseOrder={false}
                />
                <div className="FileOverviewList">
                    <div className="FileOverviewHeadingContainer">
                        <h1 className={"FileOverviewHeading"}>Game Overview</h1>
                        <div className="file-upload-container" style={{display: 'flex', justifyContent: 'space-between'}}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <AddGameModal modalTitle={"Add Game"} onSave={triggerReload}/>
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
                                <GameListItem key ={game.id} game={{game}} reload_data={triggerReload} handleDelete={deleteGame}/>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </LoadingOverlay>
    );
}

export default GameOverview