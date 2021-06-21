const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const socketio = require('socket.io');

const app = express();
app.set('view engine', 'ejs');
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/home', (req, res) => {
	console.log('eeeeee');
	res.render('map');
});

let PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});

const io = socketio(server);

const games = new Map();

class Player {
	constructor() {
		this.taxi;
	}
}

class Game {
	constructor(roomID) {
		// Global variables
		// Connection variables
		this.roomID = roomID;

		// Game variables
		this.players = []; // Stores playerIDs of all players in the game
		var mrx; // This is mrx for the session (array index of the player)
		this.active = false;
	}
	join(id) {
		this.players.push(id);
		// TODO: Notify all players a new player has joined
	}
	start() {
		this.active = true;
		// TODO: Notify all players game has started
	}
	setMrX(id) {
		if (this.mrx == NULL)
			this.mrx = this.players.findIndex((element) => element == id);
		else {
			// TODO: Tell client someone is already Mr.X
		}
	}
}

io.on('connection', (socket) => {
	console.log('New user connected');
	// socket.on("ping", (data)=>{
	// console.log(data);
	// })

	// socket.emit('pong', data);

	//io.to('some room').emit('some event');

	function makeID(length) {
		var result = '';
		var characters =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(
				Math.floor(Math.random() * charactersLength)
			);
		}
		return result;
	}

	function createNewGame(id) {
		roomID = Math.floor(Math.random() * 1000000000).toString();
		games.set(room, new Game(roomID));
		room = games.get(roomID);
		room.join(id);

		socket.join(roomID);
		// TODO: Send roomID back to client
	}

	function joinGame(roomID, id) {
		room = games.get(roomID);
		if (room.players.length >= 6) {
			// TODO: Tell client no more players allowed in this room
		} else if (room.active) {
			// TODO: Tell player the game has already started
		} else {
			room.join(id);

			socket.join(roomID);
		}
		// TODO: Send Okay to client
	}

	function startGame(roomID) {
		room = games.get(roomID);
		if (room.players.length < 2) {
			// TODO: Reply to client stating need min 2 players
		} else {
			room.start();
		}
	}

	function becomeMrX(roomID, id) {
		room = games.get(roomID);
		room.setMrX(id);
	}
});
