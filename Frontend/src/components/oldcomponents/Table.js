// Table.js
import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import axios from 'axios';


const ENDPOINT = 'http://localhost:3001'; // Change this to your Socket.IO server endpoint

const Table = () => {
  const [seats, setSeats] = useState(Array(10).fill({ player: null }));
  const [playerName, setPlayerName] = useState('');
  const [stackSize, setStackSize] = useState('');
  const [selectedSeatIndex, setSelectedSeatIndex] = useState(null);
  const stackSizeIncrement = 100; // Change increment value here

  // Connect to the Socket.IO server
  const socket = socketIOClient(ENDPOINT);

  useEffect(() => {
    // Listen for 'tableState' event from the server to update table state
    socket.on('tableState', (updatedSeats) => {
      setSeats(updatedSeats);
    });

    return () => {
      socket.disconnect(); // Disconnect from the server when the component unmounts
    };
  }, [socket]); // Include 'socket' as a dependency

  const fetchPlayersAtTable = async () => {
    try {
      const tableId = window.location.pathname.slice(-36);
      const response = await axios.get(`http://localhost:3001/playersAtTable/${tableId}`);
      const players = response.data.players;
      const updatedSeats = seats.map((seat, index) => {
        const player = players.find((p) => p.seat_number === index + 1);
        return { player: player ? { name: player.name, stackSize: player.stack_size } : null };
      });
      setSeats(updatedSeats);
    } catch (error) {
      console.error('Error fetching players at table:', error);
    }
  };

  const handleSitDown = (event, seatIndex) => {
    event.preventDefault(); // Prevent default form submission
    setSelectedSeatIndex(seatIndex); // Remember the selected seat index
    // Emit 'sitDown' event to the server with selected seat index
    socket.emit('sitDown', seatIndex);
  };

  const handleConfirmSitDown = () => {
    if (playerName.trim() !== '' && stackSize.trim() !== '' && selectedSeatIndex !== null) {
      const updatedSeats = [...seats];
      updatedSeats[selectedSeatIndex] = { player: { name: playerName, stackSize: stackSize } };
      setSeats(updatedSeats);
      setPlayerName(''); // Clear input fields after sitting down
      setStackSize('');
      setSelectedSeatIndex(null);
  
      // all table ids are of length 36
      const tableId = window.location.pathname.slice(-36);
      // Emit 'confirmSitDown' event to the server with player details and seat index
      socket.emit('confirmSitDown', { playerName, stackSize, selectedSeatIndex, tableId });
    } else {
      alert('Please enter a valid name and stack size.');
    }
  };
  
  // Listen for 'playerAdded' event from the server to display the success message
  socket.on('playerAdded', (response) => {
    console.log('Player added to database:', response.message);
  });
  
  
  // Listen for 'playerAdded' event from the server to display the success message
  socket.on('playerAdded', (message) => {
    console.log('Player added to database:', message);
  });
  
  
  

  const handleCancelSitDown = () => {
    setSelectedSeatIndex(null); // Clear selected seat index to cancel sitting down
  };

  const handleLeaveSeat = (seatIndex) => {
    const updatedSeats = [...seats];
    if (updatedSeats[seatIndex].player !== null) {
      // Emit 'leaveSeat' event to the server with seat index
      socket.emit('leaveSeat', seatIndex);
  
      const tableId = window.location.pathname.slice(-36);
      // Remove the player from the database only if already seated
      axios.delete(`http://localhost:3001/removePlayer/${tableId}/${seatIndex + 1}`) // Adjust seat number by adding 1
        .then(response => {
          console.log('Player removed from database:', response.data);
          updatedSeats[seatIndex] = { player: null }; // Update the local state after successful removal
          setSeats(updatedSeats);
        })
        .catch(error => {
          console.error('Error removing player from database:', error);
        });
    } else {
      console.warn('No player seated in this seat.');
    }
  };
  

  return (
    <div className="table-container">
      <h1>RamBluff</h1>
      <div className="table">
        <div className="table-inner">
          {seats.map((seat, index) => (
            <div key={index} className="seat">
              {seat.player ? (
                <div>
                  <p>{seat.player.name} ({seat.player.stackSize})</p>
                  <button onClick={() => handleLeaveSeat(index)}>Leave Seat</button>
                </div>
              ) : (
                <div>
                  {selectedSeatIndex !== index && (
                    <button onClick={(e) => handleSitDown(e, index)}>Sit Down</button>
                  )}
                  {selectedSeatIndex === index && (
                    <div>
                      <form onSubmit={handleConfirmSitDown}>
                        <label>
                          Name:
                          <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                          />
                        </label>
                        <label>
                          Stack Size:
                          <input
                            type="number"
                            value={stackSize}
                            onChange={(e) => setStackSize(e.target.value)}
                            step={stackSizeIncrement} // Use step attribute for increment value
                          />
                        </label>
                        <button type="submit">Confirm</button>
                      </form>
                      <button onClick={handleCancelSitDown}>Cancel</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Table;
