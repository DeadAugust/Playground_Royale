// Create server
let port = process.env.PORT || 8000;
let express = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function () {
  console.log('Server listening at port: ', port);
});

// Tell server where to look for files
app.use(express.static('public'));

// Create socket connection
let io = require('socket.io').listen(server);

// Keep track of all connected players
let users = []; //sockets
let scoreboard = []; //players, score, index

//settings from start screen
let settings = {};

//mega game state array 
let map = []

let mapWidth = 10;
let mapHeight = 10;
let mapMax = mapWidth * mapHeight;
// let mapScale = 10;
let mapScale;

let gameStarted = false;

let p1Scale = 3; //for primary in pair
let p2Scale = 1; //for target in pair

//update heartbeat
setInterval(function(){
  if(gameStarted){ //to get rid of issue of server overwriting map
    
    //putting trade here b/c want it to happen no matter what, not just on move
    //but is this too crazy to happen every 33?
    for (let i = 0; i < scoreboard.length; i ++){
      let p1 = scoreboard[i];//player 1
      // if (p1.item != 0){ //if they have an item
        for (let j = 0; j < scoreboard.length; j++){
          let p2 = scoreboard[j]; //player 2
          // if(p2.dead == false){//only trade with the living
            
            //check to see if any other players are adjacent
            if(((p1.index - mapWidth) == p2.index) ||
              ((p1.index + mapWidth) == p2.index) ||
              ((p1.index + 1) == p2.index) ||
              ((p1.index - 1) == p2.index)){
                // //trigger trade
                // // paired(p1, p2);
                // let item = p1.item;
                // p1.stroke = p1.item;
                // if (item == "Red"){ //hp
                //   p1.hp += p1Scale;
                //   p2.hp += p2Scale;
                // }
                // if (item == "Cyan"){ //score
                //   p1.score += p1Scale;
                //   p2.score += p2Scale;
                // }
                // if (item == "GreenYellow"){ //attack
                //   p1.hp -= p2Scale;
                //   p2.hp -= p1Scale;
                //   if (p1.hp <= 0){
                //     p1.dead = true;
                //   }
                //   if (p2.hp <= 0){
                //     p2.dead = true;
                //   }
                // }
                // if (item == "Purple"){ //speed
                //   p1.spd += p1Scale;
                //   p2.spd += p2Scale;
                // }
                // p1.item = 0;

                //this stuff is getting really redundant and out of hand...
                scoreboard[i] = p1;
                map[scoreboard[i].index] = p1;
                scoreboard[j] = p2;
                map[scoreboard[j].index] = p2;
              
              //trigger the high five screen event
              //socket.emit(
            }
          }
        }
      }
    }
    
    
    
    
    let data = {
      map: map,
      scoreboard: scoreboard //should update this in server, yeah?
    }
    players.emit('update', data); //io.sockets didn't work?
    screen.emit('update', data);
  }
}, 33);

//item spawning
setInterval(function(){
  if(gameStarted){
    //pick random item
    let test = Math.floor(Math.random() * items.length)
    let item = items[Math.floor(Math.random() * items.length)]
    // console.log(item, test);
    //pick random spawn location
    let startIndex = Math.floor(Math.random() * mapMax);
    if (map[startIndex].tag == "grass"){
      map[startIndex] = new Item(item, startIndex);
    }
    //no else, for more randomness? not always regular interval, esp with more players
  }
}, spawnRate);


