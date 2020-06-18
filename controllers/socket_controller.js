/**
 * Socket Controller
 */
let io = null;
let users = {};
let players = [];
let savedPlayersArray = null;

let randomData = null;
let width = null;
let height = null;
let widthArr = []
let heightArr = [];

let playerClicked = 0;
let savedReactionTime = {};
let score = {};

/**
 * Get username of online players
 */
function getOnlinePlayers() {
	return Object.values(users);
}

/**
 * Handle disconnection
 */
function handleUserDisconnect() {
	delete users[this.id];
}

/**
 * Get random virus position and delay time
 */
function getRandomData(width, height) {
	// random position
	let randomX = Math.abs((Math.random()*width) - 300);
	let randomY = Math.abs((Math.random()*height) - 300);

	// random time
	let randomNumber = Math.round(Math.random() * 3);
	let time = randomNumber * 1000;

	randomData = {
		x: randomX,
		y: randomY,
		time: time,
		image: randomNumber,
	}
	return randomData
}

/**
 * Handle match player
 */
function handleMatchPlayer(players) {
	// get user id
	const userIds = Object.keys(users);

	if (players.length === 1) {
		this.emit('waiting-for-player')
	}

	if (players.length === 2) {
		userIds.forEach(id => {
			io.to(id).emit('start-game', players)
		})
	}

	if (players.length > 2) {
		delete users[this.id];
		this.emit('too-many-players', players)
	}
}

/**
 * Handle End Game
 */
function endGame(players) {
	const winner = players
		.reduce((a, b) => a.score > b.score ? a : b)
		.name;
	const tie = players
		.reduce((a, b) => {
			if (a.score === b.score) {
				return `It's a tie`;
			} else {
				return false;
			}
		});
	// get user id
	const userIds = Object.keys(users);
	userIds.forEach(id => {
		io.to(id).emit('end-game', winner, tie, players)
	})
}

/**
 * Handle reset values
 */
function handleReset() {
	randomData = null;
	savedReactionTime = {};
	savedPlayersArray = null;
	playerClicked = 0;
	users = {};
	score = {};
}

/**
 * Handle measurements
 */
function handleMeasurements(_width, _height) {
	widthArr.push(_width)
	heightArr.push(_height)
	// get the smallest value in array
	width = Math.min(...widthArr)
	height = Math.min(...heightArr)
}

/**
 * Handle Random Data
 */
function handleRandomData() {
	getRandomData(width, height)
	const players = getOnlinePlayers()
	const userIds = Object.keys(users);
	userIds.forEach(id => {
		io.to(id).emit('random-data', randomData, players)
	})
}

/**
 * Handle Virus Click
 */
function handleClickVirus(playerData) {
	// show reaction time for player
	let player = {
		name: users[playerData.id],
		id: playerData.id,
		reactionTime: playerData.reactionTime,
		clicked: playerData.clicked,
		rounds: playerData.rounds,
	}

	// save player to array
	players.push(player);
	if (players.length === 2) {
		const userIds = Object.keys(users);
		userIds.forEach(id => {
			io.to(id).emit('show-reaction-time', players)
		})
	}

	// save reaction time in score object
	savedReactionTime[this.id] = player.reactionTime;

	// compare reaction time and save new time
	if (players.length === 2) {
		let fastPlayerId = Object.keys(savedReactionTime).reduce((a, b) => savedReactionTime[a] < savedReactionTime[b] ? a : b);

		let slowPlayerId = Object.keys(savedReactionTime).reduce((a, b) => savedReactionTime[a] > savedReactionTime[b] ? a : b);

		players.forEach(player => {
			if (player.id === fastPlayerId) {
				score[fastPlayerId]++;
				player.score = score[fastPlayerId];
			}
			if (player.id === slowPlayerId) {
				score[slowPlayerId] = score[slowPlayerId] + 0;
				player.score = score[slowPlayerId];
			}
		})

		const userIds = Object.keys(users);
		userIds.forEach(id => {
			io.to(id).emit('show-score', players)
		})
	}

	// save all the clicks in an array to get the highest score
	savedPlayersArray = players;

	// empty players array and reset reaction time
	if (players.length === 2) {
		players = [];
		savedReactionTime = {};
	}

	playerClicked = playerClicked + player.clicked;

	if (playerClicked === 2 && player.rounds < 10) {
		handleRandomData(width, height);
	} else if (player.rounds === 10) {
		endGame(savedPlayersArray);
	} else {
		return
	}
	playerClicked = 0;
}

/**
 * Handle Register User
 */
function handleRegisterUser(username, callback) {
	// add id and username to users
	if (Object.keys(users).length >= 0 ) {
		users[this.id] = username;
		score[this.id] = 0;
		callback({
			joinGame: true,
			usernameInUse: false,
			onlinePlayers: getOnlinePlayers(),
		});
	} else if (Object.keys(users).length < 3) {
		users[this.id] = username;
		score[this.id] = 0;

		callback({
			joinGame: true,
			usernameInUse: false,
			onlinePlayers: getOnlinePlayers(),
		});
	}

	if (Object.keys(users).length === 3) {
		delete users[this.id]
		delete score[this.id]
	}
}

module.exports = function(socket) {
	io = this;
	socket.on('disconnect', handleUserDisconnect);
	socket.on('register-user', handleRegisterUser);
	socket.on('click-virus', handleClickVirus);
	socket.on('match-player', handleMatchPlayer);
	socket.on('get-random-data', handleRandomData);
	socket.on('send-measurements', handleMeasurements)
	socket.on('reset', handleReset)
}
