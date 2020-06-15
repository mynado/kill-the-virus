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

/**
 * Get player id and name
 */
function getPlayerIdAndName(id) {
	console.log('player in getPlayerIdAndName', id)
}

function handleUserDisconnect() {
	debug('Someone left the game.');
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

	if (players.length === 1) {
		let msg = "Waiting for player"
		this.emit('waiting-for-player', msg, players)
	}

	if (players.length === 2) {
		console.log(score)
		msg = "Let's play!"
		this.emit('show-playBtn', msg, players);
		this.broadcast.emit('show-playBtn', msg, players);
	}

	if (players.length > 2) {
		msg = 'There is already two players connected'
		this.emit('too-many-players', msg, players)
	}
}

/**
 * Handle End Game
 */
function endGame(players) {
	console.log('players in endGame', players)

	const winner = players
		.reduce((a, b) => a.score > b.score ? a : b)
		.name;
	console.log(winner)
	io.emit('end-game', winner, players);
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
		debug('savedReactionTime', savedReactionTime)
	}

	// check the fastest reaction time and assign score accordingly
	if (player.reactionTime === savedReactionTime) {
		score[this.id] = score[this.id] + 1;
		player.score = score[this.id]
	} else if (player.reactionTime !== savedReactionTime) {
		score[this.id] = score[this.id] + 0;
		player.score = score[this.id]
	}

	// save all the clicks in an array
	savedPlayersArray = players;

	// empty players array and
	if (players.length === 2) {
		players = [];
		savedReactionTime = 100;
	}

	playerClicked = playerClicked + player.clicked;

	if (playerClicked === 2 && player.rounds < 3) {
		handleRandomData(width, height);
	} else if (player.rounds === 3) {
		endGame(savedPlayersArray);
	} else {
		return
	}
	playerClicked = 0;
}

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
	socket.on('save-player', getPlayerIdAndName);
	socket.on('match-player', handleMatchPlayer);
	socket.on('start-game', handleRandomData);
}
