// Open and connect input socket
let socket = io('/players');

// Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Player connected");
  
});

let scoreboard = [];
let map = []; //server stored mega Array

let me = {};
let speed = 400; //starting speed of move event?
let lastMove = 0;

//player setup
let ready = false;
let gameStarted = false;
let sent = false;
var input, submit, redSlide, greenSlide, blueSlide, colorChoose, startButt;
var name = ' ';
var redCol = 0;
var greenCol = 0;
var blueCol = 0;
var shapeYes = true; //no shapes yet
var colorYes = false; //if selected color
var nameYes = false; //if input name
var joined = false; //if they've left character creation
var tutorial = false; //if they did the tutorial
var gameSetup = false; //game setup after player creation UGH "setup"
let cnv;


function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
 	cnv.parent('canvasContainer');
  mapScale = windowHeight / mapHeight;
  noStroke();
  rectMode(CENTER);
  ellipseMode(CENTER);
  
  
  settingDiv = createDiv('')
    .parent('settingsContainer')
    .id('settings');
  
  // - - - - -  player start screen
	textSize(30);
  textAlign(CENTER);
	fill(0);
	text('Choose Your Color', width/2, height/12);
	redSlide = createSlider(0,255,40);
	redSlide.position(width/3, 3 * height/7 - height/20);
	greenSlide = createSlider(0,255,255);
	greenSlide.position(width/3, 3 * height/7);
	blueSlide = createSlider(0,255,188);
	blueSlide.position(width/3, 3 * height/7 + height/20);
	colorChoose = createButton('I want to be this color!');
	colorChoose.parent('settings'); //need?
	colorChoose.position(width/3, 4 * height/7);
	colorChoose.mousePressed(function(){
    redCol = redSlide.value();
	  greenCol = greenSlide.value();
	  blueCol = blueSlide.value();
	  colorYes = true;
	  fill(redCol, greenCol, blueCol);
	  text('Nice Color!', 5* width/6, 4 * height/7);
  });
	text('Enter Your Name', width/2, 8 * height/12);
	input = createInput('type name here');
	input.parent('settings');
	input.position(width/4, 5 * height / 7);
	submit = createButton('submit name');
	submit.parent('settings');
	submit.position(3* width/4, 5 * height / 7);
	submit.mousePressed(function(){
    if (name !== 'me' && name !== 'Me' && name !== 'type name here'
		&& name !== 'please type a different name'){
		  name = input.value();
		  nameYes = true;
	  }
	  else{
		  input.value('please type a different name');
	  } 
  });
  
  // me = new Player();
  // me.item = "yellow";
  // me.index = random(0, mapMax);
  // // map[me.index] = me;
  
  for (let x = 0; x < mapWidth; x++){
    for (let y = 0; y < mapHeight; y++){
      let index = ((y * mapWidth) + x);
      let newGrass = new Grass();
      map[index] = newGrass;
    }
  }
  
  socket.on('start', function(){
    gameStarted = true;
  });
  
  socket.on('update', function(data){
    map = data.map;
    scoreboard = data.scoreboard;
    for (let i = 0; i < scoreboard.length; i++){
      if (scoreboard[i].id == ("/players#" + socket.id)){
        me = scoreboard[i]; //prob a better way of doing this
      }
    }
  });
  
  //too much weirdness, just have to manually refresh for now
  // socket.on('reset', function(){
  //   ready = false;
  //   gameStarted = false;
  //   colorYes = false; //if selected color
  //   nameYes = false;
  //   name = '';
  //   sent = false;
  //   map = [];
  //   scoreboard = [];
  //   setup();
  // });
}

