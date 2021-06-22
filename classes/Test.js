module.exports = class Test {
	constructor() {}
	emit(socket) {
		socket.emit('yee');
	}
};
