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

const Move = require('./classes/Move');
const Player = require('./classes/Player');
const Game = require('./classes/Game');
const Test = require('./classes/Test');

io.on('connection', (socket) => {
	// test = new Test();
	// test.emit(socket);
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

	var game = null;

	socket.emit('welcome', player.userID);

	socket.on('new_game', () => createNewGame());
	socket.on('join_game', (gameID) => joinGame(gameID));
	socket.on('become_MrX', () => becomeMrX());
	socket.on('start_game', () => startGame());
	socket.on('make_move', (data) => makeMove(data));

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
		game.join(player);

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
			socket.join(gameID);
			game.join(player);
			socket.emit(
				'alert',
				'You joined the game. Waiting for it to start'
			);
		}
	}

	function startGame() {
		if (game == null)
			socket.emit('alert', 'You think you can hack into this game, eh?');
		if (game.players.length < 4) {
			socket.emit(
				'alert',
				'Minimum 4 players required to start this game!'
			);
		} else {
			game.start(player);
		}
	}

	function becomeMrX() {
		if (game == null)
			socket.emit(
				'alert',
				'Stop sending requests without proper flow, you neophyte!'
			);
		game.setMrX(player);
	}

	function makeMove(data) {
		data = data.split('@');
		game.makeMove(player, data[0], data[1]);
	}
});
