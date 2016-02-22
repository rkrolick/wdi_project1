

function createCardArea(numCards){
  var area = document.getElementsByClassName("cardArea")[0];
  var card;
  for (var i = 0; i < numCards; i++){
    div = document.createElement('div');
    div.className = "card";
    area.appendChild(div);
  }
}

createCardArea(22);
