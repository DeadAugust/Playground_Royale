let mapWidth = 20;
let mapHeight = 20;
let mapMax = mapWidth * mapHeight;
// let mapScale = 10;
let mapScale;

let map = []; //server stored mega Array

let grass = {
  color: "green"
}

class Grass {
  constructor(){
    this.color = "green";
  }
}

let playerDefault = "blue";
let hpDefault = 10;
let atkDefault = 1;
let spdDefault = 1;

let me;


class Player {
  constructor(color) {
    this.color = color || playerDefault;
    this.item = 0;
    this.hp = hpDefault;
    this.atk = atkDefault;
    this.spd = spdDefault;
    this.id = "abababababa" //add socket id
    //this.index;
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
    console.log('trade');
    //socket.emit('pair', trade);
  }
}

class Item {
  constructor(color, index){
    // this.name = name;
    this.color = color;
    this.index = index;
  }
}





function setup() {
  createCanvas(windowWidth, windowHeight);
  mapScale = windowHeight / mapHeight;
  noStroke();
  rectMode(CENTER);
  ellipseMode(CENTER);

  for (let x = 0; x < mapWidth; x++){
    for (let y = 0; y < mapHeight; y++){
      let newGrass = new Grass();
      map.push(newGrass);
    }
  }

  //starting place
  me = new Player();
  me.item = "yellow";
  map[55] = me;

  me2 = new Player("black");
  map [20] = me2;

  //one Item
  let startItem = new Item("red", 70);

  map[startItem.index] = startItem;
}

function draw() {
  background(220);
  // console.log(grass.color);
  // console.log(map);


  for (let x = 0; x < mapWidth; x++){
    for (let y = 0; y < mapHeight; y++){
      let index = ((y * mapWidth) + x);
      if (map[index] instanceof Grass){
        fill(map[index].color);
        rect(x * mapScale, y * mapScale, mapScale, mapScale);
      }
      else if (map[index] instanceof Player) {
        fill(map[index].color);
        rect(x * mapScale, y * mapScale, mapScale, mapScale);
        // let itemCol = map[index].item;
        // fill(itemCol);
        fill(map[index].item);
        rect(x * mapScale, y * mapScale, mapScale/4, mapScale/4);
        //interaction
        //take up down left right squares
        let neighbors = [];
        neighbors.push(map[index - mapWidth]);
        neighbors.push(map[index + mapWidth]);
        neighbors.push(map[index - 1]);
        neighbors.push(map[index + 1]);
        for (let i = neighbors.length -1 ; i >= 0; i --){
          if (neighbors[i] instanceof Grass){
            neighbors.splice(i, 1);
          }
          if (neighbors[i] instanceof Item){
            map[neighbors[i].index] = new Grass();
          }
        }
        if (neighbors.length > 0){
          map[index].interaction(neighbors);
        }
      }
      else if (map[index] instanceof Item) {
        fill(map[index].color);
        ellipse(x * mapScale, y * mapScale, mapScale, mapScale);
      }
    }
  }
}

function keyPressed(){ //better to use keyTyped? maybe if holding down?
  //up
  if (keyCode === UP_ARROW || keyCode === 87){ //87 is 'w', 'w' doesn't work for some reason
    //better to have an x,y address in the object instead of manipulating whole array?
    for (let x = 0; x < mapWidth; x++){
      for (let y = 0; y < mapHeight; y++){
        let index = ((y * mapWidth) + x);
        if (map[index] == me && (index - mapWidth) >= 0){ //to prevent going off screen
          // console.log(index);
          let newGrass = new Grass();
          map[index] = newGrass;
          map[index - mapWidth] = me;
          return;

        }
      }
    }
  }
  //down
  if (keyCode === DOWN_ARROW || keyCode === 83){ //83 is 's'
    for (let x = 0; x < mapWidth; x++){
      for (let y = 0; y < mapHeight; y++){
        let index = ((y * mapWidth) + x);

        if (map[index] == me && (index + mapWidth) < mapMax ){
          // console.log(index);
          let newGrass = new Grass();
          map[index] = newGrass;
          map[index + mapWidth] = me;
          return;

        }
      }
    }
  }
  //left
  if (keyCode === LEFT_ARROW || keyCode === 65){ //65 is 'a'
    for (let x = 0; x < mapWidth; x++){
      for (let y = 0; y < mapHeight; y++){
        let index = ((y * mapWidth) + x);

        if (map[index] == me && (index % mapWidth) != 0){
          // console.log(index);
          let newGrass = new Grass();
          map[index] = newGrass;
          map[index - 1] = me;
          return;
        }
      }
    }
  }
  //right
  if (keyCode === RIGHT_ARROW || keyCode === 68){ //68 is 'd'
    for (let x = 0; x < mapWidth; x++){
      for (let y = 0; y < mapHeight; y++){
        let index = ((y * mapWidth) + x);
        if (map[index] == me && ((index + 1) % mapWidth) != 0){
          // console.log(index);
          let newGrass = new Grass();
          map[index] = newGrass;
          map[index + 1] = me;
          return;

        }
      }
    }
  }
}
