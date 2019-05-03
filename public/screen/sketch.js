// Open and connect input socket
let socket = io('/screen');

// Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Screen connected");
});


//mega game state array 
let map = []

// let mapWidth = 20;
// let mapHeight = 20;
// let mapMax = mapWidth * mapHeight;
// // let mapScale = 10;
// let mapScale;

let scoreboard = [];
let currentIndex;
let ready = false;

//game state stuff
let settings = {}; //holds the settings to be sent to the server
let gameStarted = false;

//settings elements
let settingDiv; //the div container thing (i suck at html so idk if this is redundant)
let startButt; //starts the game
let spaceP; //complicated way of spacing...

//resetButt?

//slider to set level of game
let levelSlider, levelDiv, levelP, levelSpan; 
let levelText; //html

//sets lives per round
let livesBox, livesDiv, livesP, livesSpan, livesSlider, lives;
let livesOn = false;

// let timerBox; //unlocks the timer slider
// let timerOn = false; //timer toggle
// let timer; //seconds left
// let timerSlider; //slider to set timelimit

//blind mode
let blindBox; //checkbox to toggle blind mode
let blindMode = false; 

// Margin
let margin = 10;

function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent('canvasContainer');
  mapScale = windowHeight / mapHeight;
  noStroke();
  rectMode(CENTER);
  ellipseMode(CENTER);
  textAlign(CENTER);
  
  settingDiv = createDiv('SETTINGS:')
    .parent('settingsContainer')
    .id('settings');
  
  //settings elements:
  //
  //level (1-12)
  //timer
  //blind
  //lives
  //ultimate mode (goes through 1-12 in order) //only if we have time
  
  //position all this later
  
  
  //complicated line break
  createP(' ')
    .parent('settings');
  createP(' ')
    .parent('settings');
  
  //level settings
  levelDiv = createDiv('')
    .id('levels')
    .parent('settings');
  levelP = createP('Level: ')
    .parent('levels');
  levelSpan = createSpan('')
    .id('levelSpan')
    .parent('levels');
  levelSlider = createSlider(1, 6, 1, 1) //max 6 to avoid over 100 issue
    .parent('settings');
  // levelText = select('#level');
  
  //complicated line break
  createP(' ')
    .parent('settings');
  createP(' ')
    .parent('settings');
  
  //lives settings
  livesBox = createCheckbox('Play with Lives?', false)
    .parent('settings')
    .changed(function(){
      if (this.checked()){
        livesDiv.show();
        livesOn = true;
      } else {
        livesDiv.hide();
        livesOn = false;
      }
    });
  livesDiv = createDiv('')
    .id('lives')
    .parent('settings');
  livesP = createP('Lives: ')
    .parent('lives');
  livesSpan = createSpan('')
    .id('livesSpan')
    .parent('lives');
  livesSlider = createSlider(1, 20, 5, 1)
    .parent('lives');
  livesDiv.hide();
  
  //complicated line break
  createP(' ')
    .parent('settings');
  createP(' ')
    .parent('settings');
  
  //blind settings
  blindBox = createCheckbox('Blind mode?', false)
    .parent('settings')
    .changed(function(){
      if(this.checked()){
        blindMode = true;
      } else {
        blindMode = false;
      }
    });
  
  //complicated line break
  createP(' ')
    .parent('settings');
  createP(' ')
    .parent('settings');
  
  //start button
  startButt = createButton('START GAME')
    .parent('settings')
    .mousePressed(function(){
      // updateSettings();
      // if(timeOn){timer = timerSlider.value();}'
      // if (!ready){
        genMap(); //sets initial map state
        // ready = true;
        console.log(map);
        let game = {
          map: map,
          settings: settings,
          scoreboard: scoreboard
        }
        socket.emit('start', game);
        gameStarted = true;
        settingDiv.hide(); //hides settings and brings canvas up
      // }
  });
  
  socket.on('newPlayer', function(info){
    newIndex();
//     let startIndex = int(random(mapMax));
//     for (let i = 0; i < scoreboard.length; i++){
//       if (scoreboard[i].index == startIndex){
//         startIndex = int(random(mapMax));
//       }
      
//     }
    let newPlayer = new Player(info.name, info.r, info.g, info.b); 
    newPlayer.index = currentIndex;
    newPlayer.id = info.id; //could change to fix "/players#" thing
    map[newPlayer.index] = newPlayer;
    // let playerScore = {
    //   name: newPlayer.name,
    //   id: newPlayer.id,
    //   index: newPlayer.index,
    //   score: 0
    // }
    scoreboard.push(newPlayer)
    // scoreboard.push(playerScore);
    // socket.emit('scores', scoreboard);
  });
  
  socket.on('update', function(data){
    map = data.map;
    scoreboard = data.scoreboard;
    // scoreboard = data.scoreboard; //b/c it controls scoreboard, no?
  });
}

