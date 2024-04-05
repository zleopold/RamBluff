import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:8080'; // Your server endpoint
const socket = io.connect(ENDPOINT);
const tableId = window.location.pathname.slice(-36);

const Seats = () => {
  const [playerData, setPlayerData] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [name, setName] = useState('');
  const [stack, setStack] = useState(0);
  const [seat, setSeat] = useState(0);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    socket.emit('joinRoom', tableId);

    socket.on('playersInRoom', (players) => {
      setPlayerData(players);
    })

    socket.on('satDown', ({players, player}) => {
      setPlayerData(players);
      setSeat(player.seat);
    })

    socket.on('noSeats', () => {
      alert('Table is full');
    });

  }, []);

  // Function to handle "Sit Down" button click
  const handleSitDown = () => {
    if (name.trim() === '' || stack <= 0) {
      alert('Please enter valid information.');
      return;
    }

    socket.emit('sittingDown', { name, stack, seat, tableId });
    setShowForm(false);
  };

  const handleLeaveSeat = () => {
    socket.emit('leavingSeat', { seat, tableId });
  };

  return (
    <div>
      <h2>Players</h2>
      {/* Display playerData */}
      {playerData.map((item, index) => (
        <div key={index}>
          {/* Check if item is not null and render player object properties */}
            {item !== null && (
            <div>
              Seat {index+1}: {item.name} ({item.stack})
            </div>
          )}
        </div>
      ))}

      {/* Show form if not already sitting */}
      {showForm && (
        <form onSubmit={(e) => e.preventDefault()}>
          <label>
            Name:
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Stack Size:
            <input type="number" value={stack} onChange={(e) => setStack(parseInt(e.target.value))} />
          </label>
          {/* Seat input removed */}
          <button onClick={handleSitDown}>Sit Down</button>
        </form>
      )}


      {/* Show leave seat button if already sitting */}
      {!showForm && <button onClick={() => { setShowForm(true); handleLeaveSeat(); }}>Leave Seat</button>}
    </div>
  );
};

export default Seats;
