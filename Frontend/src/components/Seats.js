import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:8080'; // Your server endpoint

const Seats = () => {
  const [playerData, setPlayerData] = useState(Array(10).fill(null));
  useEffect(() => {
    const socket = io(ENDPOINT);

    socket.on('returningPlayer', ({ playerName, stackSize, seatIndex }) => {
      const updatedPlayerData = [...playerData];
      updatedPlayerData[seatIndex - 1] = {playerName, stackSize};
      console.log('Player name:', playerName);
      console.log('Stack size:', stackSize);
      setPlayerData(updatedPlayerData);
    });

    return () => {
      socket.disconnect(); // Clean up the socket connection
    };
  }, []);

  const socket = io(ENDPOINT);
  const tableId = window.location.pathname.slice(-36);

  const handleSitDown = (seatIndex) => {
    const playerName = prompt('Enter your name:');
    const stackSize = prompt('Enter your stack size:');
    if (playerName && stackSize) {
      setPlayerData((prevPlayerData) => {
        const updatedPlayerData = [...prevPlayerData];
        updatedPlayerData[seatIndex - 1] = { playerName, stackSize }
        return updatedPlayerData;
      })
      socket.emit('sendingPlayer', { playerName, stackSize, seatIndex, tableId });
      console.log('handle sit down', playerName);
    }
  };

  

  return (
    <div className="seats-container">
      <h1>Seats</h1>
      <div className="seats">
        {[...Array(10).keys()].map((index) => (
          <div key={index} className="seat">
            <button onClick={() => handleSitDown(index + 1)}>Sit Down</button>
            {playerData[index] && (
              <div>
                <p>Name: {playerData[index].playerName}</p>
                <p>Stack Size: {playerData[index].stackSize}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Seats;
