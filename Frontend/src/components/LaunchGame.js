import React from "react";
import axios from 'axios';
import io from 'socket.io-client';
import { v4 as uuid} from "uuid";
import "../styles/LaunchGame.css";
const ENDPOINT = process.env.REACT_APP_SERVER_ENDPOINT;
const socket = io.connect(ENDPOINT);
const LaunchGame = () => {
    const handleStartGame = async () => {

        try {
            const gameId = uuid();
            socket.emit('createTable', gameId);
            console.log('GameID:', gameId);
            window.location.href = `/game/${gameId}`;
        } catch (error) {
            console.error('Error creating table:', error);
            console.error('Error response:', error.response);
        }
    }
    return (
        <div className="LaunchGameContainer">
            <div className="LaunchGame">
                <button onClick={handleStartGame} className="startGameBtn">Launch</button>
            </div>
        </div>
    )
}

export default LaunchGame;