//player sockets
let players = io.of('/players'); //had to change because was counting screen as player
players.on('connection',
  // Callback function on connection
  // Comes back with a socket object
  function (socket) {

    console.log("We have a new player: " + socket.id);

    // Add socket to queue
    users.push(socket);
    
    //after player set up done
    socket.on('ready', function(info){
      // console.log('ready');
      let playerInfo ={
        name: info.name,
        // index: startIndex,
        r: info.r,
        g: info.g,
        b: info.b,
        id: socket.id
      }
      screen.emit('newPlayer', playerInfo);
    });
  
    //player movement
    socket.on('move', function(dir){
      if (dir.key == "up"){
        let spot = dir.index - mapWidth;
        let itemBlock = false;
        if (map[spot] != undefined){
          if (map[spot].tag == "item"){
            if (map[dir.index].item == 0){ //so only if no item already
              map[dir.index].item = map[spot].color;
              for (let i = 0; i < scoreboard.length; i++){
                if (scoreboard[i].id == map[dir.index].id){
                  scoreboard[i].item = map[dir.index].item;
                  // console.log(scoreboard);
                }
              }
            }
            else{
              itemBlock = true;
            }
          }
          if (spot >= 0 && map[spot].tag != "player" && !itemBlock){ //item blocks or can run over?
            // console.log('up');
            for (let i = 0; i < scoreboard.length; i++){
              if (scoreboard[i].id == ("/players#" + dir.id)){
                let me = map[dir.index];
                map[dir.index - mapWidth] = me; //y can't just assign to map[d.i]?
                scoreboard[i].index = dir.index - mapWidth;
                let newGrass = new Grass();
                map[dir.index] = newGrass;
              }          
            }
          }
        }
      }
      if (dir.key == "down"){
        let spot = dir.index + mapWidth;
        let itemBlock = false;
        if (map[spot] != undefined){
          if (map[spot].tag == "item"){
            if (map[dir.index].item == 0){ //so only if no item already
              map[dir.index].item = map[spot].color;
              for (let i = 0; i < scoreboard.length; i++){
                if (scoreboard[i].id == map[dir.index].id){
                  scoreboard[i].item = map[dir.index].item;
                  // console.log(scoreboard);
                }
              }
            }
            else{
              itemBlock = true;
            }
          }
          if (spot < mapMax && map[spot].tag != "player" && !itemBlock){
          // if (dir.index + mapWidth < mapMax){
            // console.log('down');
            for (let i = 0; i < scoreboard.length; i++){
              if (scoreboard[i].id == ("/players#" + dir.id)){
                let me = map[dir.index];
                map[dir.index + mapWidth] = me; //y can't just assign to map[d.i]?
                scoreboard[i].index = dir.index + mapWidth;
                let newGrass = new Grass();
                map[dir.index] = newGrass;
              }          
            }
          } 
        }
      }
      if (dir.key == "left"){
        let spot = dir.index;
        let itemBlock = false;
        if (map[spot] != undefined || map[spot-1] != undefined){
          if (map[spot - 1].tag == "item"){
            if (map[dir.index].item == 0){ //so only if no item already
              map[dir.index].item = map[spot - 1].color;
              for (let i = 0; i < scoreboard.length; i++){
                if (scoreboard[i].id == map[dir.index].id){
                  scoreboard[i].item = map[dir.index].item;
                  // console.log(scoreboard);
                }
              }
            }
            else{
              itemBlock = true;
            }
          }
          if (spot % mapWidth != 0 && map[spot - 1].tag != "player" && !itemBlock){
            // console.log('left');
            for (let i = 0; i < scoreboard.length; i++){
              if (scoreboard[i].id == ("/players#" + dir.id)){
                let me = map[dir.index];
                map[dir.index - 1] = me; //y can't just assign to map[d.i]?
                scoreboard[i].index = dir.index - 1;
                let newGrass = new Grass();
                map[dir.index] = newGrass;
              }          
            }
          } 
        }
      }
      if (dir.key == "right"){
        let spot = (dir.index + 1);
        let itemBlock = false;
        if (map[spot] != undefined){
          if (map[spot].tag == "item"){
            if (map[dir.index].item == 0){ //so only if no item already
              map[dir.index].item = map[spot].color;
              for (let i = 0; i < scoreboard.length; i++){
                if (scoreboard[i].id == map[dir.index].id){
                  scoreboard[i].item = map[dir.index].item;
                  // console.log(scoreboard);
                }
              }
            }
            else{
              itemBlock = true;
            }
          }
          if (spot % mapWidth != 0 && map[spot].tag != "player" && !itemBlock){
            // console.log('right');
            for (let i = 0; i < scoreboard.length; i++){
              if (scoreboard[i].id == ("/players#" + dir.id)){
                let me = map[dir.index];
                map[dir.index + 1] = me; //y can't just assign to map[d.i]?
                scoreboard[i].index = dir.index + 1;
                let newGrass = new Grass();
                map[dir.index] = newGrass;
              }          
            }
          }
        }
      }
    });
  
    socket.on('drop', function(){ //for now, destroys instead of leaving behind on map
      for (let i = 0; i < scoreboard.length; i++){
        if (scoreboard[i].id == socket.id){
          map[scoreboard[i].index].item = 0;
        }          
      }
    });

    // Listen for this client to disconnect
    socket.on('disconnect', function() {
      // io.sockets.emit('disconnected', socket.id);
      console.log('player disconnected ' + socket.id);
      // Remove socket from player queue
      for(let s = users.length - 1; s >= 0; s--) {
        if(users[s].id == socket.id) {
          users.splice(s, 1);
        }
      }
      for(let s = scoreboard.length - 1; s >= 0; s--) {
        if(scoreboard[s].id == ("/players#" + socket.id)) {
          let gone = scoreboard[s].index;
          map[gone] = new Grass();
          scoreboard.splice(s, 1);
        }
      }
    });
  }); 

