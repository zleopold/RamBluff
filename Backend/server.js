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

// Holds players and dealers in all rooms
const rooms = new Map();
const dealers = new Map();

// This is to stop dealerTurn from being caught multiple times
const endRound = new Map();


function calculateHand(hand) {
  let total = 0;
  let aces = 0;

  for (var i = 0; i < hand.length; i++) {
    let curCard = hand[i];
    let ace = curCard.charAt(0);
    if (ace === 'A') {
      aces++;
    } else {
      let face = curCard.charAt(0);
      if (face === 'J' || face === 'Q' || face === 'K') {
        //  console.log('oldtotalface', total);
        total += 10;
        //  console.log('newtotalface', total);
      } else if (curCard.length === 3) { // Corrected this line
        total += 10;
      } else {
        total += parseInt(face);
      }
      // console.log('oldtotalnum', total);
    }
  }
  for (var j = aces; j > 0; j--) {
    if (total > (11 - j)) {
      // console.log('oldtotalace1', total);
      total += 1;
      //  console.log('newtotalace1', total);

    } else {
      //  console.log('oldtotalace11', total);
      total += 11;
      // console.log('newtotalace11', total);
    }
  }
  return total;

}


io.on('connection', (socket) => {
  // Adds new player to socket room
  socket.on('joinRoom', (tableId) => {
    socket.join(tableId);

    // If table doesnt exist initilize empty player list
    if (!rooms.has(tableId)) {
      const playersArray = new Array(10).fill(null);
      rooms.set(tableId, playersArray);
      const dealer = new Dealer();

      // Add a dealer for the table
      dealers.set(tableId, dealer);
    }
    // Updates the current player list for when a new player joins
    io.to(tableId).emit('playersInRoom', rooms.get(tableId));
  });



  socket.on('sittingDown', ({ name, stack, seat, tableId }) => {
    // Creates new player object
    const player = new Player(name, stack, seat, tableId);
    const players = rooms.get(tableId)

    let index = 0;
    while (index < players.length && players[index]) {
      index++;
    }
    // Add new player to list, assign their seat, update map
    // If it is the first player to join, they are host
    if (index < players.length) {
      player.seat = index;
      players[index] = player;
      rooms.set(tableId, players);
      if (player.seat == 0) {
        socket.emit('setHost');
      }
      
      // Sets seat on front end, for mapping of players
      socket.emit('setSeat', player);

      // Sets player object on front end for logic checks
      socket.emit('setPlayer', player);
  // Sends new player to player list to all clients
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
          // io.to(tableId).emit('checkDealt21');
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
    var players = rooms.get(tableId);
    players = players.filter(element => element !== undefined);
    players = players.filter(player => player !== null);
    players = players.filter(player => player.stack !== 0);
    players = players.filter(player => player.cards.length != 0);


    for (const player of players) {
      if (player.seat == seat) {
        if (calculateHand(player.cards) > 21) {
          return;
        }
        var dealer = dealers.get(tableId);
        let card = dealer.getCard();
        player.cards.push(card);
        dealers.set(tableId, dealer);

      }
      rooms.set(tableId, players);
    }
    io.to(tableId).emit('playersInRoom', players);
    io.to(tableId).emit('pageUpdate');
    io.to(tableId).emit('checkHand');

  })
  var count = 0;
  socket.on('playerStay', ({ tableId, seat }) => {
    // Get list of players, filter out null
    var players = rooms.get(tableId);
    players = players.filter(player => player !== undefined);
    players = players.filter(player => player !== null);
    players = players.filter(player => player.stack !== 0);
    players = players.filter(player => player.cards.length != 0);

    console.log('playerStayed', count);
    count++;



    let newSeat;
    if (players[seat + 1] != null) {
      newSeat = seat + 1;
      io.to(tableId).emit('setAction', newSeat);
    }
    for (const player of players) {
      console.log('last?', player.lastToAct);
      console.log('seat', player.seat);
      if (player.seat == seat && player.lastToAct) {
        console.log('pseat = seat and last');
        socket.emit('playerTurnOver');
      } else if (players.length == 1) {
        console.log('plength = 1');
        socket.emit('playerTurnOver');
      }
    }

  })

  socket.on('dealersTurn', (tableId) => {

    var isCaught = endRound.get(tableId) != null;
    if (!isCaught) {
      endRound.set(tableId, 'dealersTurn');
    } else {
      return;
    }


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
    while (dealerHandVal < 16) {
      dealer.dealCardDealer();
      dealerHandVal = calculateHand(dealer.hand);
    }
    console.log('Dealers hand', dealer.hand);
    console.log('Dealer has', dealerHandVal);
    io.to(tableId).emit('updateDealer', dealer);
    if (dealerHandVal > 21) {
      for (const player of players) {
        let playerHandVal = calculateHand(player.cards);
        console.log('Player Cards:', player.cards);
        if (playerHandVal < 21) {
          let wnum = calculateHand(player.cards);
          console.log('Player wins with:', wnum);
          let winnings = +player.currentBet + +player.currentBet;
          player.stack += +player.currentBet;
          player.stack += winnings;

        } else {
          let num = calculateHand(player.cards);
          console.log('Player loses with:', num);
        }
        player.currentBet = 0;
        player.cards = [];
      }
      dealer.hand = []
      dealer.upsideDownCard = '';
      dealer.resetDeck();
      dealer.shuffle();
      io.to(tableId).emit('playersInRoom', players);
      io.to(tableId).emit('updateDealer', dealer);
      io.to(tableId).emit('isPreRound');
      io.to(tableId).emit('setAction', 0);
      io.to(tableId).emit('newRound');
      return;
    }
    if (dealerHandVal == 21) {
      console.log('socket', socket.id);
      for (const player of players) {
        let playerHandVal = calculateHand(player.cards);
        console.log('Player Cards:', player.cards);
        if (playerHandVal == 21) {
          let wnum = calculateHand(player.cards);
          console.log('Player wins with:', wnum);
          let winnings = +player.currentBet + +player.currentBet;
          player.stack += +player.currentBet;
          player.stack += winnings;

        } else {
          let num = calculateHand(player.cards);
          console.log('Player loses with:', num);
        }
        player.currentBet = 0;
        player.cards = [];
      }
      dealer.hand = []
      dealer.upsideDownCard = '';
      dealer.resetDeck();
      dealer.shuffle();
      io.to(tableId).emit('playersInRoom', players);
      io.to(tableId).emit('updateDealer', dealer);
      io.to(tableId).emit('isPreRound');
      io.to(tableId).emit('setAction', 0);
      io.to(tableId).emit('newRound');
      return;
    }
    if (dealerHandVal < 21) {
      for (const player of players) {
        let playerHandVal = calculateHand(player.cards);
        console.log('Player Cards:', player.cards);
        if ((playerHandVal > dealerHandVal && playerHandVal < 21) || playerHandVal == 21) {
          let wnum = calculateHand(player.cards);
          console.log('Player wins with:', wnum);

          let winnings = +player.currentBet + +player.currentBet;
          player.stack += +player.currentBet;
          player.stack += winnings;

        } else {
          let num = calculateHand(player.cards);
          console.log('Player loses with:', num);
        }

        player.currentBet = 0;
        player.cards = [];
      }
      dealer.hand = [];
      dealer.upsideDownCard = '';
      dealer.resetDeck();
      dealer.shuffle();
      io.to(tableId).emit('playersInRoom', players);
      io.to(tableId).emit('updateDealer', dealer);
      io.to(tableId).emit('isPreRound');
      io.to(tableId).emit('setAction', 0);
      //this is used to update endRound which stops from multiple emission catches
      io.to(tableId).emit('newRound');
      return;
    }

  })

  socket.on('resetEndRound', (tableId) => {
    endRound.set(tableId, null);
  });


});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
