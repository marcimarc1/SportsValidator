import React, {useState, useEffect} from 'react'
import GameListItem from "./ListItem/GameListItem";
import AddGameModal from "./Modals/AddGameModal";
import AddTeamModal from "./Modals/AddTeamModal";
const GameOverview =() => {

    const[games, setGames] = useState([])
    const[isLoading, setIsLoading] = useState(true)
    useEffect(() =>{
        const reloadData = [] //Todo: Router Call
        setGames(reloadData)
        setIsLoading(false)
    },[]);

    const [gameModal, setGameModal] = useState(false);

    const toggleGameModal = () => {
        setGameModal(!gameModal);
    }

    return (
        <div className="FileOverview">
            <div className="FileOverviewList">
                <div className="FileOverviewHeadingContainer">
                    <h1 className={"FileOverviewHeading"}>Game Overview</h1>
                    <div className="file-upload-container">
                        <button
                            className="FileButton"
                            id="game-dialog-button"
                            onClick={toggleGameModal}
                        >Add Game</button>
                        <AddTeamModal/>

                        {gameModal && (<AddGameModal modalTitle={"Add Game"} gameModal={gameModal} toggleGameModal={toggleGameModal}/>)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GameOverview