// screen socket
let screen = io.of('/screen');
screen.on('connection',
  function (socket) {
    console.log("Screen has connected: " + socket.id);

    //when the screen sets up the game and presses start
    socket.on('start', function(game) {
      //sets the variables according to the settings
      startSettings = game.settings;
      map = game.map;
      scoreboard = game.scoreboard;
      // console.log(scoreboard);
      gameStarted = true;
      spawnRate = (3000 / scoreboard.length); //eyyy
      players.emit('start'); //just for gameStarted
    });
  
    //updated scoreboard
    socket.on('scores', function(board){
      // console.log('scoreboard');
      // console.log(scoreboard);
      scoreboard = board;
    });

    // Listen for the screen to disconnect
    socket.on('disconnect', function() {
      // io.sockets.emit('disconnected', socket.id);
      console.log("screen has disconnected");
      //will reset everything
      map = [];
      scoreboard = [];
      gameStarted = false;
      //should emit a reset event to all players -- recalls setup()?
      // players.emit('reset');
    });
});
/*
let p1Scale = 3;
let p2Scale = 1;
function paired(p1, p2){
  let item = p1.item;
  if (item == "Red"){ //hp
    p1.hp += p1Scale;
    p2.hp += p2Scale;
  }
  if (item == "Cyan"){ //score
    p1.score += p1Scale;
    p2.score += p2Scale;
  }
  if (item == "GreenYellow"){ //attack
    p1.hp -= p2Scale;
    p2.hp -= p1Scale;
  }
  if (item == "Purple"){ //speed
    p1.spd += p1Scale;
    p2.spd += p2Scale;
  }
  p1.item = 0;
  return p1, p2;
}
*/




//classes? idk if they need to be here or if we can point to a file

class Grass {
  constructor(){
    this.color = "green";
    this.tag = "grass";
  }
}

let playerDefault = "blue";
let hpDefault = 10;
let atkDefault = 1;
let spdDefault = 1;

class Player {
  constructor(name, r, g, b) {
    // this.color = color || playerDefault;
    this.r = r;
    this.g = g;
    this.b = b;
    this.item = 0;
    this.hp = hpDefault;
    this.atk = atkDefault;
    this.spd = spdDefault;
    this.id; //add socket id
    this.index;
    this.name = name;
    this.tag = "player";
    this.score = 0;
    this.dead = false;
    this.stroke = 0;
  }
  interaction(neighbors){
    for (let i = 0; i < neighbors.length; i++){
      //item -- for later, one at a time
      if (neighbors[i] instanceof Item) {
        this.item = neighbors[i].color;
      }
      //player
      if (neighbors[i] instanceof Player) {
        let pairID = neighbors[i].id;
        this.pairing(this.item, pairID);
      }
    }
  }
  pairing(item, id){
    //socket event
    let trade = {
      item: item,
      pairID: this.id
    }
    // console.log('trade');
    //socket.emit('pair', trade);
  }
}

class Item {
  constructor(color, index){
    // this.name = name;
    this.color = color;
    this.index = index;
    this.tag = "item";
    
  }
}