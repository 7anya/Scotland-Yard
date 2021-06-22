# Socket event details:

_NOTE: Where not specified, data will be ignored. Also, the event names are case sensitive_

### welcome:

-   **server -> client:** Sends you your userID (randomly generated)

### new_game:

-   **client -> server:** Creates a new game
-   **server -> client:** Data contains the gameID of the created game

### join_game:

-   **client -> server:** Joins a new game. Data should be the `gameID`

### become_MrX:

-   **client -> server:** Try to become Mr.X

### set_MrX:

-   **server -> client:** Set a player as Mr.X. Data contains `userID` of the player

### start_game:

-   **client -> server:** Try to start the game you have created/joined

### make_move:

-   **client -> server:** Try to make a move: The format would be `location@ticket`
    -   For MrX's double Move, the format would be: `location1_location2@ticket1_ticket2`

### alert:

-   **server -> client:** Alert the user. Data is the string to present to the user

### new_player:

-   **server -> client:** Inform all users of a new player. Data contains a json Object of the format: `{"gameID":'Some game ID', "playerID1": {'name': 'someName', 'color': 'someHex'}, 'playerID2' :{...}}`
    -   _Note: All players are sent out every time someone joins. This is so that even the new player gets a list of all players. You will also receive your own self in that list._

### your_turn:

-   **server -> client:** This is your turn, you should make a move now

### MrX_reveal:

-   **server -> client:** Sent out when location of MrX is supposed to be revealed. Data contains current `location` of Mr.X

### MrX_moves:

-   **server -> client:** Sent out when Mr.X moves. Data contains the `ticket` he used

### detective_moves:

-   **server -> client:** Sent out when one of the detectives move. Data contains `playerID_location`
