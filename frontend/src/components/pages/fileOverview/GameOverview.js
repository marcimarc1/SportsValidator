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

    //Loading
    const[loading, setLoading] = useState(false);
    const[loaderText, setLoaderText] = useState("Loading...");

    //Filter
    const[filterText, setFilterText] = useState("");
    const[sportFilter, setSportFilter] = useState("");
    const[teamFilter1, setTeamFilter] = useState("");
    const[teamsFilter2, setTeamsFilter] = useState("");
    const[dateRange, setDateRange] = useState(null);
    const[searchRequest, setSearchRequest] = useState({
        skip: 0,
        take: 10,
        desc: false,
        filter:""
    })

    //Data
    const[games, setGames] = useState([])


    useEffect(async () =>{
        await fetchGames()
    },[]);

    const fetchGames = async () => {
        try {
            setLoaderText("Loading Games...");
            setLoading(true);
            const response = await axios.post("http://localhost:8080/game/list",
                searchRequest,
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

    //Filter handler
    const handleFilterTextChange = (e) => {

        setSearchRequest()
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

                        {/** Dialog Buttons**/}
                        <div className="file-upload-container" style={{display: 'flex', justifyContent: 'space-between'}}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <AddGameModal modalTitle={"Add Game"} onSave={triggerReload}/>
                                <AddTeamModal />
                            </div>
                            <input
                                className="FileButton"
                                type="text"
                                value={filterText}
                                onChange={handleFilterTextChange}
                                placeholder={"Search for Game..."}
                            />
                        </div>
                        {/** Game List**/}
                        <div>
                            {games.map((game) => (
                                <GameListItem key ={game.id} game={{game}} reload_data={triggerReload} handleDelete={deleteGame} triggerReload={triggerReload}/>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </LoadingOverlay>
    );
}

export default GameOverview