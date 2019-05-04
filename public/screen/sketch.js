// Open and connect input socket
let socket = io('/screen');

// Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Screen connected");
});

//mega game state array 
let map = []
let playground;

let scoreboard = [];
let currentIndex;
let ready = false;

//game state stuff
let settings = {}; //holds the settings to be sent to the server
let gameStarted = false;

//settings elements
let settingDiv; //the div container thing
let startButt; //starts the game
let objButt;

function preload(){
  playground = loadImage('https://cdn.glitch.com/c5b3d0c0-8769-4aad-895c-f5ee11dde9e9%2Fplayground.jpeg?1556921517107');
}

function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent('canvasContainer');
  mapScale = windowHeight / mapHeight;
  noStroke();
  rectMode(CORNER);
  textAlign(CENTER);
  
  settingDiv = createDiv('SETTINGS:')
    .parent('settingsContainer')
    .id('settings');
  
  //obective assignment button
  objButt = createButton('SEND OBJECTIVES')
    .parent('settings')
    .mousePressed(function(){
        genMap(); //sets initial map state
        let game = {
          map: map,
          scoreboard: scoreboard
        }
        socket.emit('objectives', game);
        // objective = true;
        // settingDiv.hide(); //hides settings and brings canvas up
      // }
  });
  
  //start button
  startButt = createButton('START GAME')
    .parent('settings')
    .mousePressed(function(){
        let game = {
          map: map,
          scoreboard: scoreboard
        }
        socket.emit('start', game);
        gameStarted = true;
        settingDiv.hide(); //hides settings and brings canvas up
      // }
  });
  
  socket.on('newPlayer', function(info){
    newIndex();
    let newPlayer = new Player(info.name, info.r, info.g, info.b); 
    newPlayer.index = currentIndex;
    newPlayer.id = info.id; //changed to fix players thing
    map[newPlayer.index] = newPlayer;
    scoreboard.push(newPlayer)
  });
  
  socket.on('update', function(data){
    map = data.map;
    scoreboard = data.scoreboard;
  });
}

function draw(){
  if (!gameStarted){ //settings and wait screen
    //joined players
    background(255, 150, 0);
    stroke(0);
    strokeWeight(1);
    fill(0, 102, 153);
    textSize(height/8);
    textAlign(CENTER);
    text('PLAYERS:', width/2, height/8);
    
    //display connected players
    textSize(height/(12 + scoreboard.length));
    let hLine = (height-100)/(scoreboard.length + 1);
    
    for(var i = 0; i < scoreboard.length; i++){
      let rank = scoreboard[i];
      fill(rank.r, rank.g, rank.b);
      text(rank.name, width/2, ((i+1) * hLine) + 100);
    }
  
  } else { //game running
    background(255);
    noStroke();
    
    //display map
    image(playground, 0, 0, mapWidth * mapScale, mapHeight * mapScale);

    for (let x = 0; x < mapWidth; x++){
      for (let y = 0; y < mapHeight; y++){
        let index = ((y * mapWidth) + x);
        if (map[index].tag == "player") {
          let p = map[index];
          //the player avatar
          noStroke();
          fill(p.r, p.g, p.b);
          rect(x * mapScale, y * mapScale, mapScale, mapScale);
          //only show player item
          //show other player's names
          push();
          textAlign(CENTER);
          textSize((height/mapScale) * 2);
          fill(0);
          stroke(255);
          strokeWeight(2);
          text(p.name, (x * mapScale) + (mapScale/2), (y * mapScale) + (mapScale/2));
          pop();
        }
      }
    }
    
    // - - - - - - - scoreboard
    stroke(0);
    strokeWeight(1);
    fill(0, 102, 153);
    textSize(height/8);
    textAlign(LEFT);
    text('SCORES:', mapWidth * mapScale, height/8);
    
    
    //sort by score
    scoreboard.sort(function (a, b) {
      return b.cool - a.cool;
    });
    
    //display ranked scores
    textSize(height/(12 + scoreboard.length));
    let hLine = (height-100)/(scoreboard.length + 1);
    for(var i = 0; i < scoreboard.length; i++){
      var place = i +1;
      let rank = scoreboard[i];
      fill(rank.r, rank.g, rank.b);
      text(place + ")   " + rank.name + ": " + rank.cool, mapWidth * mapScale, ((i+1) * hLine) + 100);
    }
  }
}


function newIndex(){ //random starting locations
  let startIndex = int(random(mapMax));
  for (let i = 0; i < scoreboard.length; i++){
    if (scoreboard[i].index == startIndex){
        newIndex();
        break;
      }
  }
  currentIndex = startIndex;
}

function genMap(){
  for (let x = 0; x < mapWidth; x++){
    for (let y = 0; y < mapHeight; y++){
      let index = ((y * mapWidth) + x);
      if (!(map[index] instanceof Player)){
        map[index] = 0;
        // let newGrass = new Grass();
        // map[index] = newGrass; 
      }
    }
  }
}