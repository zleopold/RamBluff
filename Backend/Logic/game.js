const Hand = require("pokersolver").Hand;
const Player = require("./player");

const deck = [
  "Ah",
  "2h",
  "3h",
  "4h",
  "5h",
  "6h",
  "7h",
  "8h",
  "9h",
  "10h",
  "Jh",
  "Qh",
  "Kh",
  "Ac",
  "2c",
  "3c",
  "4c",
  "5c",
  "6c",
  "7c",
  "8c",
  "9c",
  "10c",
  "Jc",
  "Qc",
  "Kc",
  "Ad",
  "2d",
  "3d",
  "4d",
  "5d",
  "6d",
  "7d",
  "8d",
  "9d",
  "10d",
  "Jd",
  "Qd",
  "Kd",
  "As",
  "2s",
  "3s",
  "4s",
  "5s",
  "6s",
  "7s",
  "8s",
  "9s",
  "10s",
  "Js",
  "Qs",
  "Ks",
];
class Game 
{
  constructor(roomID) {
    this.roomID = roomID;
    this.players = new Map();
    this.pot = 0;
    this.rotation = [];
    this.cardValues = new Map();
    this.cardValues.set('2h', 2);
    this.cardValues.set('3h', 3);
    this.cardValues.set('4h', 4);
    this.cardValues.set('5h', 5);
    this.cardValues.set('6h', 6);
    this.cardValues.set('7h', 7);
    this.cardValues.set('8h', 8);
    this.cardValues.set('9h', 8);
    this.cardValues.set('10h', 8);
    this.cardValues.set('2c', 2);
    this.cardValues.set('3c', 3);
    this.cardValues.set('4c', 4);
    this.cardValues.set('5c', 5);
    this.cardValues.set('6c', 6);
    this.cardValues.set('7c', 7);
    this.cardValues.set('8c', 8);
    this.cardValues.set('9c', 8);
    this.cardValues.set('10c', 8);
    this.cardValues.set('2s', 2);
    this.cardValues.set('3s', 3);
    this.cardValues.set('4s', 4);
    this.cardValues.set('5s', 5);
    this.cardValues.set('6s', 6);
    this.cardValues.set('7s', 7);
    this.cardValues.set('8s', 8);
    this.cardValues.set('9s', 8);
    this.cardValues.set('10s', 8);

    this.cardValues.set('Ks', 10);
    this.cardValues.set('Kc', 10);
    this.cardValues.set('Kh', 10);

    this.cardValues.set('Qs', 10);
    this.cardValues.set('Qc', 10);
    this.cardValues.set('Qh', 10);

    this.cardValues.set('Js', 10);
    this.cardValues.set('Jc', 10);
    this.cardValues.set('Jh', 10);

    this.cardValues.set('As', 10);
    this.cardValues.set('Ac', 10);
    this.cardValues.set('Ah', 10);

  }
  addPlayer(player) {this.players.set(player.socketID, player);}
  



}

module.exports = Game;
