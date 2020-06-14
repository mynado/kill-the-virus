/**
 * Game.js
 */

// make connection
const socket = io();

const startEl = document.querySelector('#start');
const usernameForm = document.querySelector('#username-form');
const registerBtn = document.querySelector('#register-btn');
const playBtn = document.querySelector('#play-btn');
const gameWrapperEl = document.querySelector('#game-wrapper');
const gameBoardEl = document.querySelector('#game-board');
const virusImg = document.querySelector('#virus-img');

let virusShown = null;
let virusClicked = null;
let reactionTime = null;
let timesClicked = 0;
let rounds = 0;
let usersArray = null;

let playerData = {
		reactionTime,
		id: null,
		clicked: false,
	}

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

const showPlayBtn = () => {
	playBtn.disabled = false;
	playBtn.innerText = 'Play!';
}

const showMsg = (msg, players) => {
	console.log(msg, players)
	document.querySelector('#message').innerHTML = `<h2>${msg}</h2>`
}

const showGame = () => {
	startEl.classList.add('hide');
	gameWrapperEl.classList.remove('hide');
}

const showPlayers = (players) => {
	document.querySelector('#versus').innerText = `${players[0]} vs ${players[1]}`
}

const showReactionTime = (players) => {
	console.log('in function showReactionTime', players);
	let reactionTimeList = document.querySelector('#reaction-time')
	reactionTimeList.innerHTML = null;
	if (players.length === 2) {
		document.querySelector('#round').innerText = `${players[0].rounds + 1}`;
		players.forEach(player => {
			reactionTimeList.innerHTML += `<li>${player.name}: ${player.reactionTime}</li>`
		})
	}
	socket.emit('get-score', players);

}

}

// get username and emit register-user-event to server
usernameForm.addEventListener('submit', e => {
	e.preventDefault();

	username = usernameForm.username.value;
	socket.emit('register-user', username, (status) => {
		console.log(status)
		console.log('Server acknowledge the registration', status.onlinePlayers);
		usersArray = status.onlinePlayers;

		socket.emit('match-player', (status.onlinePlayers));
		socket.emit('save-player', (status.onlinePlayers));
	});
})

playBtn.addEventListener('click', e => {
	e.preventDefault();
	showGame()
	let gameBoardWidth = gameBoardEl.offsetWidth;
	let gameBoardHeight =  gameBoardEl.offsetHeight;
	console.log('socket', socket)
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


socket.on('random-data', (randomData, players) => {
	showGame();
	showPlayers(players);
	showVirus(randomData);
});

socket.on('show-playBtn', (msg, players) => {
	console.log('players in socket.on', players)
	showMsg(msg, players);
	showPlayBtn();
})

socket.on('show-reaction-time', (player) => {
	showReactionTime(player);
})


socket.on('waiting-for-player', (msg, players) => {
	showMsg(msg, players);
})

socket.on('too-many-players', (msg, players) => {
	showMsg(msg, players);
})
