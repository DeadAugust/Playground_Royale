Trust Royale
=================
### work together to win alone

a semi-cooperative game of middle school embarassment in the browser for 2-20 players

by Atharva Patil and August Luhrs  
Collective Play Final Project  
ITP Spring 2019 -- Mimi Yin  

## Showdown Weights
- Both Trust : +2/+2
- Both Betray: +0/+0
- Trust/Betray: -4/+3

## New TODO (5/3)
- ~~smaller map~~
- ~~on death, leave school~~
- ~~timer for losing cool~~
  - ~~show on side screen, or maybe with stroke of avatar? or a timer on their avatar?~~
  - ~~+ red~~
  - ~~triggered cool and reset~~
- new UI (stuff on the side)
  - ~~mouseOver to show secret goal~~
- ~~make start button changes~~
- ~~new movement (tap instead of hold)~~
- ~~movement bug if too much at same time~~
- ~~no items~~
- ~~new theme (Middle School Playground)~~
  - ~~could have image overlay of playground, grass transparent~~
- ~~names on screens~~
- ~~new high five screen~~
  - ~~transparent overlay~~
  - ~~name of person ~~
  - ~~high five or whiff~~
    - emojis?
  - ~~send event~~
  - ~~results screen~~
    - ~~go away on move~~
- ~~no leaderboard, just start screen~~
- ~~secret goals (best friend, rival)~~
  - ~~new ready screen ~~
    - ~~shows who your best friend/rival is~~
    - ~~reminder text (you only win if you survive and X) ~~
    - press start when ready
- ~~ first ready screen (rules recap)~~
  - paragraph better
- end game screen
  - final points + if win
  - secret objectives revealed
- ~~New instructions~~
  - ~~first name required~~




## Premise

In Trust Royale(working title), players compete for points while ensuring their survival in a dense battleground. Players can only succeed by pairing up with other players, though only one player will be crowned the victor. The game ends when either all but one player are dead or when the time runs out, at which point the player with the most points wins. In the case of a tie, the player with more health wins. If there is still a tie, you must face off one on one to the death (SUDDEN DEATH).

## Set Up

- Players can go to trust-royale.glitch.me and choose their color and name. Upon pressing the color select and name submit buttons, they will see a grey ready screen. Press start on that screen to be entered into the queue. 
- Open trust-royale.glitch.me/screen for the shared screen which will display the score leaderboard and the whole map AND the start options. When all players have joined, press "Start Game" on the shared screen.
- ~~When every player is ready and displaying on the leaderboard, the VIP player (indicated on the player screen and leaderboard) can press the "START" button to begin the game. (Should the VIP also be the one who has the settings page? or is that on the shared screen? or...)~~

## How To Play
- Your player avatar will be a square with the color you chose, with a black square in the center to represent your item. You start with no item.
- The controls for movement are either WASD or the arrow keys. You must hold the keys down to move, it will not work very well if you try and press multiple times in the same direction.
- Items (colored circles) will spawn randomly across the map, to pick them up, you simply run over that square with your avatar. The item square will change to match the color of the item you picked up.
- You cannot move over items if you are carrying one already. To drop an item, press spacebar. 
- The only way to use an item you are carrying is to pair up with another player (they do not need to have an item). If you are orthogonally adjacent (up, down, left, right) of another player, you will use your item and the border of your square will change to match the item you just used. Other players cannot see what item you currently have, but they can see what the item you used last was.
- When pairing, you will get the main bonus of that item, but your partner will get a smaller bonus as well. For attack, the effects are reversed.
- The items and their effects are as follows:
  - Red/Health -- you gain three health and your partner gains one health.
  - Cyan/Points -- you gain three points and your partner gains one point.
  - YellowGreen/Attack -- your partner loses three health and you lose one health.
- You can see your current health and points in a display to the right of the map. Speed and Attack power, though displayed, are not used in this version.



# TO DO -- Priority (by Apr 29)
- ~~Finish File Template~~ (rn it's just copied from "The Mind" files)
- Map
  - ~~starting map dimensions~~ (scalable)
  - ~~array system that can only hold one thing at a time~~
  - better fit in window
  - edge squares cut off (mode(CORNER?))
- Movement
  - ~~works with keyPressed~~
  - ~~need to be able to hold down keys to move~~
  - ~~socket events~~
- Items
  - Types + Effects
    - ~~health~~
    - ~~attack~~
    - speed (adjusts rate of move event)
    - ~~points~~
    - slow?
    - teleport?
  - ~~Demo Shapes (ellipse)~~
  - Assets to replace Demo Shapes?
  - Spawning
    - ~~rate~~
    - ~~location~~
    - item probability distribution
    - denser in center
  - ~~picking up items~~
    - ~~socket event~~
    - ~~if adj. then will have to throw away instead of drop later~~
- Pairing
  - ~~Inventory~~
    - ~~visible on player, but not for others~~
    - ~~can press space to drop the item (which will place it in that location? or no, because then you would want people to drop what they have to prove it's not a trap? or that's okay because then you could steal it from them?) ~~
  - ~~Triggering on Adjacency (max 2)~~
    - ~~socket event~~
  - Effects
    - ~~item events (effect for holder, small effect for paired) -- 3 to 1 for ex.~~
      - ~~reversed for offensive items~~
    - if matching items (big effect for both) -- 6 ea. for ex.
    - ~~die if health 0~~
    - ~~stroke of last traded item~~
    - player name visible
- ~~Player Stats - UI~~
  - ~~Health~~
  - ~~Attack~~
  - ~~Speed~~
  - ~~Points~~
- Better Player Stats UI
  - bars on side?
  - over player square?
  - what about if height > width?
- Disconnect
  - ~~remove player from game elements~~
  - reset player screens on screen reset
  - make player avatar die
- starting settings
  - map size (tough since all 3 indiv. declare, need to fix)
  - timer
  - spawn rate?
- ~~Scoreboard on Screen~~
- ~~Ready Players on Set Up Screen~~


# TO DO -- Secondary (by May 6 or TBD)
- Map Effects
  - ratio to player count
  - not defined in 3 locations, only one
  - scrolling zoom in/out
  - each round/time period shrinks the map size?
  - environmental hazards?
    - stone walls that block movement
    - pools that slow movement
    - walls of fire that damage you if you move through them
    - temporary hot spots that grant points if you stand in them (king of the hill?)
- Mobile Optimization
- separate namespaces for mobile/laptop players?
- Way to make color-blind friendly?
- Make it so can't cheat/see scoreboard from client side
- Movement
  - fix initial delay
  - fix no diagonal movement?
  - add option of key press instead of held down? 
- diff trade effects
  - if kill, extra points? (half of their pts?)
- A.I. Enemy
  - Learning or Model?
  - Spawning Rate
    - Location
  - Actions
  - Directions
- Different rounds?
- Secret Personal Objectives?
  -betrayer?
- Finish README instructions
- Better name?
- Documentation




