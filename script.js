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
  correctFlash: "rgb(0, 255, 0)",
  incorrectFlash: "rgb(255, 0, 0)",
  currentFlashColor: "rgb(255, 255, 0)",
  prevFlashColor: "rgb(0, 255, 0)",

  createCardArea:function(numCards){
    if ((numCards % 2) != 0){numCards+=1;}
    var area = document.getElementsByClassName("cardArea")[0];
    for (var i = 0; i < numCards; i++){

      //Create DOM objects.
      div = document.createElement('div');
      div.className = "card";
      area.appendChild(div);
      div.setAttribute("id", i);
      div.addEventListener("click", flip);

      // Create cardArea Objects.
      var curVal;
      if((i%2) == 0){curVal=i;}else{curVal=i-1;}
      var card = {
        bInPlay: true,
        bFlipped: false,
        domObj: div,
        value: curVal
      }
      this.cards.push(card);
    }

    this.shuffleCards();
  },

  checkFlip: function(i){
    if(this.cards[i].bInPlay && this.curAnimTime == 0){
      if(this.matchStatus == null){
        this.flipCard(i);
        this.matchStatus = i;
      }
      else{
        this.flipCard(i);
        this.checkMatch(i, this.matchStatus);
        this.animationStack.push(i);
        this.animationStack.push(this.matchStatus);
        this.matchStatus = null;
        this.curAnimTime = this.maxAnimSec * 1000;
        this.curFlashTime = this.maxFlashSec * 1000;
      }

    }
  },

  flipCard: function(i){
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
  },

  animate: function(){
    //console.log(this);
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
      for (var i = 0; i < this.animationStack.length; i){
        this.flipCard(this.animationStack.pop());
      }
      this.curFlashTime = 0;
    }
  },

  swapFlash: function(){
    var temp;
    temp = this.currentFlashColor;
    this.currentFlashColor = this.prevFlashColor;
    this.prevFlashColor = temp;
  },

  checkMatch: function(){

  },

  shuffleCards: function(){

  }
}

function flip(event){
  cardArea.checkFlip(Number(this.id));
}

setInterval(cardArea.animate.bind(cardArea), 30);
cardArea.createCardArea(32);
