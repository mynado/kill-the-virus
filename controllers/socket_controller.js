/**
 * Socket Controller
 */
const debug = require('debug')('kill-the-virus:socket_controller');

const users = {};
let io = null;
let randomData = null;
let savedReactionTime = 100;
let score = {};
let width = null;
let height = null;
let playerClicked = 0;
let players = [];
let savedPlayersArray = null;

/**
 * Get username of online players
 */
function getOnlinePlayers() {
	return Object.values(users);
}

function handleUserDisconnect() {
	debug('Someone left the game.', users[this.id]);
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
 * Handle Random Data
 */
function handleRandomData(gameBoardWidth, gameBoardHeight) {
	width = gameBoardWidth;
	height = gameBoardHeight;
	getRandomData(width, height)
	const players = getOnlinePlayers()
	io.emit('random-data', randomData, players);
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
		io.emit('show-reaction-time', players);
	}

	// compare reaction time
	if (player.reactionTime < savedReactionTime) {
		savedReactionTime = player.reactionTime;
	}

	// check the fastest reaction time and assign score accordingly
	if (player.reactionTime === savedReactionTime) {
		score[this.id] = score[this.id] + 1;
		player.score = score[this.id]
	} else if (player.reactionTime !== savedReactionTime) {
		score[this.id] = score[this.id] + 0;
		player.score = score[this.id]
	}

	if (players.length === 2) {
		io.emit('show-score', players)
	}
	// save all the clicks in an array
	savedPlayersArray = players;

	// empty players array and
	if (players.length === 2) {
		players = [];
		savedReactionTime = 100;
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
	debug(`Player ${username} is connected to .`);

	users[this.id] = username;
	score[this.id] = 0;

	callback({
		joinGame: true,
		usernameInUse: false,
		onlinePlayers: getOnlinePlayers(),
	});
}

module.exports = function(socket) {
	debug('A player connected!', socket.id);
	io = this;
	socket.on('disconnect', handleUserDisconnect);
	socket.on('register-user', handleRegisterUser);
	socket.on('click-virus', handleClickVirus);
	socket.on('match-player', handleMatchPlayer);
	socket.on('get-random-data', handleRandomData);
}
