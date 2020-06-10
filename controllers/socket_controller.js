/**
 * Socket Controller
 */

const debug = require('debug')('kill-the-virus:socket_controller');
const users = {};

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

module.exports = function(socket) {
	debug('A player connected!', socket.id);

	socket.on('disconnect', handleUserDisconnect);

	socket.on('register-user', handleRegisterUser);
}
