//////////////////////////////////////////
// Declare constants used by game logic.//
//////////////////////////////////////////

// Card Display constants
var CARD_FACE_COLOR = "rgb(255, 255, 0)";
var CARD_BACK_COLOR = "rgb(0, 0, 255)";
var CARD_INACTIVE_COLOR = "rgb(125, 125, 125)";
var CORRECT_FLASH_COLOR = "rgb(0, 255, 0)";
var INCORRECT_FLASH_COLOR = "rgb(255, 0, 0)";

// Player & Enemy constants
var P_START_X = 0;
var P_START_Y = 0;
var P_OFFSET_X = 30; // TODO: Find a way to calculate this dynamically based on view port.
var P_OFFSET_Y = 8; // TODO: Find a way to calculate this dynamically based on view port.
var P_SIZE = 60;
var P_SPEED = 15;

// Enemy constants
var E_START_X = 1800;
var E_START_Y = 720 ;
var E_SPEED = 6;

// CollisionGrid constants
var GRID_LENGTH = 31;
var GRID_HEIGHT = 13;
var NODE_SIZE = 60;

// GameCards constants
var CARD_AMOUNT = 30;

// Game Loop globals
var matches = 0;

//////////////////////////////////////////////////
// Declare global variables used by game logic. //
//////////////////////////////////////////////////
var domCardDisp = []; // Contains objects pertaining to the display attributes of COM card classes.
var gameTime = 0; // keeps track of the current gameplay time.
var KILL = false; // debug purposes only.  If set true via the console, this will halt update processes.

////////////////////////////////////////////
// Declare objects used by the game logic.//
////////////////////////////////////////////

// Keeps track of player data.
var player = {
  x: P_START_X,
  y: P_START_Y,
  xOffset: P_OFFSET_X,  // Used by display functon to correctly position player based the offset of cardArea.
  yOffset: P_OFFSET_Y, // Used by display functon to correctly position player based the offset of cardArea.
  //gridX: null,
  //gridY: null,
  onNode: null,
  //transitionNode: null, // When moving between Nodes  account for both.
  bInLineWithGrid: true,
  size: P_SIZE,
  speed: P_SPEED,

  // Initialize player
  init: function(){
    this.x = P_START_X;
    this.y = P_START_Y;
    this.updateGridPos();
  },

  // Updates player position data based on input recieved.
  move: function(direction){
    if(this.checkCollision(direction)){return;}
    switch (direction){
      case ("up"): this.y -= this.speed; break;
      case ("down"): this.y += this.speed; break;
      case ("left"): this.x -= this.speed; break;
      case ("right"): this.x += this.speed; break;
    }

    this.updateGridPos();
  },

  updateGridPos: function(){
    this.onNode = collisionGrid.getNode(this.x , this.y);
  },

  checkCollision: function(direction){
    var corner1;
    var corner2;

    switch (direction){
      case ("up"):
        corner1 = collisionGrid.valueAt(collisionGrid.getNode(this.x, this.y-1));
        corner2= collisionGrid.valueAt(collisionGrid.getNode(this.x+this.size-1, this.y-1));
        if ((corner1 == null && corner2 == null)){return false;} else {return true;}

      case ("down"):
        corner1 = collisionGrid.valueAt(collisionGrid.getNode(this.x, this.y+this.size));
        corner2 = collisionGrid.valueAt(collisionGrid.getNode(this.x+this.size-1, this.y+this.size));
        if ((corner1 == null && corner2 == null)){return false;} else {return true;}

        case ("left"):
        if(this.onNode == 0  || this.onNode == 372 || this.onNode == 341 || this.onNode == 310 ||  // TODO: quick hack to make collision dectection work on left & right
          this.onNode == 279 || this.onNode == 248 || this.onNode == 217 || this.onNode == 186 ||  // edges of game area.
          this.onNode == 155 || this.onNode == 124 || this.onNode == 93  || this.onNode == 62  ||
          this.onNode == 31){return(true);}
          if (this.onNode == 402){return(false);}
          corner1 = collisionGrid.valueAt(collisionGrid.getNode(this.x-1, this.y));
          corner2 = collisionGrid.valueAt(collisionGrid.getNode(this.x+this.size, this.y));
          if ((corner1 == null && corner2 == null)){return false;} else {return true;}

        case ("right"):
          if(this.onNode == 402 || this.onNode == 371 || this.onNode == 340 || this.onNode == 309 ||  // TODO: quick hack to make collision dectection work on left & right
            this.onNode == 278  || this.onNode == 247 || this.onNode == 216 || this.onNode == 185 ||  // edges of game area.
            this.onNode == 154 || this.onNode == 123 || this.onNode == 92  || this.onNode == 61   ||
            this.onNode == 30){return(true);}
          corner1 = collisionGrid.valueAt(collisionGrid.getNode(this.x+this.size, this.y));
          corner2 = collisionGrid.valueAt(collisionGrid.getNode(this.x+this.size, this.y+this.size-1));
          if ((corner1 == null && corner2 == null)){return false;} else {return true;}
        default: return true;
    }
  },

  adjacentCards: function(){
    var adjCards = [];

    adjCards.push(collisionGrid.valueAt(this.onNode - collisionGrid.length)); // above
    adjCards.push(collisionGrid.valueAt(this.onNode + collisionGrid.length)); // below
    adjCards.push(collisionGrid.valueAt(this.onNode + 1)); // right TODO: technically doesnt give correct results
    adjCards.push(collisionGrid.valueAt(this.onNode - 1)); // left TODO: technically doesnt give correct results

    return adjCards;


  }
}

