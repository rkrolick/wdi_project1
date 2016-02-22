var cardArea = {
  cards: [],

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
    if(this.cards[i].bInPlay){
      this.flipCard(i);
    }
  },

  flipCard: function(i){
    if(!this.cards[i].bFlipped){
      this.cards[i].domObj.style.backgroundColor="rgb(255, 0, 0)";
      this.cards[i].bFlipped = true;
      this.cards[i].domObj.appendChild(document.createTextNode(cardArea.cards[i].value));
    }
    else {
      this.cards[i].domObj.style.backgroundColor="rgb(0, 0, 255)";
      this.cards[i].bFlipped = false;
      this.cards[i].domObj.removeChild(this.childNodes[0]);
    }
  },

  shuffleCards: function(){

  }
}

function flip(event){
  cardArea.checkFlip(Number(this.id));
}

cardArea.createCardArea(32);
