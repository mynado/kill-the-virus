/**
 * Game.js
 */

// make connection
const socket = io();

const startEl = document.querySelector('#start');
const usernameForm = document.querySelector('#username-form');
const playBtn = document.querySelector('#play-btn');
const gameWrapperEl = document.querySelector('#game-wrapper');
const gameBoardEl = document.querySelector('#game-board');
const virusImg = document.querySelector('#virus-img');

/**
 * Randomly show virus
 */
let createdTime = null;

const getRandomPosition = () => {
	let x = gameBoardEl.offsetWidth;
	let y = gameBoardEl.offsetHeight;
	let randomX = Math.abs((Math.random()*x) - 300);
	let randomY = Math.abs((Math.random()*y) - 300);

	return [randomX, randomY];
}

const changePosition = () => {
	var xy = getRandomPosition();
	var x = xy[0];
	var y = xy[1];
	virusImg.style.marginLeft= x + 'px';
	virusImg.style.marginTop = y + 'px';
}

const showVirus = () => {
	let randomNumber = Math.round(Math.random() * 5);

	let time = randomNumber * 1000;
	console.log(time);
	changePosition();
	setTimeout(() => {
		virusImg.style.display = "block";
		createdTime = Date.now();
	}, time)
}


// get username and emit register-user-event to server
usernameForm.addEventListener('submit', e => {
	e.preventDefault();

	username = document.querySelector('#username').value;
	socket.emit('register-user', username, (status) => {
		console.log('Server acknowledge the registration', status.onlinePlayers);

		if (status.joinGame) {
			startEl.classList.add('hide');
			gameWrapperEl.classList.remove('hide');
		}

		showVirus();

	})
})

