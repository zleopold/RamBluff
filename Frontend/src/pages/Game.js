import React from "react";
import Ledger from "../components/Ledger";
import Seats from "../components/Seats";
import "../styles/Game.css";

const Game = () => {
    return (
        <div className="GameContainer">
            <div className="game">

            <Ledger />
            <Seats/>
            </div>
        </div>
    )
}
export default Game;