const GameListItem = (props) => {
    const game = props.game;

    const handleClickOpenVideo = () => {

    }
    const handleEditGame = () => {

    }
    const handleDeleteGame = () => {

    }
    return(
        <div className="GameListItem" key = {game.Id}>
            <div>
                <button onClick={handleClickOpenVideo}></button>
                <button onClick={handleEditGame}></button>
                <button onClick={handleDeleteGame}></button>
            </div>
        </div>
    )
}

export default GameListItem;