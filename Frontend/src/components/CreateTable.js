import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import Axios for HTTP requests

const CreateTablePage = ({ history }) => {
  const [tableName, setTableName] = useState('');
  const [password, setPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);

  const handleCreateTable = async () => {
    if (tableName.trim() !== '') {
      try {
        const response = await axios.post('http://localhost:3001/createTable', {
          tableName,
          password,
        });
        const tableId = response.data.tableId; // Assuming backend returns the generated table ID
        console.log('TableID:', tableId);
        window.location.href = `/table/${tableId}`; // Redirect to the created table page
        
      } catch (error) {
        console.error('Error creating table:', error);
        
        alert('This table name is taken.');
      }
    } else {
      alert('Please enter a valid table name.');
    }
  };

  return (
    <div>
      <h1>Create Table</h1>
      <label>
        Table Name:
        <input
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
        />
      </label>
      <br />
      <label>
        Has Password:
        <input
          type="checkbox"
          checked={hasPassword}
          onChange={() => setHasPassword(!hasPassword)}
        />
      </label>
      <br />
      {hasPassword && (
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      )}
      <br />
      <button onClick={handleCreateTable}>Create Table</button>
      <br />
      <Link to="/">Back to Home</Link>
    </div>
  );
};

export default CreateTablePage;

