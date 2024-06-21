class Room {
  constructor() {
    this.players = new Set();
    this.ID = Math.floor(Math.random() * 1000000) + 1;
    this.done = 0;
    this.problem = "";
    this.join = this.join.bind(this);
  }

  join(client) {
    this.players.add(client);
    client.roomID = this.ID;
  }
}

module.exports.Room = Room;