// Keeps track of enemy data.
var enemy = {
  x: E_START_X,
  y: E_START_Y,
  xOffset: P_OFFSET_X,  // Used by display functon to correctly position player based the offset of cardArea.
  yOffset: P_OFFSET_Y, // Used by display functon to correctly position player based the offset of cardArea.
  onNode: null,
  size: P_SIZE,
  speed: E_SPEED,
  previousMove: "up",

  // Initialize enemy
  init: function(){
    this.x = E_START_X;
    this.y = E_START_Y;
    this.updateGridPos();
  },

  // Updates enemy position data based on input recieved.
  move: function(direction){
    if(this.checkCollision(direction)){return;}
    switch (direction){
      case ("up"): this.y -= this.speed; break;
      case ("down"): this.y += this.speed; break;
      case ("left"): this.x -= this.speed; break;
      case ("right"): this.x += this.speed; break;
    }
    this.previousMove = direction;
    this.updateGridPos();
  },

  decideMove: function(){
    if(collisionGrid.isAligned(this.x, this.y)){
      this.move(this.chooseNode());}
    else{this.move(this.previousMove);}
    //if(collisionGrid.valueAt(this.onNode-1)==null){this.previousMove = "left"; this.move("left"); return;}
    //this.move("right"); return;
    //if(collisionGrid.valueAt(this.onNode-31)==null){this.previousMove = "up"; this.move("up");}

  },

  chooseNode: function(){
    function getRand(num) {return (Math.round(Math.random() * (num-1)));}
    switch (getRand(4)){
    case (0): return "up";
    case (1): return "left";
    case (2): return "right";
    case (3): return "down";
    default: return "up";
    }
    //if(collisionGrid.valueAt(onNode-31)==null){return "up";}//above
    //collisionGrid.valueAt(onNode+31) //below
    //collisionGrid.valueAt(onNode-1)  // left
    //collisionGrid.valueAt(onNode+1)  //right
  },

  updateGridPos: function(){
    this.onNode = collisionGrid.getNode(this.x , this.y);
  },



  checkCollision: function(direction){
    var corner1;
    var corner2;

    switch (direction){
      case ("up"):
        corner1 = collisionGrid.valueAt(collisionGrid.getNode(this.x, this.y-1));
        corner2= collisionGrid.valueAt(collisionGrid.getNode(this.x+this.size-1, this.y-1));
        if ((corner1 == null && corner2 == null)){return false;} else {return true;}

      case ("down"):
        corner1 = collisionGrid.valueAt(collisionGrid.getNode(this.x, this.y+this.size));
        corner2 = collisionGrid.valueAt(collisionGrid.getNode(this.x+this.size-1, this.y+this.size));
        if ((corner1 == null && corner2 == null)){return false;} else {return true;}

      case ("left"):
      if(this.onNode == 0  || this.onNode == 372 || this.onNode == 341 || this.onNode == 310 ||  // TODO: quick hack to make collision dectection work on left & right
        this.onNode == 279 || this.onNode == 248 || this.onNode == 217 || this.onNode == 186 ||  // edges of game area.
        this.onNode == 155 || this.onNode == 124 || this.onNode == 93  || this.onNode == 62  ||
        this.onNode == 31){return(true);}
        if (this.onNode == 402){return(false);}
        corner1 = collisionGrid.valueAt(collisionGrid.getNode(this.x-1, this.y));
        corner2 = collisionGrid.valueAt(collisionGrid.getNode(this.x+this.size, this.y));
        if ((corner1 == null && corner2 == null)){return false;} else {return true;}

      case ("right"):
        if(this.onNode == 402 || this.onNode == 371 || this.onNode == 340 || this.onNode == 309 ||  // TODO: quick hack to make collision dectection work on left & right
          this.onNode == 278  || this.onNode == 247 || this.onNode == 216 || this.onNode == 185 ||  // edges of game area.
          this.onNode == 154 || this.onNode == 123 || this.onNode == 92  || this.onNode == 61   ||
          this.onNode == 30){return(true);}
        corner1 = collisionGrid.valueAt(collisionGrid.getNode(this.x+this.size, this.y));
        corner2 = collisionGrid.valueAt(collisionGrid.getNode(this.x+this.size, this.y+this.size-1));
        if ((corner1 == null && corner2 == null)){return false;} else {return true;}
      default: return true;
    }
  },

  adjacentCards: function(){
    var adjCards = [];

    adjCards.push(collisionGrid.valueAt(this.onNode - collisionGrid.length)); // above
    adjCards.push(collisionGrid.valueAt(this.onNode + collisionGrid.length)); // below
    adjCards.push(collisionGrid.valueAt(this.onNode + 1)); // right TODO: technically doesnt give correct results
    adjCards.push(collisionGrid.valueAt(this.onNode - 1)); // left TODO: technically doesnt give correct results

    return adjCards;


  }
}

