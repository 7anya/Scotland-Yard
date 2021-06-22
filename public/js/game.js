var socket = io.connect();
var userID;
var gameID;
var roomDetails;
var Mrx;

$('#inGame').hide();
$('#lobby').hide();
$('#startGameButton').prop('disabled', true);

socket.on('welcome', function (data) {
	userID = data;
});

socket.on('alert', function (data) {
	alert(data);
});

socket.on('new_player', function (data) {
	gameID = data.gameID;
	$('#gameIDHeading').text('Game ID: ' + gameID);
	roomDetails = data;
	$('#inGame').hide();
	$('#welcome').hide();
	$('#lobby').show();
	$('#playerListBody').empty();

	var i = 1;
	for (property in roomDetails) {
		if (property !== 'gameID') {
			var tr = document.createElement('tr');
			var th = document.createElement('th');
			var td = document.createElement('td');
			th.innerText = '' + i;
			td.innerText = roomDetails[property].name;
			tr.appendChild(th);
			tr.appendChild(td);

			var mainList = document.getElementById('playerListBody');
			mainList.appendChild(tr);
			i++;
		}
	}
});

socket.on('set_MrX', function (data) {
	Mrx = data;
	$('#becomeMrxButton').prop('disabled', true);
	$('#becomeMrxButton').text(roomDetails[Mrx].name + ' is the Mr. X');
	$('#startGameButton').prop('disabled', false);
});

function handleGameID(event) {
	event.preventDefault();

	var gameID = $('#inputGameID')[0].value;
	socket.emit('join_game', gameID);
}

function handleNewGame(event) {
	event.preventDefault();

	socket.emit('new_game');
	socket.on('new_game', function (data) {
		gameID = data;
		$('#gameIDHeading').text('Game ID: ' + gameID);
		console.log(gameID);
		$('#inGame').hide();
		$('#welcome').hide();
		$('#lobby').show();
	});
}

function handleBecomeMrx(e) {
	e.preventDefault();

	socket.emit('become_MrX');
}
