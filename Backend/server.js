const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const uuid = require('uuid');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from http://localhost:3000
}));

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'RamBluffRoot',
  database: 'rambluff_db',
});

const server = http.createServer(app);

// Move the CORS configuration to before initializing Socket.IO
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // Allow requests from http://localhost:3000
    methods: ['GET', 'POST'], // Specify allowed methods
  },
});

io.on('connection', (socket) => {

  socket.emit('message', 'Welcome to Rambluff!');

  socket.on('chatMessage', (message) => {
    console.log('Received message from client:', message);
    io.emit('chatMessage', message);
  });

  socket.on('disconnect', () => {
  });

  socket.on('sitDown', (seatIndex) => {
    io.emit('sitDown', seatIndex);
  });

  // Inside the handler for 'confirmSitDown' event
socket.on('confirmSitDown', ({ playerName, stackSize, selectedSeatIndex, tableId }) => {
  const sql = 'INSERT INTO players (name, seat_number, stack_size, table_id) VALUES (?, ?, ?, ?)';
  pool.query(sql, [playerName, selectedSeatIndex + 1, stackSize, tableId], (error, results) => {
    if (error) {
      console.error('Error inserting player:', error);
    } 
  });
});

  

  socket.on('leaveSeat', (seatIndex) => {
    io.emit('leaveSeat', seatIndex);
  });
});

app.post('/createTable', (req, res) => {
  const { tableName, password } = req.body;

  if (!tableName || tableName.trim() === '') {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  const checkSql = 'SELECT COUNT(*) AS count FROM tables WHERE name = ?';
  pool.query(checkSql, [tableName], (checkError, checkResults) => {
    if (checkError) {
      console.error('Error checking table:', checkError);
      return res.status(500).json({ error: 'Failed to check table' });
    }

    const tableExists = checkResults[0].count > 0;
    if (tableExists) {
      return res.status(400).json({ error: 'Table with the same name already exists' });
    }

    const tableId = uuid.v4();

    const sql = 'INSERT INTO tables (id, name) VALUES (?, ?)';
    pool.query(sql, [tableId, tableName], (error, results) => {
      if (error) {
        console.error('Error creating table:', error);
        return res.status(500).json({ error: 'Failed to create table' });
      }

      io.emit('tableCreated', { tableId, tableName });

      res.status(201).json({ tableId });
    });
  });
});

app.post('/addPlayer', (req, res) => {
  const { name, seatNumber, stackSize, tableId } = req.body;

  // Check if a player with the same seat number and table ID already exists
  const checkSql = 'SELECT COUNT(*) AS count FROM players WHERE seat_number = ? AND table_id = ?';
  pool.query(checkSql, [seatNumber, tableId], (checkError, checkResults) => {
    if (checkError) {
      console.error('Error checking player:', checkError);
      return res.status(500).json({ error: 'Failed to check player' });
    }

    const playerExists = checkResults[0].count > 0;
    if (playerExists) {
      console.log('Player already exists in this seat');
      return res.status(400).json({ error: 'Player already exists in this seat' });
    }

    // If player doesn't exist, insert them into the database
    const insertSql = 'INSERT INTO players (name, seat_number, stack_size, table_id) VALUES (?, ?, ?, ?)';
    pool.query(insertSql, [name, seatNumber, stackSize, tableId], (error, results) => {
      if (error) {
        console.error('Error adding player to database:', error);
        return res.status(500).json({ error: 'Failed to add player' });
      }

      console.log('Player added to database:', { name, seatNumber, stackSize, tableId });
      res.status(201).json({ message: 'Player added successfully' });
    });
  });
});


app.get('/playersAtTable', (req, res) => {
  const {tableId} = req.query; // Extract table ID from the request query

  // Query the database to fetch players at the specified table ID
  const sql = 'SELECT * FROM players WHERE table_id = ?';
  pool.query(sql, [tableId], (error, results) => {
    if (error) {
      console.error('Error fetching players at table:', error);
      return res.status(500).json({ error: 'Failed to fetch players at table' });
    }

    res.status(200).json({ players: results }); // Send the fetched players back to the client
  });
});


app.get('/tables', (req, res) => {
  const sql = 'SELECT * FROM tables';
  pool.query(sql, (error, results) => {
    if (error) {
      console.error('Error fetching tables:', error);
      return res.status(500).json({ error: 'Failed to fetch tables' });
    }

    res.status(200).json(results);
  });
});

// Existing imports and setup code...

app.delete('/removePlayer/:tableId/:seatIndex', (req, res) => {
  const { tableId, seatIndex } = req.params;

  console.log('Removing player from database:', { tableId, seatIndex });

  const sql = 'DELETE FROM players WHERE table_id = ? AND seat_number = ?';
  pool.query(sql, [tableId, seatIndex], (error, results) => {
    if (error) {
      console.error('Error removing player from database:', error);
      return res.status(500).json({ error: 'Failed to remove player' });
    }

    console.log('Player removed from database:', { tableId, seatIndex });
    res.status(200).json({ message: 'Player removed successfully' });
  });
});


server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
