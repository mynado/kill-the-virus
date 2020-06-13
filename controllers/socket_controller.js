/**
 * Socket Controller
 */

const debug = require('debug')('kill-the-virus:socket_controller');
const users = {};
let reactionTime = [];
randomData = null;
let rounds = null;
let width = null;
let height = null;
let playerClicked = 0;

/**
 * Get username of online players
 */
function getOnlinePlayers() {
	return Object.values(users);
}

function handleUserDisconnect() {
	debug('Someone left the game.');
}

function handleRegisterUser(username, callback) {
	debug(`Player ${username} is connected to the game.`);
	users[this.id] = username;
	callback({
		joinGame: true,
		usernameInUse: false,
		onlinePlayers: getOnlinePlayers(),
	});

	// broadcast to all connected sockets except ourselves
	this.broadcast.emit('online-players', getOnlinePlayers());

}

/**
 * Get random virus position and delay time
 */
function getRandomData(width, height) {
	// random position
	// width = gameBoardWidth;
	// height = gameBoardHeight;
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

	if (players.length !== 2) {
		return;
	}
	console.log('players:', players)
	game.users = players;
	console.log('game:', game)
	this.emit('show-playBtn', players);
	this.broadcast.emit('show-playBtn', players);
}

/**
 * Handle Random Data
 */
function handleRandomData(gameBoardWidth, gameBoardHeight) {
	width = gameBoardWidth;
	height = gameBoardHeight;
	getRandomData(width, height)
	io.emit('random-data', randomData);
}
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
	playerClicked = playerClicked + player.clicked;

	console.log('clicked', playerClicked)
	if (playerClicked === 2 && player.rounds < 10) {
		handleRandomData(width, height);
	} else {
		return;
	}
	playerClicked = 0;

}

function handleRandomVirus() {
	console.log('randomData in handleRandomVirus', randomData)
	// this.emit('new-random-data', randomData);
}
module.exports = function(socket) {
	debug('A player connected!', socket.id);
	io = this;
	socket.on('disconnect', handleUserDisconnect);

	socket.on('register-user', handleRegisterUser);

	//this.emit('random-data', getRandomData());

	socket.on('click-virus', handleClickVirus);

	socket.on('match-player', handleMatchPlayer);
	socket.on('get-random-virus', handleRandomVirus);

	socket.on('start-game', handleRandomData);

}
