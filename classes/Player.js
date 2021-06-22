module.exports = class Player {
	constructor(userID, name, socket) {
		this.userID = userID;
		this.name = name;
		this.socket = socket;
		this.color = null;

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
		this.doubleMove = 4; //Reduces by 2 every time (so effectively 2 tickets
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
				if (/^([TBU]|BL)_([TBU]|BL)$/.test(ticket)) {
					tickets = ticket.split('_');
					if (player.doubleMove > 0) {
						if (tickets[0] == tickets[1]) {
							return this.checkTicketAvailability(tickets[0], 1);
						}
						return (
							this.checkTicketAvailability(tickets[0], 0) &&
							this.checkTicketAvailability(tickets[1], 0)
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
		if (ticket == 'N') return true;
		lastLocation = this.moves[this.moves.length - 1].to;
		if (
			map[lastLocation].has(location) &&
			(ticket == 'BL' || map[lastLocation][location].includes(ticket))
		)
			return true;
		return false;
	}

	makeMove(ticket, location, mrx, gameID, isDouble) {
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
		if (isDouble) this.doubleMove--;
		this.moves.push(new Move(location, (isDouble ? '2' : '') + ticket));

		if (this.isMrX) {
			length = this.moves.length - 1; // -1 as we discount the initial move of starting Positions
			if (
				length == 3 ||
				length == 8 ||
				length == 13 ||
				length == 18 ||
				length == 24
			) {
				io.to(gameID).emit('MrX_reveal', location);
			}
			io.to(gameID).emit('MrX_moves', ticket);
		} else {
			io.to(gameID).emit('detective_moves', this.userID + '_' + location);
		}
	}
};
