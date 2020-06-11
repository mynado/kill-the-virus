/**
 * Socket Controller
 */

const debug = require('debug')('kill-the-virus:socket_controller');
const users = {};
let reactionTime = [];

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
function getRandomData() {
	// random position
	// let width = gameBoard.offsetWidth;
	// let height = gameBoard.offsetHeight;
	let width = 600;
	let height = 400;
	let randomX = Math.abs((Math.random()*width) - 300);
	let randomY = Math.abs((Math.random()*height) - 300);

	// random time
	let randomNumber = Math.round(Math.random() * 5);
	let time = randomNumber * 1000;

	randomData = {
		x: randomX,
		y: randomY,
		time: time,
	}

	debug('randomPosition', randomData)
	// this.broadcast.emit('random-position', randomData);
	return randomData

}

function handleClickVirus(reactionTime) {
	debug(reactionTime);
	this.emit('new-random-data', getRandomData());
}


module.exports = function(socket) {
	debug('A player connected!', socket.id);
	debug('users', users)

	socket.on('disconnect', handleUserDisconnect);

	socket.on('register-user', handleRegisterUser);

	socket.emit('random-position', getRandomData());

	socket.on('click-virus', handleClickVirus);

}