// Organizes the game space into nodes to check for object interactions/collisions
var collisionGrid = {
  grid: [],
  length: GRID_LENGTH,
  height: GRID_HEIGHT,
  nodeSize: NODE_SIZE,

  // Builds an array that abstracts the game space.  An individual element is null if
  // it is not solid.  Else it contains a number representing a card.
  buildGrid: function(){
    var row = [];
    var cardNumStartThisRow = -10;
    var cardNumStartThisCol = -1;

    for (var i = 0; i < this.height; i++){
      for (var j = 0; j < this.length; j++){
        if(i%4 == 0){row.push(null);}
        else if(j%3 == 0){row.push(null); cardNumStartThisCol++}
        else row.push(cardNumStartThisRow + cardNumStartThisCol);
      }
      this.grid.push(row);
      if(i%4 == 0){cardNumStartThisRow += 10;}
      cardNumStartThisCol = -1;
      row = [];
    }
  },

  // returns node number at pixel coordinate x
  getNode: function (x, y){
    var nodeRow = Math.floor((y / this.nodeSize));
    var nodeCol = Math.floor((x / this.nodeSize));
    return (nodeRow * this.length + nodeCol);
  },

  // Returns the value of a node specified by nodeNumber
  valueAt: function(nodeNumber){
    if ((nodeNumber >= 0) && (nodeNumber < (this.length * this.height))){
      var y = nodeNumber%this.length;
      var x = (nodeNumber - y) /this.length;
      return this.grid[x][y];
    }
    return 666;
  },

  isAligned: function(x, y){
    if (((x % 60) == 0) && ((y % 60) == 0)) {return true;}else{return false;}
  }

}

// keeps track of cards that are flashing.
var flashingCards = {
  matchType: 0,
  card1: null,
  card2: null,
  startTime: null,
  endTime: null,
  reset: function(){
    this.matchType = 0;
    this.card1 = null;
    this.card2 = null;
    this.startTime = null;
    this.endTime = null;
  }
}

