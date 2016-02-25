//////////////////////////////////////////
// Declare constants used by game logic.//
//////////////////////////////////////////

// Card Display constants
var CARD_FACE_COLOR = "rgb(255, 255, 0)";
var CARD_BACK_COLOR = "rgb(0, 0, 255)";
var CARD_INACTIVE_COLOR = "rgb(125, 125, 125)";
var CORRECT_FLASH_COLOR = "rgb(0, 255, 0)";
var INCORRECT_FLASH_COLOR = "rgb(255, 0, 0)";

// Player constants
var P_START_X = 0;
var P_START_Y = 0;
var P_OFFSET_X = 30; // TODO: Find a way to calculate this dynamically based on view port.
var P_OFFSET_Y = 8; // TODO: Find a way to calculate this dynamically based on view port.
var P_SIZE = 60;
var P_SPEED = 6;

// CollisionGrid constants
var GRID_LENGTH = 31;
var GRID_HEIGHT = 13;
var NODE_SIZE = 60;

// GameCards constants
var CARD_AMOUNT = 30;

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
        corner1 = collisionGrid.valueAt(collisionGrid.getNode(this.x-1, this.y));
        corner2 = collisionGrid.valueAt(collisionGrid.getNode(this.x+this.size, this.y));
        if ((corner1 == null && corner2 == null)){return false;} else {return true;}

      case ("right"):
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
    if ((nodeNumber >= 0) && (nodeNumber <= (this.length * this.height))){
      var y = nodeNumber%this.length;
      var x = (nodeNumber - y) /this.length;
      return this.grid[x][y];
    }
    return 666;
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
  cardTypes: ["e","p","a","b","f","w"], // Defines possible card types.  Elevator needs to be first in the array and powercell second for correct game logic.
  typeAmounts: [ 1, 5, 2, 10, 10, 2], // Each index corresponds with index in cardTypes array, specifying amount to distribute.  Items need to total totalCards for correct game logic.
  totalCards: CARD_AMOUNT, // Defines how many cards are displayed.
  bFlashing: false, // Flag that forces selectCard to ignore user input.  Used if an animation needs to be updated before user input can be processed.

  // Builds deck based on the types and distrubution defined by the cardTypes & typeAmounts arrays.
  buildDeck: function(shuffle){
    // Variables needed to iterate type/amount arrays
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
      return;
    }
    // Check for a elevator and powercell match. If found, deactive the cards.
    if ((this.deck[i].type == this.cardTypes[0]) || (this.deck[i].type == this.cardTypes[1])){
      if ((this.deck[j].type == this.cardTypes[0]) || (this.deck[j].type == this.cardTypes[1])){
        this.deck[i].bActive = false;
        this.deck[j].bActive = false;
        flashingCards.matchType = this.cardTypes[0];
        return;
      }
    }
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
}


// Performs necessary functions for updating/displaying the game world.
// this is the where the magic happens.
function gameLoop(){
  if (KILL) {return;}  // Dev use only, used to stop game world updates completely.
  updateDomDisplay();
  updateFlashing();
  display();
  gameTime += 30;
}

///////////////////////////
// Game Loop begins here //
///////////////////////////
window.addEventListener("keydown", movePlayer);
gameCards.buildDeck(true);
collisionGrid.buildGrid();
player.init();
buildDOM();
setInterval(gameLoop, 30);
