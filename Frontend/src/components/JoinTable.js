import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import Axios for API requests

const JoinTable = () => {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    // Fetch tables data from the backend
    axios.get('http://localhost:3001/tables')
      .then((response) => {
        const sortedTables = response.data.sort((a, b) => a.name.localeCompare(b.name)); // Sort tables alphabetically
        setTables(sortedTables); // Update state with sorted tables data
      })
      .catch((error) => {
        console.error('Error fetching tables:', error);
      });
  }, []); // Empty dependency array ensures useEffect runs only once on component mount

  return (
    <div className="join-table">
      <h1>Join Table</h1>
      <ul>
        {tables.map((table) => (
          <li key={table.id}>
            <Link to={`/table/${table.id}`}>{table.name}</Link>
          </li>
        ))}
      </ul>
      <Link to="/">Back to Home</Link> {/* Link to navigate back to the homepage */}
    </div>
  );
};

export default JoinTable;
