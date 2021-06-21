const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const socketio = require('socket.io');
const map = require('./data/map.json');

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

class Move {
	constructor(to, ticket) {
		this.to = to;
		this.ticket = ticket;
	}
}

class Player {
	constructor(userID, name, socket) {
		this.userID = userID;
		this.name = name;
		this.socket = socket;

		// Game related variables
		this.isMrX = false;
		this.taxi = 10;
		this.bus = 8;
		this.underground = 4;
		this.doubleMove = 0;
		this.black = 0;
		this.moves = [];
	}
	setAsMrX(totalPlayers) {
		this.taxi = 4;
		this.bus = 3;
		this.underground = 3;
		this.doubleMove = 2;
		this.black = totalPlayers - 1;
		this.isMrX = true;
	}

	checkTicketAvailability(ticket, limit) {
		switch (ticket) {
			case 'T':
				if (this.taxi > limit) return true;

			case 'B':
				if (this.bus > limit) return true;

			case 'U':
				if (this.underground > limit) return true;

			case 'BL':
				if (this.black > limit) return true;

			case 'N':
				return true;
			default:
				if (/^2_([TBU]|BL)_([TBU]|BL)$/.test(ticket)) {
					tickets = ticket.split('_');
					if (player.doubleMove > 0) {
						if (tickets[1] == tickets[2]) {
							return this.checkTicketAvailability(tickets[1], 1);
						}
						return (
							this.checkTicketAvailability(tickets[1], 0) &&
							this.checkTicketAvailability(tickets[2], 0)
						);
					}
					return false;
				}
				this.socket.emit(
					'alert',
					'Did you just try to hack and cheat? Bad hooman :(' //hehe nice
				);
		}
	}

	checkMoveAvailability(ticket, location) {
		if (location == 'N') return true;
		lastLocation = this.moves[this.moves.length - 1].to;
		if (
			map[lastLocation].has(location) &&
			map[lastLocation][location].includes(ticket)
		)
			return true;
		return false;
	}

	makeMove(ticket, location, mrx, gameID) {
		switch (ticket) {
			case 'T':
				this.taxi--;
				if (!this.isMrX) mrx.taxi++;
				break;
			case 'B':
				this.bus--;
				if (!this.isMrX) mrx.bus++;
				break;
			case 'U':
				this.underground--;
				if (!this.isMrX) mrx.underground++;
				break;
			case 'BL':
				this.black--;
				break;
		}
		this.moves.push(new Move(location, ticket));

		if (this.isMrX) {
			length = this.moves.length;
			if (
				length == 3 ||
				length == 8 ||
				length == 13 ||
				length == 18 ||
				length == 24
			) {
				io.to(gameID).emit('MrX_moves', this.moves);
			}
		} else {
			io.to(gameID).emit('player_moves', this);
		}
	}
}

class Game {
	constructor(gameID) {
		// Global variables
		// Connection variables
		this.gameID = gameID;

		// Game variables
		this.players = []; // Stores player class instances of all players in the game
		this.mrx = NULL; // This is mrx for the session (array index of the player)
		this.active = false;
		this.turn = -1;
	}
	join(player, socket) {
		arr = {};
		this.players.forEach((player) => (arr[player.userID] = player.name));
		this.players.push(player);
		io.to(this.gameID).emit('new_player', arr);
	}
	start(player) {
		if (this.mrx == NULL) {
			player.socket.emit(
				'alert',
				'There is no Mr.X to catch! Ask someone to become Mr.X before starting the game'
			);
		} else {
			this.players[this.mrx].setAsMrX(this.players.length);
			this.turn = this.mrx;
			this.active = true;
		}
		io.to(this.gameID).emit('alert', 'The game is under way!');
	}
	setMrX(player) {
		if (this.mrx == NULL) {
			this.mrx = this.players.findIndex((element) => element == player);
		} else {
			socket.emit('alert', 'Someone is already Mr.X!');
		}
	}

	makeMove(player, location, ticket) {
		can_move = false;
		can_move = player.checkTicketAvailability(ticket, 0);
		tickets = ticket.split('_');
		locations = location.split('_');
		if (tickets.length == 3 && locations.length == 2) {
			can_move =
				can_move &&
				player.checkMoveAvailability(ticket[1], location[0]);
			can_move =
				can_move &&
				player.checkMoveAvailability(ticket[2], location[1]);
		} else {
			can_move =
				can_move && player.checkMoveAvailability(ticket, location);
		}
		if (can_move) {
			if (tickets.length == 1) {
				player.makeMove(
					ticket,
					location,
					this.players[this.mrx],
					this.gameID
				);
			} else {
				player.makeMove(
					ticket[1],
					location[0],
					this.players[this.mrx],
					this.gameID
				);
				player.makeMove(
					ticket[2],
					location[1],
					this.players[this.mrx],
					this.gameID
				);
			}
			if (
				!player.isMrX &&
				location ==
					this.players[this.mrx].moves[
						this.players[this.mrx].moves.length - 1
					].to
			) {
				io.to(gameID).emit('alert', player.name + ' caught Mr.X!');
				// TODO emit all moves of Mr.X on channel 'finish'
			}
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
	player = new Player(
		makeID(),
		'Player_' + Math.floor(Math.random() * 10),
		socket
	);

	socket.on('new_game', () => createNewGame());
	socket.on('join_game', (data) => {
		data = data.split('_');
		joinGame(data[0], data[1]);
	});
	socket.on('start_game', (data) => startGame(data));
	socket.on('become_MrX', (data) => {
		data = data.split('_');
		becomeMrX(data[0], data[1]);
	});

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

	function createNewGame() {
		gameID = Math.floor(Math.random() * 1000000000).toString();
		games.set(gameID, new Game(gameID));
		game = games.get(gameID);
		game.join(player, socket);

		socket.join(gameID);
		socket.emit('new_game', gameID);
	}

	function joinGame(gameID) {
		game = games.get(gameID);
		if (game.players.length >= 6) {
			socket.emit(
				'alert',
				'Sorry, no more players allowed (max capacity: 6)'
			);
		} else if (game.active) {
			socket.emit(
				'alert',
				'Sorry, the game is already under way. You cannot join in this round'
			);
		} else {
			socket.join(gameID, socket);
			game.join(player);
			socket.emit(
				'alert',
				'You joined the game. Waiting for it to start'
			);
		}
	}

	function startGame(gameID) {
		game = games.get(gameID);
		if (game.players.length < 4) {
			socket.emit(
				'alert',
				'Minimum 4 players required to start this game!'
			);
		} else {
			game.start(player);
		}
	}

	function becomeMrX(gameID) {
		game = games.get(gameID);
		game.setMrX(player);
	}

	function makeMove(gameID, data) {
		game = games.get(gameID);
		data = data.split('@');
		game.makeMove(player, data[0], data[1]);
	}
});
