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

let virusShown = null;
let virusClicked = null;
let reactionTime = null;
let timesClicked = 10;



/**
 * Randomly show virus
 */
const changePosition = (randomData) => {
	virusImg.style.marginLeft= randomData.x + 'px';
	virusImg.style.marginTop = randomData.y + 'px';
}

const showVirus = (randomData) => {
	let time = randomData.time;
	changePosition(randomData);
	setTimeout(() => {
		virusImg.style.display = "block";
		virusShown = Date.now();
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

		if (timesClicked > 1) {
			// showVirus(randomPositionDelay);
		}

	})
})

gameBoardEl.addEventListener('click', e => {
	e.preventDefault();

	if (e.target.tagName === 'IMG') {
		virusClicked = Date.now();
		reactionTime = (virusClicked - virusShown) / 1000;

		console.log(reactionTime);
		timesClicked = timesClicked - 1;

		if (timesClicked > 1) {
			socket.emit('click-virus', reactionTime);
		} else {
			virusImg.style.display = "none";
		}
	}

});

socket.on('random-position', (randomData) => {
	showVirus(randomData);
});

socket.on('new-random-data', (newRandomData) => {
	showVirus(newRandomData);
})

