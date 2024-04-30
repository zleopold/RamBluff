class Player {
    constructor(name, stack, seat, tableId, small, big) {
        this.name = name;
        this.stack = stack;
        this.currentBet = 0;
        this.seat = seat;
        this.tableId = tableId;
        this.cards = [];
        this.small = false;
        this.big = false;
        this.lastToAct = false;
    }
    
}

module.exports = Player;

