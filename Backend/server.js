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
  origin: 'http://localhost:3000', 
  methods: ['GET', 'POST'], 
  credentials: true, 
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

    let index = 0;
    while (index < players.length && players[index]) {
      index++;
    }
    // Add new player to list
    if (index < players.length) {
      player.seat = index;
      players[index] = player;
      rooms.set(tableId, players);
      if (player.seat == 0) {
        socket.emit('setHost');
      }

      // Sends new player to client and player list to all clients
      socket.emit('setSeat', player);
      socket.emit('setPlayer', player);
      io.to(tableId).emit('satDown', players);
    } else {
      socket.emit('noSeats');
    }
  });
  socket.on('leavingSeat', (player) => {
    const players = rooms.get(player.tableId);
    players[player.seat] = null;
    io.to(player.tableId).emit('playersInRoom', rooms.get(player.tableId));
  });

  socket.on('startGame', (tableId) => {
    // Set all clients ingame to true
    io.to(tableId).emit('setInGame');
    // Get list of players, filter out null
    var players = rooms.get(tableId);
    players = players.filter(player => player !== null);
    players = players.filter(player => player.stack !== 0);

    // Set starting blinds
    players[0].small = true;
    players[0].currentBet = 10;
    players[0].stack = players[0].stack - 10;

    players[1].big = true;
    players[1].lastToAct = true; 
    players[1].currentBet = 20;
    players[1].stack = players[1].stack - 20;

    // Create deck, shuffle, deal hands, update hashmap
    const dealer = new Dealer();
    dealer.shuffle();
    players = dealer.dealHands(players);
    rooms.set(tableId, players);


    io.to(tableId).emit('playersInRoom', players);
    io.to(tableId).emit('setPreFlop', players);

  });
  socket.on('frCheck', ({ tableId, seat }) => {
    var players = rooms.get(tableId);
    players = players.filter(player => player.cards.length != 0);
    
    for (const player of players) {
      if (player.seat === seat && player.lastToAct == true) {
        flop = dealer.dealFlop();
        let pot = 0;
        for (const playerx of players){
          pot += playerx.currentBet;
          playerx.currentBet = 0; 
        }
        io.to(tableId).emit('setFlop', { flop, pot, players })
        io.to(tableId).emit('playersInRoom', players);
      } else {
        for (let i = 0; i < players.length; i++){
          let newSeat;
          if(players[i].seat = seat){
            if(players[i + 1] != null){
              newSeat = i + 1;
            } else {
              newSeat = 0;
            }
          }
        }
        io.to(tableId).emit('setAction', newSeat)
      }
    }   
  });

  socket.on('frRaise', ({ tableId, raise, seat }) => {
    var players = rooms.get(tableId);
    players = players.filter(player => player.cards.length != 0);
    for(const player of players){
      player.lastToAct = false;
      if(player.seat == seat){
        player.stack -= raise;
        player.currentBet = raise;
        player.lastToAct = true; 
      }
    }
    io.to(tableId).emit('playersInRoom', players);
    for (let i = 0; i < players.length; i++){
      newSeat = seat;
      if(players[i].seat = seat){
        if(players[i + 1] != null){
          newSeat = players[i+1].seat;
        } else {
          newSeat = players[0].seat;
        }
      }
    }
    io.to(tableId).emit('setAction', newSeat)
  });

  socket.on('frCall', ({ tableId, tableBet, seat }) => {
      var players = rooms.get(tableId);
      players = players.filter(player => player !== null);
      players = players.filter(player => player.cards.length != 0);
      for (const player of players){
        if (player.seat === seat){
          player.stack -= tableBet;
          player.currentBet = tableBet;
          if(player.lastToAct == true){
            flop = dealer.dealFlop();
            let pot = 0;
            for (const playerx of players){
              pot += playerx.currentBet;
              playerx.currentBet = 0; 
            }
            io.to(tableId).emit('setFlop', { flop, pot, players })
            io.to(tableId).emit('playersInRoom', players);
            console.log('lasttoact');
          } else {
            let newSeat = seat;
            for (let i = 0; i < players.length; i++){
              if(players[i].seat = seat){
                if(players[i + 1] != null){
                  newSeat = players[i+1].seat;
                } else {
                  newSeat = players[0].seat;
                }
              }
            }
            io.to(tableId).emit('setAction', newSeat)
          }
          break;
        }
      }
  });

  socket.on('frFold', ({ tableId, seat }) => {
    var players = rooms.get(tableId);
    players = players.filter(player => player.cards.length != 0);
    for (const player of players){
      if(player.seat == seat){
        player.cards = []; 
      }
    }
    io.to(tableId).emit('playersInRoom', players);
    for (let i = 0; i < players.length; i++){
      newSeat = seat;
      if(players[i].seat = seat){
        if(players[i + 1] != null){
          newSeat = players[i+1].seat;
        } else {
          newSeat = players[0].seat;
        }
      }
    }
    io.to(tableId).emit('setAction', newSeat)
  });

  socket.on('check', ({ tableId, seat }) => {
    var players = rooms.get(tableId);
    for (const player of players) {
      if (player.seat === seat) {

      }
    }
  })

  socket.on('raise', ({ tableId, raise, seat }) => {
    var players = rooms.get(tableId);
  })

  socket.on('call', ({ tableId, tableBet, seat }) => {
    var players = rooms.get(tableId);
  })

  socket.on('fold', ({ tableId, seat }) => {
    var players = rooms.get(tableId);
  })

});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
