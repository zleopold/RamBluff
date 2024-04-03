class Player {
    constructor(name, stack, seat, tableId) {
        this.name = name;
        this.stack = stack;
        this.seat = seat;
        this.tableId = tableId;
        this.cards = [];
    }
    
}

module.exports = Player;