function draw(){
  if (!ready){
    if (shapeYes && colorYes && nameYes){
			if (!startButt){
        input.hide();
        submit.hide();
        redSlide.hide();
        greenSlide.hide();
        blueSlide.hide();
        colorChoose.hide();
        
				startButt = createButton('START');
				startButt.parent('settings');
				startButt.position(width/3, height/3);
			}
			background(155);
			fill(0);
			textSize(24);
			text('click START to join game', width/2, height/4);
			startButt.mouseClicked(function(){
        if (!sent){
          // let c = color(redCol, greenCol, blueCol);
          let pInfo = {
            // color: c,
            r: redCol,
            g: greenCol,
            b: blueCol,
            name: name
          }
          console.log(pInfo);
          socket.emit('ready', pInfo);
          sent = true;
          ready = true;
          settingDiv.hide();
          //clunky, but this solves the me undefined issue at start
          me.score = 0;
          me.hp = 0;
          me.atk = 0;
          me.spd = 0;
        }
      });
		} else{
			fill(redSlide.value(), greenSlide.value(), blueSlide.value());
			rect(width/2, height/5, height/6, height/6);
			text(name, width/2, height/4 + 80);
			textSize(20);
			fill(redSlide.value(), 0, 0);
			text('red', width/4, 3 * height/7 - height/20);
			fill(0, greenSlide.value(), 0);
			text('green', width/4, 3 * height/7);
			fill(0, 0, blueSlide.value());
			text('blue', width/4, 3 * height/7 + height/20);
		}
  } else if (!gameStarted){
    background(120, 255, 0);
    fill(0);
    textSize(40);
    text("waiting for other players", width/2, height/2)
  } else{ //game running
    background(200);
    noStroke();
    // - - - - - movement triggers
    if(me.dead == false){ //only move if alive
      let time = millis() - lastMove;
      if (time >= speed){
        //issue with diagonal, can only go one at a time
        if (keyIsDown(UP_ARROW) || keyIsDown(87)){
          // console.log('up');
          let dir = {
            key: "up",
            index: me.index,
            id: socket.id
          }
          socket.emit('move', dir);
        }
        else if (keyIsDown(DOWN_ARROW) || keyIsDown(83)){
          // console.log('down');
          let dir = {
            key: "down",
            index: me.index,
            id: socket.id
          }
          socket.emit('move', dir);
        }
        else if (keyIsDown(LEFT_ARROW) || keyIsDown(65)){
          // console.log('left');
          let dir = {
            key: "left",
            index: me.index,
            id: socket.id
          }
          socket.emit('move', dir);
        }
        else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)){
          // console.log('right');
          let dir = {
            key: "right",
            index: me.index,
            id: socket.id
          }
          socket.emit('move', dir);
        }
        lastMove = millis();
      }
    }
    
    
    //- - - - - - - map
    for (let x = 0; x < mapWidth; x++){
      for (let y = 0; y < mapHeight; y++){
        let index = ((y * mapWidth) + x);
        if (map[index].tag == "grass"){
          fill(map[index].color);
          rect(x * mapScale, y * mapScale, mapScale, mapScale);
        }
        
        else if (map[index].tag == "player") {
          let p = map[index];
          // let c = (p.r, p.g, p.b);
          
          //stroke of last item traded
          stroke(p.stroke);
          strokeWeight(2);
          //the player avatar
          fill(p.r, p.g, p.b);
          rect(x * mapScale, y * mapScale, mapScale, mapScale);
          noStroke();
          //only show player item
          if(p.id == "/players#" + socket.id){
            fill(p.item);
            rect(x * mapScale, y * mapScale, mapScale/3, mapScale/3);
          }/*else{
            push();
            textAlign(CENTER);
            textSize(8);
            fill(0);
            stroke(255);
            strokeWeight(2);
            text(p.name, x * mapScale, y * mapScale);
            pop();
            */
          // }
          if (p.dead == true){
            fill(255,0,0,150);
            rect(x * mapScale, y * mapScale, mapScale, mapScale);
            fill(0);
            textAlign(CENTER);
            textSize(30);
            text("X", x * mapScale, y * mapScale);
          }
        }
        
        else if (map[index].tag == "item") {
          fill(grass.color);
          rect(x * mapScale, y * mapScale, mapScale, mapScale);
          fill(map[index].color);
          ellipse(x * mapScale, y * mapScale, mapScale/2, mapScale/2);
        }
      }
    }
    
    // - - - - - - - - player UI
    if (width > height){
    textSize(width/25);
    stroke(0);
    //points
    fill("Cyan");
    text("Points: " + me.score, 3 * width/4, height/5); 
    //health
    fill("Red");
    text("Health: " + me.hp, 3 * width/4, 2 * height/5); 
    
    //attack power
    fill("GreenYellow");
    text("Attack Power: " + me.atk, 3 * width/4, 3 * height/5); 
    
    //speed
    fill("Purple");
    text("Speed: " + me.spd, 3 * width/4, 4 * height/5); 
    
    }
    else { //????
    }
  }
}

function keyPressed(){
  if (keyCode == 32){ //space
    socket.emit('drop');
  }
}
