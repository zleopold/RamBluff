const Hand = require("pokersolver").Hand;
class Dealer {
    constructor() {
        this.deck = [
            'Ah', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', 'Jh', 'Qh', 'Kh',
            'Ac', '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', '10c', 'Jc', 'Qc', 'Kc',
            'Ad', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d', 'Jd', 'Qd', 'Kd',
            'As', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Js', 'Qs', 'Ks'
        ];
    }

    // Shuffles deck using Fisher-Yates algorithm
    shuffle() {
        let currentIndex = this.deck.length;

        while (currentIndex !== 0) {
            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            const tempVal = this.deck[currentIndex];
            this.deck[currentIndex] = this.deck[randomIndex];
            this.deck[randomIndex] = tempVal;
        }

        return this.deck;
    }

    // Gets one card from deck and removes it
    getCard() {
        return this.deck.pop();
    }

    // Deals player cards
    dealHands(players) {
        if (!Array.isArray(players)) {
            console.error('Invalid players array');
            return;
        }
        const numCards = 2;
        for (let i = 0; i < numCards; i++) {
            for (const player of players) {
                const card = this.getCard();
                player.cards.push(card);
            }
        }


        return players;
    }

    // Deals the first three community cards
    dealFlop() {
        const board = [];
        const burn = this.getCard();
        board.push(this.getCard(), this.getCard(), this.getCard());
        return board;
    }

    // Deals one community card, for turn and river
    dealTurnRiver() {
        const burn = this.getCard();
        return this.getCard();
    }

    resetDeck(){
        this.deck = [
            'Ah', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', 'Jh', 'Qh', 'Kh',
            'Ac', '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', '10c', 'Jc', 'Qc', 'Kc',
            'Ad', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', '10d', 'Jd', 'Qd', 'Kd',
            'As', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Js', 'Qs', 'Ks'
        ];
    }
}

module.exports = Dealer;








