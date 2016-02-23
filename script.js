var cardArea = {
  cards: [],
  animationStack: [],
  matchStatus: null,
  curAnimTime: 0,
  curFlashTime: 0,
  maxFlashSec: 0.3,
  maxAnimSec: 3,
  faceColor: "rgb(255, 255, 0)",
  backColor: "rgb(0, 0, 255)",
  outOfPlayColor: "rgb(125, 125, 125)",
  correctFlash: "rgb(0, 255, 0)",
  incorrectFlash: "rgb(255, 0, 0)",
  currentFlashColor: "rgb(255, 255, 0)",
  prevFlashColor: "rgb(0, 255, 0)",
  maxWrong: 5,
  curWrong: 0,
  maxCorrect: 0,
  curCorrect: 0,
  endOfGame: false,
  ready: false,

  createGame:function(numCards,numTries){
    if (this.ready){this.restartGame();}
    this.maxWrong = numTries;
    if ((numCards % 2) != 0){numCards+=1;}
    var curVal = 0;
    for (var i = 0; i < numCards; i++){
      // Create cardArea Objects.
      if((i%2) == 0){curVal++;}
      var card = {
        bInPlay: true,
        bFlipped: false,
        domObj: null,
        value: curVal
      }
      this.cards.push(card);
    }
    this.maxCorrect = numCards/2;
    this.shuffleCards();
    this.createDomObjects();
    this.ready = true;
  },

  checkFlip: function(i){
    if(this.cards[i].bInPlay && this.curAnimTime == 0 && !this.endOfGame){
      if(this.matchStatus == null){
        this.flipCard(i);
        this.matchStatus = i;
      }
      else{
        this.flipCard(i);
        if(this.checkMatch(i, this.matchStatus)){
          // code for correct match
          this.prevFlashColor = this.correctFlash;
          this.cards[i].bInPlay = false;
          this.cards[this.matchStatus].bInPlay = false;
          this.curCorrect++;
          if (this.curCorrect == this.maxCorrect){this.endGame();}
        }
        else{
          // code for incorrect match
          this.prevFlashColor = this.incorrectFlash;
          this.curWrong++;
          if (this.curWrong == this.maxWrong){this.endGame();}
        }
        this.animationStack.push(i);
        this.animationStack.push(this.matchStatus);
        this.matchStatus = null;
        this.curAnimTime = this.maxAnimSec * 1000;
        this.curFlashTime = this.maxFlashSec * 1000;
      }

    }
  },

  flipCard: function(i){
    if(!this.cards[i].bInPlay){
      this.cards[i].domObj.style.backgroundColor=this.outOfPlayColor;
      this.cards[i].bFlipped = true;
      if (this.cards[i].domObj.childNodes.length == 0){this.cards[i].domObj.appendChild(document.createTextNode(cardArea.cards[i].value));}
    }
    else{
      if(!this.cards[i].bFlipped){
        this.cards[i].domObj.style.backgroundColor=this.faceColor;
        this.cards[i].bFlipped = true;
        this.cards[i].domObj.appendChild(document.createTextNode(cardArea.cards[i].value));
      }
      else {
        this.cards[i].domObj.style.backgroundColor=this.backColor;
        this.cards[i].bFlipped = false;
        this.cards[i].domObj.removeChild(this.cards[i].domObj.childNodes[0]);
      }
    }
  },

  animate: function(){
    if (this.curAnimTime > 0){
       this.curAnimTime -= 30;
       this.curFlashTime -= 30;

       if(this.curFlashTime < 0){this.curFlashTime = 0;}
       if(this.curFlashTime == 0){
         this.swapFlash();
         this.curFlashTime = this.maxFlashSec * 1000;
         for (var i = 0; i < this.animationStack.length; i++){
           this.cards[this.animationStack[i]].domObj.style.backgroundColor = this.currentFlashColor;
         }
       }
    }
    if (this.curAnimTime < 0) {this.curAnimTime = 0;}
    if (this.curAnimTime == 0 && this.animationStack.length > 0){
      while (this.animationStack.length > 0){
        this.flipCard(this.animationStack.pop());
      }
      this.curFlashTime = 0;
      this.curFlashColor = this.faceColor;
    }
  },

  swapFlash: function(){
    var temp;
    temp = this.currentFlashColor;
    this.currentFlashColor = this.prevFlashColor;
    this.prevFlashColor = temp;
  },

  checkMatch: function(i, j){
    if(this.cards[i].value == this.cards[j].value){return true;}
    else return false;
  },

  endGame: function(){
    this.endOfGame = true;
    for (var i = 0; i < this.cards.length; i++){
      this.cards[i].bInPlay = false;
      this.flipCard(i);
    }

    if(this.curWrong == this.maxWrong){
      console.log("LOSER!");
    }
    else{
      console.log("WINNER!")
    }

    document.getElementsByTagName("header")[0].style.visibility = "visible"

  },

  restartGame: function(){
    var cardAreaDomObj = document.getElementsByClassName("cardArea")[0];
    while (cardAreaDomObj.childNodes.length > 0){
      cardAreaDomObj.removeChild(cardAreaDomObj.childNodes[0]);
    }
    this.cards = [];
    this.animationStack = [];
    this.matchStatus = null;
    this.curAnimTime = 0;
    this.curFlashTime = 0;
    this.currentFlashColor = "rgb(255, 255, 0)";
    this.prevFlashColor = "rgb(0, 255, 0)";
    this.curWrong = 0;
    this.curCorrect = 0;
    this.endOfGame = false;
    this.ready = false;
  },

  shuffleCards: function(){
    function getRand(num) {return (Math.round(Math.random() * num));}
    var tempDeck = [];
    var usedIndexes = [];
    var rand = getRand(this.cards.length-1);

    for (i=0; i<this.cards.length; i++){
      while(usedIndexes.indexOf(rand)>-1){
        rand = getRand(this.cards.length-1);
      }
      tempDeck.push(this.cards[rand]);
      usedIndexes.push(rand);
    }
    this.cards = tempDeck;
  },

  createDomObjects: function(){
    var area = document.getElementsByClassName("cardArea")[0];
    for(var i = 0; i < this.cards.length; i++){
      div = document.createElement('div');
      div.className = "card";
      area.appendChild(div);
      div.setAttribute("id", i);
      div.addEventListener("click", flip);
      this.cards[i].domObj = div;
    }
  }
}

function flip(event){
  cardArea.checkFlip(Number(this.id));
}

function startGame(event){
  var numCards = Number(document.getElementById("cardsInDeck").value);
  var numTries = Number(document.getElementById("numberOfTries").value);
  if(!isNaN(numCards)&&!isNaN(numTries)) {
    cardArea.createGame(numCards, numTries);
    document.getElementsByTagName("header")[0].style.visibility = "hidden";
  }
}

setInterval(cardArea.animate.bind(cardArea), 30);
document.getElementById("startGame").addEventListener("click",startGame);
