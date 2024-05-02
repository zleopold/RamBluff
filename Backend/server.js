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
const dealers = new Map();


function calculateHand(hand) {
  let total = 0;
  hand.map(card => {
    let val = card.split('')[0];
    let val_int;
    if (val === 'K' || val === 'Q' || val === 'J') {
      val_int = 10;
    } else if (val === 'A') {
      if (11 + total > 21) { val_int = 1; }
      else { val_int = 11; }
    } else { val_int = parseInt(val); }

    total += val_int
  })
  return total;

}

io.on('connection', (socket) => {
  // Adds new player to room
  socket.on('joinRoom', (tableId) => {
    socket.join(tableId);

    // If table doesnt exist initilize empty player list
    if (!rooms.has(tableId)) {
      const playersArray = new Array(10).fill(null);
      rooms.set(tableId, playersArray);
      const dealer = new Dealer();
      dealers.set(tableId, dealer);
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

    // Sets last player as last to act
    players[players.length - 1].lastToAct = true;
    rooms.set(tableId, players);

    // Create dealer, shuffle deck, update dealer
    var dealer = dealers.get(tableId)
    dealer.shuffle();
    dealers.set(tableId, dealer);

    // Set all clients' dealer 
    io.to(tableId).emit('setDealer', dealer);
  });

  // Handles players betting 
  socket.on('playerBet', ({ tableId, seat, bet }) => {
    // Get list of players, filter out null
    var players = rooms.get(tableId);
    players = players.filter(player => player !== null);
    players = players.filter(player => player.stack !== 0);
    players = players.filter(element => element !== undefined);

    let newSeat;
    if (players[seat + 1] != null) {
      newSeat = seat + 1;
      io.to(tableId).emit('setAction', newSeat);
    }
    for (const player of players) {
      // Gets current player updates their bet/stack for table
      if (player.seat == seat) {
        player.currentBet = bet;
        player.stack -= bet;
        io.to(tableId).emit('playersInRoom', players);


        // If they are last, deal cards 
        if (player.lastToAct == true) {
          io.to(tableId).emit('notPreRound');

          // Deal first cards to players / dealer
          var dealer = dealers.get(tableId);
          players = dealer.dealCardPlayers(players);
          rooms.set(tableId, players);
          io.to(tableId).emit('playersInRoom', players);

          dealer.dealCardDealer();
          dealers.set(tableId, dealer);
          io.to(tableId).emit('updateDealer', dealer);

          // Deal second cards to players / dealer
          players = dealer.dealCardPlayers(players);
          rooms.set(tableId, players);
          io.to(tableId).emit('playersInRoom', players);

          dealer.dealUpsideDownCardDealer();
          dealers.set(tableId, dealer);
          io.to(tableId).emit('updateDealer', dealer);
          io.to(tableId).emit('checkDealt21');
          io.to(tableId).emit('setAction', 0);

        }
      }
    }
  })
  socket.on('checkingDealt21', (tableId) => {
    var players = rooms.get(tableId);
    players = players.filter(player => player !== null);
    players = players.filter(player => player.stack !== 0);
    players = players.filter(player => player.cards.length !== 0);
    players = players.filter(element => element !== undefined);

    for (const player of players) {
      let playerHandVal = calculateHand(player.cards);
      let winner = false;
      if (playerHandVal == 21) {
        winner = true;
      }
      if (winner) {
        player.stack = player.currentBet * 1.5;
        player.currentBet = 0;
        player.cards = [];
      }
    }
    players[players.length - 1].lastToAct = true;
    io.to(tableId).emit('playersInRoom', tableId);
  })

  socket.on('playerHit', ({ tableId, seat }) => {
    // Get list of players, filter out null
    console.log('playerHit');
    var players = rooms.get(tableId);
    players = players.filter(element => element !== undefined);
    players = players.filter(player => player !== null);
    players = players.filter(player => player.stack !== 0);
    players = players.filter(player => player.cards.length != 0);


    for (const player of players) {
      if (player.seat == seat) {
        var dealer = dealers.get(tableId);
        let card = dealer.getCard();
        player.cards.push(card);
        dealers.set(tableId, dealer);
      }
    }
    io.to(tableId).emit('playersInRoom', players);
    io.to(tableId).emit('checkHand');

  })

  socket.on('playerStay', ({ tableId, seat }) => {
    // Get list of players, filter out null
    var players = rooms.get(tableId);
    players = players.filter(player => player !== undefined);
    players = players.filter(player => player !== null);
    players = players.filter(player => player.stack !== 0);
    players = players.filter(player => player.cards.length != 0);
    

    let newSeat;
    if (players[seat + 1] != null) {
      newSeat = seat + 1;
      io.to(tableId).emit('setAction', newSeat);
    }
    for (const player of players) {
      if (player.seat == seat && player.lastToAct) {
        socket.emit('playerTurnOver')
      }
    }

  })

  socket.on('dealersTurn', (tableId) => {
    // Get list of players, filter out null
    var players = rooms.get(tableId);
    players = players.filter(player => player !== null);
    players = players.filter(player => player.stack !== 0);
    players = players.filter(player => player.cards.length != 0);
    players = players.filter(element => element !== undefined);

    var dealer = dealers.get(tableId);
    dealer.flipCard();

    io.to(tableId).emit('updateDealer', dealer);
    let dealerHandVal = calculateHand(dealer.hand);
    console.log('dealer hand', dealerHandVal);
      while (dealerHandVal < 16) {
        console.log('socket', socket.id);
        console.log('< 16:', dealer.hand)
        dealer.dealCardDealer();
        dealerHandVal = calculateHand(dealer.hand);
      }
    if (dealerHandVal > 21) {
      console.log('socket', socket.id);
      console.log('> 21:', dealer.hand)
      for (const player of players) {
        player.stack = player.currentBet * 2;
        player.currentBet = 0;
        player.cards = [];
      }
      dealer.hand = []
      dealer.upsideDownCard = '';
      dealer.resetDeck();
      dealer.shuffle();
      io.to(tableId).emit('playersInRoom', players);
      io.to(tableId).emit('isPreRound');
      io.to(tableId).emit('setAction', 0);
    }
    if (dealerHandVal == 21) {
      console.log('socket', socket.id);
      console.log('= 21:', dealer.hand)
      for (const player of players) {
        let playerHandVal = calculateHand(player.cards);
        if (playerHandVal == 21) {
          player.stack = player.currentBet * 2;
          player.currentBet = 0;
          player.cards = [];
        }
      }
      dealer.hand = []
      dealer.upsideDownCard = '';
      dealer.resetDeck();
      dealer.shuffle();
      io.to(tableId).emit('playersInRoom', players);
      io.to(tableId).emit('isPreRound');
      io.to(tableId).emit('setAction', 0);
    }
    if (dealerHandVal < 21) {
      console.log('socket', socket.id);
      console.log('< 21:', dealer.hand)
      for (const player of players) {
        let playerHandVal = calculateHand(player.cards);
        if (playerHandVal > dealerHandVal) {
          player.stack = player.currentBet * 2;
          player.currentBet = 0;
          player.cards = [];
        }
      }
      dealer.hand = [];
      dealer.upsideDownCard = '';
      dealer.resetDeck();
      dealer.shuffle();
      io.to(tableId).emit('playersInRoom', players);
      io.to(tableId).emit('isPreRound');
      io.to(tableId).emit('setAction', 0);
    }
  })


});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