// Keeps track of card logic.
var gameCards = {
  deck: [], // Index of an individual card corresponds to the id of DOM object of class card.
  previousGuess: null, // Keeps tabs on the 1st guess of a pair, via a number that corresponds to an index of the cards array.  If null, a guess has not been made.
  cardTypes: ["1","1","2","3","4","5"], // Defines possible card types.  Elevator needs to be first in the array and powercell second for correct game logic.
  typeAmounts: [ 1, 5, 2, 10, 10, 2], // Each index corresponds with index in cardTypes array, specifying amount to distribute.  Items need to total totalCards for correct game logic.
  totalCards: CARD_AMOUNT, // Defines how many cards are displayed.
  bFlashing: false, // Flag that forces selectCard to ignore user input.  Used if an animation needs to be updated before user input can be processed.

  // Builds deck based on the types and distrubution defined by the cardTypes & typeAmounts arrays.
  buildDeck: function(shuffle){
    // Variables needed to iterate type/amount arrays
    this.deck = [];
    var typePos = 0;
    while(this.deck.length < this.totalCards ){
      for(var i = 0; i < this.typeAmounts[typePos]; i++){
        card = {
          type: this.cardTypes[typePos],
          bFaceUp: false,
          bActive: true
        }
        this.deck.push(card);
      }
      typePos++
    }
    if (shuffle){this.shuffleCards();}
  },

  // Selects the cardSpecified by the user, updates previousGuess accordingly, checks for matches if appropriate.
  selectCard: function(i){
    if (!player.adjacentCards().includes(i)){return;} // if player is not next to clicked card, ignore.
    if (i == this.previousGuess){return;} // Do nothing if selected card was chosen on prior selection.
    if (!this.deck[i].bActive){return;} // Do nothing if selected card is inactive.
    if (this.bFlashing) {return;}  // Do nothing if told to hold (due to flashing animation)
    if (this.previousGuess != null){
      this.checkMatch(i, this.previousGuess);
      this.flipCard(i);
      this.previousGuess = null;
    }
    else {
      this.previousGuess = i;
      this.flipCard(i);
    }
  },

  // Flips the card indicated by i
  flipCard: function(i){
    if (this.deck[i].bFaceUp) {this.deck[i].bFaceUp = false;}
    else {this.deck[i].bFaceUp = true;}
  },

  // Checks for match.  Deactivates cards if a match is found. updates flashingCards accordingly.
  checkMatch: function(i, j){
    flashingCards.card1 = i;
    flashingCards.card2 = j;
    flashingCards.startTime = gameTime;
    flashingCards.endTime = gameTime + 3000;
    this.bFlashing = true;
    // Check for normal match and if there is a match, deactivate the cards.
    if (this.deck[i].type == this.deck[j].type){
      this.deck[i].bActive = false;
      this.deck[j].bActive = false;
      flashingCards.matchType = this.deck[i].type;
      score += this.deck[i].type * 1000 ;
      matches++;

      return;
    }
    // Check for a elevator and powercell match. If found, deactive the cards.
    /*if ((this.deck[i].type == this.cardTypes[0]) || (this.deck[i].type == this.cardTypes[1])){
      if ((this.deck[j].type == this.cardTypes[0]) || (this.deck[j].type == this.cardTypes[1])){
        this.deck[i].bActive = false;
        this.deck[j].bActive = false;
        flashingCards.matchType = this.cardTypes[0];
        matches ++;
        return;
      }
    }*/
    // No match found.
    flashingCards.matchType = 0;
  },

  shuffleCards: function(){
  function getRand(num) {return (Math.round(Math.random() * (num-1)));}
  var tempDeck = [];
  var usedIndexes = [];
  var rand = getRand(this.totalCards);

  for (var i = 0; i < this.totalCards; i++){
    while(usedIndexes.indexOf(rand)>-1){
      rand = getRand(this.totalCards);
    }
    tempDeck.push(this.deck[rand]);
    usedIndexes.push(rand);
  }
  this.deck = tempDeck;
},
} // End of gameCards object

//////////////////////////////////////////////
// Declare functions used by the game logic.//
//////////////////////////////////////////////

// Fills DOM with divs representing cards & populates domCardDisp
function buildDOM(){
  var area = document.getElementsByClassName("cardArea")[0];
  for(var i = 0; i < gameCards.totalCards; i++){
    var div = document.createElement('div');
    div.className = "card";
    area.appendChild(div);
    div.setAttribute("id", i);
    var domDispObj = {
      obj: div,
      color: CARD_BACK_COLOR,
      body: null
    }
    domCardDisp.push(domDispObj);
    div.addEventListener("click", flip);
  }
}

// Handles click event on card div.
function flip(event){
  gameCards.selectCard(Number(this.id));
}

// Handles keyboard event on player.
function movePlayer(event){
  switch (event.keyCode){
    case (87): player.move("up"); break;
    case (83): player.move("down"); break;
    case (65): player.move("left"); break;
    case (68): player.move("right"); break;
    case (80) : matches=15;break; // Dev use to test winScreen (P)
  }
}

