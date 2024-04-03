import React from "react";
import axios from 'axios';
import "../styles/LaunchGame.css";
const LaunchGame = () => {
    const handleStartGame = async () => {

        try{
            const response = await axios.post(`http://localhost:8080/admin/createTable`);
            console.log('GameID:' , response.data.gameId);
            const gameId = response.data.gameId;
            console.log('GameID:', gameId);
            window.location.href = `/game/${gameId}`;
        } catch (error){
            console.error('Error creating table:', error);
            console.error('Error response:', error.response);
        }
    }
    return (
        <div className="LaunchGameContainer">
            <div className="LaunchGame">
                <button onClick={handleStartGame}>Start Game</button>
            </div>
        </div>
    )
}

export default LaunchGame;