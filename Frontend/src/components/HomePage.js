// HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="homepage">
      <h1>RamBluff</h1>
      <div className="buttons">
        <Link to="/create">
          <button>Start Game</button>
        </Link>
        <Link to="/join">
          <button>Join Game</button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