// Updates DOM Card display information from gameCards
function updateDomDisplay(){
  for (var i = 0; i < gameCards.totalCards; i++){
    if (gameCards.deck[i].bFaceUp){
      domCardDisp[i].color = CARD_FACE_COLOR;
      domCardDisp[i].body = gameCards.deck[i].type;
    }
    else{
      domCardDisp[i].color = CARD_BACK_COLOR;
      domCardDisp[i].body = null;
    }
    if (!gameCards.deck[i].bActive){domCardDisp[i].color = CARD_INACTIVE_COLOR;}
  }
}

// Updates DOM Card display for flashing cards
function updateFlashing(){
  if(gameCards.bFlashing){
    if( gameTime > flashingCards.endTime){
      if(flashingCards.matchType === 0){gameCards.flipCard(flashingCards.card1);gameCards.flipCard(flashingCards.card2);}
      gameCards.bFlashing = false;
      flashingCards.reset();
    }
    else{
      if(((flashingCards.startTime < gameTime) && (gameTime < flashingCards.startTime + 300))
        || ((flashingCards.startTime + 600 < gameTime) && (gameTime < flashingCards.startTime + 900))
        || ((flashingCards.startTime + 1200 < gameTime) && (gameTime < flashingCards.startTime + 1500))
        || ((flashingCards.startTime + 1800 < gameTime) && (gameTime < flashingCards.startTime + 2100))
        || ((flashingCards.startTime + 2400 < gameTime) && (gameTime < flashingCards.startTime + 2700))) {
          if(flashingCards.matchType === 0){
            domCardDisp[flashingCards.card1].color = INCORRECT_FLASH_COLOR;
            domCardDisp[flashingCards.card2].color = INCORRECT_FLASH_COLOR;
          }
          else {
            domCardDisp[flashingCards.card1].color = CORRECT_FLASH_COLOR;
            domCardDisp[flashingCards.card2].color = CORRECT_FLASH_COLOR;
          }
      }
    }
  }
}

// Displays Game Objects
function display(){
  // Displays cards
  for (var i = 0; i < domCardDisp.length; i++){
    domCardDisp[i].obj.style.backgroundColor = domCardDisp[i].color;
    if((domCardDisp[i].obj.childNodes.length == 0) && (domCardDisp[i].body != null)){
      domCardDisp[i].obj.appendChild(document.createTextNode(domCardDisp[i].body));
    }
    if((domCardDisp[i].obj.childNodes.length > 0) && (domCardDisp[i].body == null)){
      domCardDisp[i].obj.removeChild(domCardDisp[i].obj.childNodes[0]);
    }
  }
  //Ends display of cards
  document.getElementsByClassName("player")[0].style.top = player.y + player.yOffset + "px";
  document.getElementsByClassName("player")[0].style.left = player.x + player.xOffset + "px";
  document.getElementsByClassName("enemy")[0].style.top = enemy.y + enemy.yOffset + "px";
  document.getElementsByClassName("enemy")[0].style.left = enemy.x + enemy.xOffset + "px";
}


// Performs necessary functions for updating/displaying the game world.
// this is the where the magic happens.
function gameLoop(){
  if (KILL) {return;}  // Dev use only, used to stop game world updates completely.
  updateDomDisplay();
  updateFlashing();
  display();
  enemy.decideMove();
  if (player.onNode == enemy.onNode){endGame("lose");}  // checks for player & enemy collision
  if (matches == 15){endGame("win");} // Checks if all cards have been matched
  gameTime += 30;
}

function endGame(status){
  KILL = true;
  if (status == "win"){if ((60000 - gameTime) < 10000){score+=10000;}else{score+=60000-gameTime;}}
  var endScreen = document.getElementsByClassName("endScreen")[0];
  endScreen.style.visibility = "visible";
  endScreen.appendChild(document.createTextNode("YOU " + status + "!"));
  endScreen.appendChild(document.createTextNode("YOUR SCORE: " + score));
}

function initGame(){
  KILL = false;
  gameTime = 0;
  matches = 0;
  score = 0;
  var endScreen = document.getElementsByClassName("endScreen")[0];
  endScreen.style.visibility = "hidden";

  // TODO doesnt work.
  //if(endScreen.childNodes.length>1){endScreen.removeChild(endScreen.childNodes.length); endScreen.removeChild(endScreen.childNodes.length);}

  gameCards.buildDeck(true);
  collisionGrid.buildGrid();
  player.init();
  enemy.init();


}

///////////////////////////
// Game Loop begins here //
///////////////////////////
window.addEventListener("keydown", movePlayer);
document.getElementsByClassName("restart")[0].addEventListener("click", function(e){initGame();})
initGame();
buildDOM();

setInterval(gameLoop, 30);
