// App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import HomePage from './pages/HomePage'; // Import HomePage component
import Game from './pages/Game';
import "./styles/App.css";

const ENDPOINT = process.env.REACT_APP_SERVER_ENDPOINT;

const App = () => {
  useEffect(() => {
    const socket = io(ENDPOINT);

    socket.on('connect', () => {
      console.log('Connected to server!');
    });

    return () => {
      socket.disconnect(); // Clean up the socket connection
    };
  }, []);

  return (
    <div className="container">
      <div className="header-container">
        <div className="header">

        <p className='brand'>Ram Bluff</p>
        </div>
      </div>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:gameID" element={<Game />} />
        {/* Define other routes if needed */}
      </Routes>
    </Router>

    </div>
  );
};

export default App;
