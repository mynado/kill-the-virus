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
let timesClicked = 0;
let rounds = 0;

/**
 * Randomly show virus
 */
const changePosition = (randomData) => {
	virusImg.style.marginLeft= randomData.x + 'px';
	virusImg.style.marginTop = randomData.y + 'px';
}

const showVirus = (randomData) => {
	console.log('randomData in showVirus', randomData)
	let time = randomData.time;
	changePosition(randomData);
	setTimeout(() => {
		virusImg.src = `./assets/img/${randomData.image}.svg`
		virusImg.style.display = "block";
		virusShown = Date.now();
	}, time)

}

const showGame = (randomData) => {
const showPlayBtn = () => {
	playBtn.disabled = false;
	playBtn.innerText = 'Play!';
}

const showGame = () => {
	startEl.classList.add('hide');
	gameWrapperEl.classList.remove('hide');
}
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
		socket.emit('match-player', (status.onlinePlayers));

	})
playBtn.addEventListener('click', e => {
	e.preventDefault();
	showGame()
	let gameBoardWidth = gameBoardEl.offsetWidth;
	let gameBoardHeight =  gameBoardEl.offsetHeight;
	console.log('click')
	socket.emit('start-game', gameBoardWidth, gameBoardHeight);
})

/**
 * Click virus
 */
gameBoardEl.addEventListener('click', e => {
	e.preventDefault();

	console.log(socket)

	if (e.target.tagName === 'IMG') {
		virusClicked = Date.now();
		reactionTime = (virusClicked - virusShown) / 1000;
		console.log(reactionTime);
		timesClicked++;
		rounds++
		playerData = {
			reactionTime,
			id: socket.id,
			clicked: timesClicked,
			rounds,
		}
		console.log('timesClicked', timesClicked)
		socket.emit('click-virus', playerData);
		virusImg.style.display = "none";
		timesClicked = 0;
	}

});

socket.on('random-position', (randomData) => {
socket.on('random-data', (randomData) => {
	showGame();
	showVirus(randomData);
});

socket.on('show-playBtn', (players) => {
	console.log('players in socket.on', players)
	showPlayBtn(players);
})

