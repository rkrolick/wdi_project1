var cardArea = {
  cards: [],
  possibleValues: ["wood", "metal", "water"],

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

      var card = {
        bFlipped: false,
        value: i
      }
      this.cards.push(card);
    }

    this.shuffleCards();
  },

  shuffleCards: function(){

  }
}

function flip(event){
  var cardNum = Number(this.id);
  if(!cardArea.cards[cardNum].bFlipped){
    this.style.backgroundColor="rgb(255, 0, 0)";
    cardArea.cards[cardNum].bFlipped = true;
    this.appendChild(document.createTextNode(cardArea.cards[cardNum].value));
  }
  else {
    this.style.backgroundColor="rgb(0, 0, 255)";
    cardNum = Number(this.id);
    cardArea.cards[cardNum].bFlipped = false;
    this.removeChild(this.childNodes[0]);
  }
}

cardArea.createCardArea(32);
