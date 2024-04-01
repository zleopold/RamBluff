import React from "react";
import Players from "../components/Players";
import "../styles/Game.css";
const Game = () => {
    return (
        <div className="GameContainer">
            <div className="game">

            <Players />
            </div>
        </div>
    )
}
export default Game;