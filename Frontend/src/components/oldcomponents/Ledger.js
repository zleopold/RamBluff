import React, { useState } from "react";
//import "../styles/Ledger.css";

const Ledger = () => {
    const [toggle, setToggle] = useState("none");

    const togglePlayersList = () => {
        setToggle(prevToggle => prevToggle === "block" ? "none" : "block");
    };

    return (
        <div className="Players">
            <div className="playersListHeader">
                <p className="PlayersHeader">Ledger</p>
                <button className="togglePlayers" onClick={togglePlayersList}>
                    {toggle === "block" ? "x" : 'v'}
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

export default Ledger;

