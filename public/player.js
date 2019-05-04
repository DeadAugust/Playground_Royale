let coolDefault = 3;

class Player {
  constructor(name, r, g, b) {
    // this.color = color || playerDefault;
    this.r = r;
    this.g = g;
    this.b = b;
    this.cool = coolDefault;
    this.id; //add socket id
    this.index;
    this.name = name;
    this.tag = "player";
    this.home = false; //if they left school and went home
    this.moved = true;
    this.timerReset = false;
  }
}


// let playerDefault = "blue";
// let hpDefault = 10;
// let atkDefault = 1;
// let spdDefault = 1;

// class Player {
//   constructor(name, r, g, b) {
//     // this.color = color || playerDefault;
//     this.r = r;
//     this.g = g;
//     this.b = b;
//     this.item = 0;
//     this.hp = hpDefault;
//     this.atk = atkDefault;
//     this.spd = spdDefault;
//     this.id; //add socket id
//     this.index;
//     this.name = name;
//     this.tag = "player";
//     this.score = 0;
//     this.dead = false;
//     this.stroke = 0;
//   }
//   interaction(neighbors){
//     for (let i = 0; i < neighbors.length; i++){
//       //item -- for later, one at a time
//       if (neighbors[i] instanceof Item) {
//         this.item = neighbors[i].color;
//       }
//       //player
//       if (neighbors[i] instanceof Player) {
//         let pairID = neighbors[i].id;
//         this.pairing(this.item, pairID);
//       }
//     }
//   }
//   pairing(item, id){
//     //socket event
//     let trade = {
//       item: item,
//       pairID: this.id
//     }
//     console.log('trade');
//     //socket.emit('pair', trade);
//   }
// }