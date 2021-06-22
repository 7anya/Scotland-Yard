module.exports = class Game {
	generateStartPositions() {
		// Generates a array of size 6 with random starting positions for all 6 players.
		// works by making a array of [1:198] and shuffling it and taking first 6 elements
		var array = [];
		var startPositions = [];
		for (var i = 1; i <= 199; i++) {
			array.push(i);
		}
		for (var i = array.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		for (var i = 0; i < 6; i++) {
			startPositions.push(array[i]);
		}
		return startPositions;
	}

	constructor(gameID) {
		// Global variables
		// Connection variables
		this.gameID = gameID;

		// Game variables
		this.players = []; // Stores player class instances of all players in the game
		this.mrx = null; // This is mrx for the session (array index of the player)
		this.active = false;
		this.startPositions = this.generateStartPositions();
		this.colors = [
			'#03a9f4',
			'#8bc34a',
			'#ffc107',
			'#9c27b0',
			'#e91e63',
			'#ff5722',
		];
		this.turn = -1;
	}
	join(player) {
		player.moves.push(new Move(this.startPositions.pop(), 'N'));
		player.color = this.colors.pop();
		this.players.push(player);
		playersObj = {};
		this.players.forEach((player) => {
			playersObj[player.userID] = {};
			playersObj[player.userID]['name'] = player.name;
			playersObj[player.userID]['color'] = player.color;
		});
		io.to(this.gameID).emit('new_player', playersObj);
	}
	start(player) {
		if (this.mrx == null) {
			player.socket.emit(
				'alert',
				'There is no Mr.X to catch! Ask someone to become Mr.X before starting the game'
			);
		} else {
			this.players[this.mrx].setAsMrX(this.players.length);
			this.turn = this.mrx;
			this.active = true;
		}
		io.to(this.gameID).emit(
			'alert',
			'The game is under way! Mr.X goes first'
		);
		this.players[this.mrx].socket.emit('your_turn', 'true');
	}
	setMrX(player) {
		if (this.mrx == null) {
			this.mrx = this.players.findIndex((element) => element == player);
			io.to(gameID).emit('set_MrX', player.userID);
		} else {
			socket.emit('alert', 'Someone is already Mr.X!');
		}
	}

	checkIfPositionOccupied(location) {
		players.forEach((player) => {
			if (
				!player.isMrX &&
				player.moves[player.moves.length - 1].to == location
			)
				return true;
		});
		return false;
	}

	makeMove(player, location, ticket) {
		if (player != this.players[this.turn])
			player.socket.emit('alert', 'Not your turn, buddy!');
		can_move = false;
		can_move = player.checkTicketAvailability(ticket, 0);
		tickets = ticket.split('_');
		locations = location.split('_');
		can_move =
			can_move && player.checkMoveAvailability(tickets[0], locations[0]);
		if (tickets.length == 2 && locations.length == 2) {
			can_move =
				can_move &&
				player.checkMoveAvailability(tickets[1], locations[1]);
		}
		if (can_move) {
			if (
				(tickets.length == 1 ||
					!this.checkIfPositionOccupied(locations[1])) &&
				!this.checkIfPositionOccupied(locations[0])
			) {
				player.makeMove(
					tickets[0],
					locations[0],
					this.players[this.mrx],
					this.gameID,
					false
				);
				if (tickets.length == 2) {
					player.makeMove(
						tickets[1],
						locations[1],
						this.players[this.mrx],
						this.gameID,
						false
					);
				}
			} else
				player.socket.emit(
					'alert',
					'Cannot make move as someone else is already at that position'
				);
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
			this.turn = (this.turn + 1) % this.players.length;
			this.players[this.turn].socket.emit('your_turn', 'true');
		} else {
			socket.emit('alert', 'Illegal Move!');
		}
	}
};
