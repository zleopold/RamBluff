// -------- Server Packages ------------
const Player = require('./Logic/Player.js');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const socketIO = require('socket.io');
//---------------------------------------

// API Routes
const {utilRoutes, adminRoutes} = require("./API/routes");

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
app.use("/admin",adminRoutes);
app.use("/util",utilRoutes);


io.on('connection', (socket) => {  
  socket.on('sendingPlayer', ({ playerName, stackSize, seatIndex, tableId }) => {
    // Handle the confirmation of a player sitting down here
    console.log('Player confirmed sit down:', playerName, stackSize, seatIndex, tableId);
    const player = new Player(playerName, stackSize, seatIndex, tableId);
    // Emit an event to all clients or a specific room if needed
    socket.broadcast.emit('returningPlayer', 
    { playerName: player.name, 
      stackSize: player.stack, 
      seat : player.seat, 
      tableId: player.tableId });
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
