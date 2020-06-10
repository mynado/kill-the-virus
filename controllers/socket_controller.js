/**
 * Socket Controller
 */

const debug = require('debug')('kill-the-virus:socket_controller');

module.exports = function(socket) {
	debug('A player connected!', socket.id);

	socket.on('disconnect', () => {
		debug('Someone left the game.');
	});
}
