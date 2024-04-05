// -------- Server Packages ------------
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const socketIO = require('socket.io');
const Player = require('./Logic/player.js');
const Dealer = require('./Logic/dealer.js');
//---------------------------------------

// API Routes
const { utilRoutes, adminRoutes } = require("./API/routes");
const { table } = require('console');

const app = express();
const port = 8080;
const server = http.createServer(app);




// req response format
app.use(bodyParser.json());

app.use('/socket.io', express.static(__dirname + '/node_modules/socket.io/client-dist'));

// Permissions
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend origin
  methods: ['GET', 'POST'], // Add other methods as needed
  credentials: true, // Allow cookies and authorization headers
}));

const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
// API Routes
app.use("/admin", adminRoutes);
app.use("/util", utilRoutes);

// Holds players in all rooms
const rooms = new Map();

io.on('connection', (socket) => {
  // Adds new player to room
  socket.on('joinRoom', (tableId) => {
    socket.join(tableId);

    // If table doesnt exist initilize empty player list
    if (!rooms.has(tableId)) {
      const playersArray = new Array(10).fill(null);
      rooms.set(tableId, playersArray);
    }
    io.to(tableId).emit('playersInRoom', rooms.get(tableId));
  });



  socket.on('sittingDown', ({ name, stack, seat, tableId }) => {
    const player = new Player(name, stack, seat, tableId);
    const players = rooms.get(tableId)
    console.log('Updated', player);

    let index = 0;
    while (index < players.length && players[index]) {
      index++;
    }
    // Add new player to list
    if (index < players.length) {
      player.seat = index;
      players[index] = player;
      rooms.set(tableId, players);

      // Sends new player list to client 
      io.to(tableId).emit('satDown', { players, player });
    } else {
      socket.emit('noSeats');
    }
  });
  socket.on('leavingSeat', ({ seat, tableId }) => {
    const players = rooms.get(tableId);
    players[seat] = null;
    io.to(tableId).emit('playersInRoom', rooms.get(tableId));
  });
  
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
