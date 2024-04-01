// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Import HomePage component
import Game from './pages/Game';
import "./styles/App.css";
const App = () => {
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
