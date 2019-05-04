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
let showdownPairs = []; 

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
let foolCool = 3;
let bothTrust = 2;
let bothBetray = 0;

//update heartbeat, also where checks for adjacency
setInterval(function(){
  if(gameStarted){ //to get rid of issue of server overwriting map
    //putting trade here b/c want it to happen no matter what, not just on move
    // let playerSpots = [];
    //brand new map
    for (let x = 0; x < mapWidth; x++){
      for (let y = 0; y < mapHeight; y++){
        let index = ((y * mapWidth) + x);
        map[index] = 0;
      }
    }
    //check for "death"
    for (let i = scoreboard.length - 1; i >= 0; i --){
      if (scoreboard[i].cool <= 0){
        scoreboard.splice(i, 1);
        //death effect on player side
      }
    }
    //setting players on map and setting up neighbors for player interaction
    let neighbors = [];
    for (let i = 0; i < scoreboard.length; i ++){
      let p1 = scoreboard[i];//player 1
      map[p1.index] = p1;
      neighbors.push(p1);
    }
      
    //now doing adjacency to not run risk of multiple interactions 
    for (let i = neighbors.length - 1; i >= 0; i--){
      let p1 = neighbors[i];
      
      //check if already in showdown
      let paired = false;
      for (let s = 0; s < showdownPairs.length; s++){
        if (p1 == showdownPairs[s].p1 || p1 == showdownPairs[s].p2){
           paired = true;
        }
      }
        //check to see if any other players are adjacent
      if (!paired && p1.moved == true){ //moved to prevent auto triggering after showdown
        for (let j = neighbors.length - 1; j >= 0; j--){
          let p2 = neighbors[j];
          if(((p1.index - mapWidth) == p2.index) ||
            ((p1.index + mapWidth) == p2.index) ||
            ((p1.index + 1) == p2.index) ||
            ((p1.index - 1) == p2.index)){
              let showdown = {
                p1: p1,
                p2: p2,
                p1choice: 0,
                p2choice: 0
              }
              showdownPairs.push(showdown);
              players.emit('showdown', showdown);
              // socket.to("/players#" + p1.id).emit('showdown', p2);
              // socket.to("/players#" + p2.id).emit('showdown', p1);
              console.log("showdown between " + p1.name + " and " + p2.name);
              neighbors.splice(j, 1);
          }
        }
      }
      //to prevent issues
      neighbors.splice(i, 1);
    }
    //now checking for finished showdowns and setting move
    for (let i = showdownPairs.length - 1; i >= 0; i--){
      let p1c = showdownPairs[i].p1choice;
      let p2c = showdownPairs[i].p2choice;
      if (p1c != 0 && p2c != 0){
        //could call another function, but prob best to not mess with async update
        let p1;
        let p2;
        //set the players
        for (let j = scoreboard.length -1; j >= 0; j --){
          if (scoreboard[j] == showdownPairs[i].p1){
            p1 = scoreboard[j];
          } else if (scoreboard[j] == showdownPairs[i].p2){
            p2 = scoreboard[j];
          }
        }
        // console.log(p1, p2);
        
        //four possible states, both trust, both betray, p1 fooled, p2 fooled
        let state;
        //both trust
        if (p1c == "trust" && p2c == "trust"){
          p1.cool += bothTrust; //2
          p2.cool += bothTrust;
          state = "bothTrust";
        }
        //both betray
        if (p1c == "betray" && p2c == "betray"){
          p1.cool += bothBetray; //0
          p2.cool += bothBetray;
          state = "bothBetray";
          
        }
        //p1 fooled
        if (p1c == "betray" && p2c == "trust"){
          p1.cool += foolCool; //3
          p2.cool -= bothTrust; // -2
          state = "p1fooled";
          
        } 
        //p2 fooled
        if (p1c == "trust" && p2c == "betray"){
          p1.cool -= bothTrust; // -2
          p2.cool += foolCool; //3
          state = "p2fooled";
        }
        p1.moved = false;
        p2.moved = false;
        p1.timerReset = true;
        p2.timerReset = true;
        for (let s = scoreboard.length -1; s >= 0; s --){
          if (scoreboard[s] == p1){
            scoreboard[s] = p1;
          } else if (scoreboard[s] == p2){
            scoreboard[s] = p2;
          }
        }
        let results = {
          p1: p1,
          p2: p2,
          state: state
        }
        // console.log(results);
        players.emit('results', results);
        showdownPairs.splice(i, 1);
      }
    }
    
    // console.log(users);
    let data = {
      map: map,
      scoreboard: scoreboard 
    }
    players.emit('update', data); //io.sockets didn't work?
    screen.emit('update', data);
  }
}, 100); //changed to 100 from 33 b/c maybe too fast? check if too slow



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
        id: info.id
      }
      screen.emit('newPlayer', playerInfo);
    });
  
    //player movement
    socket.on('move', function(dir){
      for (let i = scoreboard.length - 1; i >= 0; i--){
        if (scoreboard[i].id == dir.id && scoreboard[i].moved == false){
          scoreboard[i].moved = true;
        }
      }
      if (dir.key == "up"){
        let spot = dir.index - mapWidth;
        if (map[spot] != undefined){
          if (spot >= 0 && map[spot].tag != "player"){ 
            for (let i = scoreboard.length - 1; i >= 0; i--){
              if (scoreboard[i].id == dir.id){
                // map[spot] = map[dir.index];
                scoreboard[i].index = spot; //here but map later
                // let newGrass = new Grass();
                // map[dir.index] = newGrass;
              }          
            }
          }
        }
      }
      if (dir.key == "down"){
        let spot = dir.index + mapWidth;
        if (map[spot] != undefined){
          if (spot < mapMax && map[spot].tag != "player"){
            for (let i = scoreboard.length - 1; i >= 0; i--){
              if (scoreboard[i].id == dir.id){
                // map[spot] = map[dir.index];
                scoreboard[i].index = spot;
                // let newGrass = new Grass();
                // map[dir.index] = newGrass;
              }          
            }
          } 
        }
      }
      if (dir.key == "left"){
        let spot = dir.index;
        if (map[spot-1] != undefined){
          if (spot % mapWidth != 0 && map[spot - 1].tag != "player"){
            for (let i = scoreboard.length - 1; i >= 0; i--){ 
              if (scoreboard[i].id == dir.id){
                // map[dir.index - 1] = map[dir.index];
                scoreboard[i].index = spot - 1;
                // let newGrass = new Grass();
                // map[dir.index] = newGrass;
              }          
            }
          } 
        }
      }
      if (dir.key == "right"){
        let spot = (dir.index + 1);
        if (map[spot] != undefined){
          if (spot % mapWidth != 0 && map[spot].tag != "player"){
            for (let i = scoreboard.length - 1; i >= 0; i--){
              if (scoreboard[i].id == dir.id){
                // map[dir.index + 1] = map[dir.index];
                scoreboard[i].index = dir.index + 1;
                // let newGrass = new Grass();
                // map[dir.index] = newGrass;
              }          
            }
          }
        }
      }
    });

    //if the player ran out of cool time
    socket.on('loseCool', function(){
      for(let s = scoreboard.length - 1; s >= 0; s--) {
        if("/players#" + scoreboard[s].id == socket.id) {
          scoreboard[s].cool -= 1;
          console.log(socket.id + " lost cool");
        }
      }
    });
  
    socket.on('timerReset', function(){
      for(let s = scoreboard.length - 1; s >= 0; s--) {
        if("/players#" + scoreboard[s].id == socket.id) {
          scoreboard[s].timerReset = false;
        }
      }
    });
  
    //if the player made a showdown decision to high five
    socket.on('downLow', function(){
      for (let i = showdownPairs.length - 1; i >= 0; i--){
        if (socket.id == "/players#" + showdownPairs[i].p1.id) {
          showdownPairs[i].p1choice = "trust";
        }
        else if (socket.id == "/players#" + showdownPairs[i].p2.id){
          showdownPairs[i].p2choice = "trust";
        }
      }
    });
    
    //if the player made a showdown decision to fake it
    socket.on('tooSlow', function(){
      for (let i = showdownPairs.length - 1; i >= 0; i--){
        if (socket.id == "/players#" + showdownPairs[i].p1.id) {
          showdownPairs[i].p1choice = "betray";
        }
        else if (socket.id == "/players#" + showdownPairs[i].p2.id){
          showdownPairs[i].p2choice = "betray";
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
      //check later
      //add to dead later
      for(let s = scoreboard.length - 1; s >= 0; s--) {
        if("/players#" + scoreboard[s].id == socket.id) {
          console.log('player off scoreboard: ' + socket.id)
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
      // startSettings = game.settings;
      map = game.map;
      scoreboard = game.scoreboard;
      // console.log(scoreboard);
      gameStarted = true;
      players.emit('start'); //just for gameStarted
    });
  
    //updated scoreboard
    // socket.on('scores', function(board){
    //   // console.log('scoreboard');
    //   // console.log(scoreboard);
    //   scoreboard = board;
    // });

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




//classes? idk if they need to be here or if we can point to a file


let coolDefault = 10;

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