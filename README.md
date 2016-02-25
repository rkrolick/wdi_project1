## Memory card matching game.

Use W,A,S,D to move the player (green square), click on a card to select it.
You must be adjacent to the card to select it.
Avoid the enemy (red square).
The game ends if you correctly find all the cards, or if the enemy catches you.

---

### Technology Used

Javascript, HTML, and CSS.

---

### Approach:

Attempted to create various objects to govern game rules. Objects are called by the
gameLoop function, which is set by interval to be called every 33 milliseconds.  The
code was meant to be flexible, configured by global constants, but time constraints
hindered functional implementation of this goal.

---

### Installation

Either goto: [https://github.com/ga-dc/wdi8/blob/master/asking-for-help.md](https://github.com/ga-dc/wdi8/blob/master/asking-for-help.md)

Or goto: [https://github.com/rkrolick/wdi_project1](https://github.com/rkrolick/wdi_project1)
Download files to local repository.
Open index.html in Chrome.

This game has only been tested in Chrome.

---

### Known issues:  

The collision detection isn't completely reliable.  Because of this,
the enemy isn't smartly advancing on the player.

Resizing the screen to less than 1080 causes display issues.

Score information does not display well after more than one playthrough of the game.

---

### User Stories

The player should be able to replay the game.

The player should have a win & lose conditions.

The player should receive a better score the faster they complete the game.

The player should be able to see their score.

The  player should be able to move their character.
