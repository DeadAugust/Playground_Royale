// Open and connect input socket
let socket = io('/players');

// Listen for confirmation of connection
socket.on('connect', function() {
  console.log("Player connected");
  
});

let scoreboard = [];
let map = []; //server stored mega Array
let me = {};
let playground;
let coolTimeLimit = 45000; //45 secs per
let coolTimer = 0; //to track millis
let coolSecs = 0; //to display
let atHome = false; //if they've lost
let showdown = false; //if showdown
let them; //the other in showdown
let downLowButt, tooSlowButt;
let bothTrust = false;
let bothBetray = false;
let youFooled = false;
let theyFooled = false;
let objective = false;
let target, tR, tG, tB;
let bff; //for color

//player setup
let ready = false;
let gameStarted = false;
let sent = false;
var input, submit, redSlide, greenSlide, blueSlide, colorChoose, startButt;
var name = ' ';
var redCol = 0;
var greenCol = 0;
var blueCol = 0;
var joined = false; //if they've left character creation
var gameSetup = false; //game setup after player creation UGH "setup"
let cnv;
let instructionP;

function preload(){
  playground = loadImage('https://cdn.glitch.com/c5b3d0c0-8769-4aad-895c-f5ee11dde9e9%2Fplayground.jpeg?1556921517107');
}


function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
 	cnv.parent('canvasContainer');
  mapScale = windowHeight / mapHeight;
  noStroke();
  rectMode(CORNER);
  // ellipseMode(CENTER);
  
  
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
	text('Enter Your REAL Name, please!', width/2, 8 * height/12);
	input = createInput('type name here');
	input.parent('settings');
	input.position(width/4, 5 * height / 7);
	submit = createButton('PRESS WHEN READY');
	submit.parent('settings');
	submit.position(3* width/4, 5 * height / 7);
	submit.mousePressed(function(){
		  name = input.value();
		  redCol = redSlide.value();
	    greenCol = greenSlide.value();
	    blueCol = blueSlide.value();
      joined = true;
  });
  
  //hand buttons
  downLowButt = createButton("DOWN LOW")
    .style("background-color", "green")
    .parent("canvasContainer")
    .position(2 * (mapWidth*mapScale)/7, 5 * height/6)
    .mousePressed(function(){
      socket.emit('downLow');
      downLowButt.hide();
      tooSlowButt.hide();
  });
  tooSlowButt = createButton("TOO SLOW")
    .style("background-color", "red")
    .parent("canvasContainer")
    .position(4 * (mapWidth*mapScale)/7, 5 * height/6)
    .mousePressed(function(){
      socket.emit('tooSlow');
      downLowButt.hide();
      tooSlowButt.hide();
  });
  downLowButt.hide();
  tooSlowButt.hide();
  
  //empty map init to avoid bug
  for (let x = 0; x < mapWidth; x++){
    for (let y = 0; y < mapHeight; y++){
      let index = ((y * mapWidth) + x);
      let newGrass = new Grass();
      map[index] = newGrass;
    }
  }
  
  socket.on('objectives', function(obj){
    objective = true;
    for (let i = obj.length - 1; i >= 0; i--){
      if (name == obj[i].name){ //b/c no id yet
        let t = obj[i].target;
        target = t.name;
        bff = obj[i].bff;
        tR = t.r;
        tG = t.g;
        tB = t.b;
      }
    }
    console.log(obj);
  });
  
  socket.on('start', function(){
    objective = false;
    gameStarted = true;
    coolTimer = millis();
  });
  
  socket.on('update', function(data){
    map = data.map;
    scoreboard = data.scoreboard;
    let stillAtSchool = false;
    for (let i = 0; i < scoreboard.length; i++){
      if (scoreboard[i].id == socket.id){
        me = scoreboard[i]; //prob a better way of doing this
        stillAtSchool = true;
        // console.log('Im here');
      }
    }
    if (!stillAtSchool && (scoreboard.length != 0)){ //issue if everyone dies at once
      atHome = true;
      // console.log("i went home");
    }
  });
  
  socket.on('showdown', function(show){
    // console.log(show);
    if(!showdown){ //only triggers if not already in showdown
      if (me.id  == show.p1.id){
        showdown = true;
        them = show.p2
        downLowButt.show();
        tooSlowButt.show();
      } else if (me.id == show.p2.id){
        showdown = true;
        them = show.p1
        downLowButt.show();
        tooSlowButt.show();
      }
    }
    bothTrust = false;
    bothBetray = false;
    youFooled = false;
    theyFooled = false;
  });
  
  socket.on('results', function(results){
    if(showdown){
      let showMe;
      let us = false;
      if (me.id  == results.p1.id){
        showMe = results.p1;
        us = true;
      } else if (me.id == results.p2.id){
        showMe = results.p2
        us = true;
      }
      if (us) {
        if (results.state == "bothTrust"){
          bothTrust = true;
        } else if (results.state == "bothBetray"){
          bothBetray = true;
        } else if (results.state == "p1fooled"){
          if (showMe == results.p1){
            youFooled = true;
          }else{
            theyFooled = true;
          }
        } else if (results.state == "p2fooled"){
          if (showMe == results.p2){
            youFooled = true;
          }else{
            theyFooled = true;
          }
        }
        showdown = false;
      }
    }
  });
}

