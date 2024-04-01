import React, { useState } from "react";
import "../styles/Playerlist.css";

const Players = () => {
    const [toggle, setToggle] = useState("none");

    const togglePlayersList = () => {
        setToggle(prevToggle => prevToggle === "block" ? "none" : "block");
    };

    return (
        <div className="Players">
            <div className="playersListHeader">
                <p className="PlayersHeader">Players</p>
                <button className="togglePlayers" onClick={togglePlayersList}>
                    {toggle === "block" ? "X" : 'display'}
                </button>
            </div>
            <ul className="playersList" style={{display: toggle}}>
                <li className="player">Bob</li>
                <li className="player">Tom</li>
                <li className="player">Phil</li>
            </ul>
        </div>
    );
}

export default Players;

