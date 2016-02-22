var cardArea = {
  cards: [],

  createCardArea:function(numCards){
    if ((numCards % 2) != 0){numCards+=1;}
    var area = document.getElementsByClassName("cardArea")[0];
    for (var i = 0; i < numCards; i++){
      div = document.createElement('div');
      div.className = "card";
      area.appendChild(div);
      div.setAttribute("id", i);
      div.addEventListener("click", flip);
      var card = {
        flipStat: false,
        value: i
      }
      this.cards.push(card);
    }
  }
}

function flip(event){
  var cardNum = Number(this.id);;
  if(!cardArea.cards[cardNum].flipStat){
    this.style.backgroundColor="rgb(255, 0, 0)";
    cardArea.cards[cardNum].flipStat = true;
  }
  else {
    this.style.backgroundColor="rgb(0, 0, 255)";
    cardNum = Number(this.id);
    cardArea.cards[cardNum].flipStat = false;
  }
}

cardArea.createCardArea(32);