function draw(){
  if (!gameStarted){ //settings and wait screen
    levelSpan.html(levelSlider.value());
    livesSpan.html(livesSlider.value());
    //joined players
    background(255, 150, 0);
    stroke(0);
    strokeWeight(1);
    fill(0, 102, 153);
    textSize(height/8);
    textAlign(CENTER);
    text('PLAYERS:', width/2, height/8);
    
    //display ranked scores
    textSize(height/(12 + scoreboard.length));
    let hLine = (height-100)/(scoreboard.length + 1);
    
    for(var i = 0; i < scoreboard.length; i++){
      var place = i +1;
      let rank = scoreboard[i];
      fill(rank.r, rank.g, rank.b);
      text(place + ")   " + rank.name, width/2, ((i+1) * hLine) + 100);
      // text(place + ")   " + rank.name + ": " + rank.score, 4* width/5, ((i+1) * hLine) + 100);
    }
  
  } else { //game running
    background(255);
    noStroke();
    //score updates
    // for (let i = 0; i < map.length; i++){
    //   if (map[i] instanceof Player){
    //     for (let j = 0; j < scoreboard.length; j++){
    //       if (map[i].id == scoreboard[j].id){
    //         scoreboard[j].score = map[i].score;
    //       }
    //     }
    //   }
    // }
    // socket.emit('scores', scoreboard);
    
    //display map
    for (let x = 0; x < mapWidth; x++){
      for (let y = 0; y < mapHeight; y++){
        let index = ((y * mapWidth) + x);
        if (map[index].tag == "grass"){
          fill(map[index].color);
          rect(x * mapScale, y * mapScale, mapScale, mapScale);
        }
        
        else if (map[index].tag == "player") {
          let p = map[index];
          fill(p.r, p.g, p.b);
          rect(x * mapScale, y * mapScale, mapScale, mapScale);
          // let itemCol = map[index].item;
          // fill(itemCol);
          //hidden items
          // fill(map[index].item);
          // rect(x * mapScale, y * mapScale, mapScale/3, mapScale/3);
          if (p.dead == true){
            fill(255,0,0,150);
            rect(x * mapScale, y * mapScale, mapScale, mapScale);
            fill(0);
            textAlign(CENTER);
            textSize(30);
            text("X", x * mapScale, y * mapScale);
          }
          //interaction
          //take up down left right squares
          /*
          let neighbors = [];
          neighbors.push(map[index - mapWidth]);
          neighbors.push(map[index + mapWidth]);
          neighbors.push(map[index - 1]);
          neighbors.push(map[index + 1]);
          for (let i = neighbors.length -1 ; i >= 0; i --){
            if (neighbors[i].tag == "grass"){
              neighbors.splice(i, 1);
            }
            if (neighbors[i].tag == "item"){
              map[neighbors[i].index] = new Grass();
            }
          }
          if (neighbors.length > 0){
            map[index].interaction(neighbors);
          }
          */
        }
        
        else if (map[index].tag == "item") {
          fill(grass.color);
          rect(x * mapScale, y * mapScale, mapScale, mapScale);
          fill(map[index].color);
          ellipse(x * mapScale, y * mapScale, mapScale/2, mapScale/2);
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
      return b.score - a.score;
    });
    
    //display ranked scores
    textSize(height/(12 + scoreboard.length));
    let hLine = (height-100)/(scoreboard.length + 1);
    
    for(var i = 0; i < scoreboard.length; i++){
      var place = i +1;
      let rank = scoreboard[i];
      fill(rank.r, rank.g, rank.b);
      text(place + ")   " + rank.name + ": " + rank.score, mapWidth * mapScale, ((i+1) * hLine) + 100);
      // text(place + ")   " + rank.name + ": " + rank.score, 4* width/5, ((i+1) * hLine) + 100);
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
        let newGrass = new Grass();
        map[index] = newGrass; 
      }
    }
  }
}