function draw(){
  if (!ready){
    if (joined){
			if (!startButt){
        input.hide();
        submit.hide();
        redSlide.hide();
        greenSlide.hide();
        blueSlide.hide();        
				startButt = createButton('START');
				startButt.parent('settings');
				startButt.position(width/2, 4 * height/6);
        instructionP = createP('You are a middle schooler on the playground. Times are tough, it\'s your first day, so it\'s hunting season. You start with three cool points, and your goal is to never get down to zero, or else you\'ll be so embarassed you\'ll run home crying. To be cool, you have to go around and high five other kids. But, as is tradtion, after the first high five, you each get a chance to high five again (DOWN LOW) or fake them out (TOO SLOW). If you both high five, you both get cool points. If you both fake out, nothing happens. But! If you go for a high five and they fake you out, its SO EMBARASSING! You\'ll definitely lose cool points. You also will get either a BFF or a RIVAL, your goal is to keep them at school if they\'re your BFF, or make them go home if they\'re your RIVAL.')
          .parent('settings')
          .position(width/4, height/3)
          .style('font-size', '20');
              
			} //only make start button once, def better way to do this
			background(155);
			fill(0);
			textSize(24);
			text('INSTRUCTIONS', width/2, height/6);
			startButt.mouseClicked(function(){
        if (!sent){
          let pInfo = {
            r: redCol,
            g: greenCol,
            b: blueCol,
            id: socket.id,
            name: name
          }
          console.log(pInfo);
          socket.emit('ready', pInfo);
          sent = true;
          ready = true;
          settingDiv.hide();
          //clunky, but this solves the me undefined issue at start
          me.cool = 10;
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
		} //end of avatar select
  } else if (objective){
    //after receive objective assignment
    push();
    background(255 - tR, 255 - tG, 255 - tB);
    fill(255);
    stroke(0);
    textSize(40);
    if (bff){
      text("Your BFF is", width/2, height/5);
      push();
      fill(tR, tG, tB);
      text(target, width/2, 2 * height/5);
      pop();
      text("Make sure they stay cool!", width/2, 3 * height/5);
      text("You only win if you stay school and so do they!", width/2, 4* height/5);
    } else {
      text("Your RIVAL is", width/2, height/5);
      push();
      fill(tR, tG, tB);
      text(target, width/2, 2 * height/5);
      pop();
      text("Embarass that loser!", width/2, 3 * height/5);
      text("You only win if you stay school and they go home!", width/2, 4* height/5);
      
    }
    pop();
  } else if (!gameStarted){
    background(120, 255, 0);
    fill(0);
    textSize(40);
    text("waiting for other players", width/2, height/2);
  } else{ //game running
    background(200);
    noStroke();
    //- - - - - - - map
    image(playground, 0, 0, mapWidth * mapScale, mapHeight * mapScale);
    for (let x = 0; x < mapWidth; x++){
      for (let y = 0; y < mapHeight; y++){
        let index = ((y * mapWidth) + x);
        // if (map[index].tag == "grass"){
        //   fill(map[index].color);
        //   rect(x * mapScale, y * mapScale, mapScale, mapScale);
        // }
        
        if (map[index].tag == "player") {
          let p = map[index];
          //the player avatar
          noStroke();
          fill(p.r, p.g, p.b);
          rect(x * mapScale, y * mapScale, mapScale, mapScale);
          //only show player item
          if(p.id == socket.id){
            //maybe show timer here?
            push();
            textAlign(CENTER);
            textSize((height/mapScale) * 4);
            fill(255/(coolSecs/2), 0, 0);
            stroke(255);
            strokeWeight(2);
            text(coolSecs, (x * mapScale) + (mapScale/2), (y * mapScale) + (mapScale/2));
            pop();
          } else { //show other player's names
            push();
            textAlign(CENTER);
            textSize((height/mapScale) * 2);
            fill(255);
            stroke(0);
            strokeWeight(2);
            text(p.name, (x * mapScale) + (mapScale/2), (y * mapScale) + (mapScale/2));
            pop();
          }
        }
      }
    }
    if (!atHome){
      // - - - - - - - - player UI
      push();
      textSize(width/25);
      textAlign(LEFT);
      stroke(0);
      //points
      fill("Cyan");
      text("Cool Points: " + me.cool, (mapWidth*mapScale) + 10, height/5); 
      //mouse over to show secret goal
      if (mouseX <= width && mouseX >= (mapWidth*mapScale) &&
          mouseY <= height && mouseY >= height/2){ //if want to show
          if (bff){
            fill("blue");
            text(target, (mapWidth*mapScale), 3* height/5);
        } else {
          fill("red");
          text(target, (mapWidth*mapScale), 3* height/5);
        }
      } else { //block view
        fill(122);
        rectMode(CORNER);
        rect((mapWidth*mapScale), 3* height/5, (width - (mapWidth*mapScale)), height/4);
      }
      pop();
      //- - - - - - -  cool Timer
      if (me.timerReset == true){
        coolTimer = millis();
        socket.emit('timerReset');  
      }
      coolSecs = int(((coolTimeLimit + coolTimer) - millis()) / 1000);
      if (coolSecs <= 0){
        socket.emit('loseCool');
        coolTimer = millis();
      } // end of game running
      if (showdown) {
        push();
        rectMode(CENTER);
        fill(them.r, them.g, them.b, 150);
        rect((mapWidth*mapScale)/2, height/2, ((mapWidth*mapScale) - width/5), (height - height/5));
        fill(255);
        stroke(0);
        text("YOU HIGH-FIVED", (mapWidth*mapScale)/2, height/6);
        text(them.name, (mapWidth*mapScale)/2, 2 * height/6);
        text("now, will you...", (mapWidth*mapScale)/2, 3 * height/6);
        textSize((mapWidth*mapScale)/40);
        text("high five again?", 2 * (mapWidth*mapScale)/ 7, 4 * height/6)
        text("or trick them?", 5 * (mapWidth*mapScale)/ 7, 4 * height/6)
        pop();
      }
      if (me.moved == false){
        if (bothTrust){
          push();
          rectMode(CENTER);
          fill(0, 225, 50, 150); //green
          rect((mapWidth*mapScale)/2, height/2, ((mapWidth*mapScale) - width/5), (height - height/5));
          fill(255);
          stroke(0);
          text("YOU AND", (mapWidth*mapScale)/2, height/6);
          text(them.name, (mapWidth*mapScale)/2, 2 * height/6);
          text("HIGH FIVED!", (mapWidth*mapScale)/2, 3 * height/6);
          text("YAY!", (mapWidth*mapScale)/2, 4 * height/6);
          text("move away from them to continue", (mapWidth*mapScale)/2, 5 * height/6);
          pop();
        }
        if (bothBetray){
          push();
          rectMode(CENTER);
          fill(50, 0, 190, 150); // blue
          rect((mapWidth*mapScale)/2, height/2, ((mapWidth*mapScale) - width/5), (height - height/5));
          fill(255);
          stroke(0);
          text("YOU AND", (mapWidth*mapScale)/2, height/6);
          text(them.name, (mapWidth*mapScale)/2, 2 * height/6);
          text("both faked it", (mapWidth*mapScale)/2, 3 * height/6);
          text("...whatever", (mapWidth*mapScale)/2, 4 * height/6);
          text("move away from them to continue", (mapWidth*mapScale)/2, 5 * height/6);
          pop();
        }
        if (youFooled){
          push();
          rectMode(CENTER);
          fill(255, 225, 0, 150); // yellow
          rect((mapWidth*mapScale)/2, height/2, ((mapWidth*mapScale) - width/5), (height - height/5));
          fill(255);
          stroke(0);
          text("YOU FOOLED", (mapWidth*mapScale)/2, height/6);
          text(them.name, (mapWidth*mapScale)/2, 2 * height/6);
          text("HAHA, THEY'RE A LOSER", (mapWidth*mapScale)/2, 3 * height/6);
          text("move away from them to continue", (mapWidth*mapScale)/2, 5 * height/6);
          pop();
        }
        if (theyFooled){
          push();
          rectMode(CENTER);
          fill(200, 0, 0, 150); // red
          rect((mapWidth*mapScale)/2, height/2, ((mapWidth*mapScale) - width/5), (height - height/5));
          fill(255);
          stroke(0);
          text(them.name, (mapWidth*mapScale)/2, height/6);
          text("TRICKED YOU", (mapWidth*mapScale)/2, 2 * height/6);
          text("...hope no one saw that!", (mapWidth*mapScale)/2, 3 * height/6);
          text("move away from them to continue", (mapWidth*mapScale)/2, 5 * height/6);
          pop();
        }
      }
    }else{
      push();
      rectMode(CENTER);
      fill(0, 150);
      rect((mapWidth*mapScale)/2, height/2, ((mapWidth*mapScale) - width/5), (height - height/5));
      fill(255);
      stroke(0);
      text("Aw, you went home", (mapWidth*mapScale)/2, height/2);
      pop();
    }
  }
}

function keyPressed(){
  if (gameStarted){
    // - - - - - movement triggers
    if (keyCode === UP_ARROW || keyCode === 87){ //87 is 'w', 'w' doesn't work for some reason
      let dir = {
        key: "up",
        index: me.index,
        id: socket.id
      }
      socket.emit('move', dir);
    }
    else if (keyCode === DOWN_ARROW || keyCode === 83){ //83 is 's'
      let dir = {
        key: "down",
        index: me.index,
        id: socket.id
      }
      socket.emit('move', dir);
    }
    else if (keyCode === LEFT_ARROW || keyCode === 65){ //65 is 'a'
      let dir = {
        key: "left",
        index: me.index,
        id: socket.id
      }
      socket.emit('move', dir);
    }
    else if (keyCode === RIGHT_ARROW || keyCode === 68){ //68 is 'd'
      let dir = {
        key: "right",
        index: me.index,
        id: socket.id
      }
      socket.emit('move', dir);
    }
  }
}
