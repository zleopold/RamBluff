import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
const ENDPOINT = 'http://localhost:8080'; // Your server endpoint
const socket = io.connect(ENDPOINT);
const tableId = window.location.pathname.slice(-36);

const Seats = () => {
  const [playerData, setPlayerData] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [host, setHost] = useState(false);
  const [curPlayer, setPlayer] = useState(null);
  const [name, setName] = useState('');
  const [stack, setStack] = useState(0);
  const [seat, setSeat] = useState(null);
  const [pot, setPot] = useState(0);
  const [isTurn, setIsTurn] = useState(0);
  const [inGame, setInGame] = useState(false);
  const [isFirstRound, setIsFirstRound] = useState(true);
  const [tableBet, setTableBet] = useState(20);
  const [currentBet, setCurrentBet] = useState(0);
  const [comCards, setComCards] = useState([]);
  const [cantCheck, setCantCheck] = useState(false);
  const [cantRaise, setCantRaise] = useState(false);
  const [cantCall, setCantCall] = useState(false);
  const [allIn, setAllIn] = useState(false);
  const [raise, setRaise] = useState(tableBet * 2)

  useEffect(() => {
    socket.emit('joinRoom', tableId);

    socket.on('playersInRoom', (players) => {
      console.log('playersInRoom')
      setPlayerData(players);
    })

    socket.on('noSeats', () => {
      alert('Table is full');
    })

    socket.on('satDown', (players) => {
      setPlayerData(players);
    })

    socket.on('setSeat', (player) => {
      let seatNum = player.seat
      setSeat(seatNum);
    })

    socket.on('setPlayer', (player) => {
      setPlayer(player);
    })

    socket.on('setHost', () => {
      setHost(true);
    })

    socket.on('setInGame', () => {
      setInGame(true);
    })

    socket.on('setPreFlop', (players) => {
      for (let i = 0; i < players.length; i++) {
        if (players[i].big === true) {
          if (players[i + 1] != null) {
            setIsTurn(i+1);
          } else
            setIsTurn(0);
        }
        if (players[i].seat === seat && players[i].small === true){
          setCurrentBet(10);
        }
        if(players[i].seat === seat && players[i].big === true){
          setCurrentBet(20);
        }
      }
    
    })

    socket.on('setFlop', ({ flop, pot, players }) => {

    })

    socket.on('setAction', (newSeat) => {
      setIsTurn(newSeat);
    })

    setRaise(tableBet * 2);
    if (tableBet > currentBet) {
      setCantCheck(true);
    }
    if (stack === 0) {
      setCantCall();
      setAllIn(true);
    }
    if (stack === 0 || stack > tableBet) {
      setCantRaise();
    }


  }, [tableBet, stack, currentBet, seat, isTurn]);

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
    socket.emit('leavingSeat', curPlayer);
  };

  const handleStartGame = () => {
    socket.emit('startGame', tableId);
    setInGame(true);
  };

  const handleCheck = () => {
    if (isFirstRound) {
      socket.emit('frCheck', { tableId, seat });
    } else {
      socket.emit('check', { tableId, seat });
    }
  };

  const handleRaiseChange = (event) => {
    setRaise(event.target.value);
  };

  const handleRaise = (raise) => {
    setTableBet(raise);
    setStack(stack - raise);
    if (isFirstRound) {
      socket.emit('frRaise', { tableId, raise, seat });
    } else {
      socket.emit('raise', { tableId, raise, seat });
    }
  };
  const handleCall = () => {
    setStack(stack - tableBet);
    if (isFirstRound) {
      socket.emit('frCall', { tableId, tableBet, seat });
    } else {
      socket.emit('call', { tableId, tableBet, seat });
    }

  };
  const handleFold = () => {
    if (isFirstRound) {
      socket.emit('frFold', { tableId, seat })
    } else {
      socket.emit('fold', { tableId, seat })
    }
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
              Seat {index + 1}: {item.name} ({item.stack}) {' '}
              {index === seat &&
                <>
                  [{item.cards[0]} {' '} {item.cards[1]}]{' '}
                </>
              }
              {index !== seat && item.cards.length !== 0 &&
                <>
                  [x x]{' '}
                </>
              }
              Small: {item.small ? 'true' : 'false'}{' '}
              Big: {item.big ? 'true' : 'false'}{' '}
              Current Bet: {item.currentBet}{' '}
              {!showForm && index === seat &&
                <button onClick={() => { setShowForm(true); handleLeaveSeat(); }}>Leave Seat</button>}
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
      <div>
        {/* Show "Start Game" button for host */}
        {playerData.length >= 2 && host === true && !inGame && (
          <button onClick={handleStartGame}>Start Game</button>
        )}
        {isTurn === seat && inGame && (
          <button onClick={handleCheck} disabled={cantCheck}>Check </button>
        )}
        {isTurn === seat && inGame && (
          <><input type="number" value={raise} onChange={handleRaiseChange} /><button onClick={() => handleRaise(raise)} disabled={cantRaise}>
            Raise
          </button></>
        )}
        {isTurn === seat && inGame && (
          <button onClick={handleCall} disabled={cantCall}>Call </button>
        )}
        {isTurn === seat && inGame && (
          <button onClick={handleFold}>Fold </button>
        )}
      </div>
      <div>
        {inGame && (
          <span>
            Current Pot: {pot}
          </span>
        )}
      </div>
      <div>
        {inGame && (
          <span>
            Board: {comCards}
          </span>
        )}
      </div>

    </div>

  );
};

export default Seats;
