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
	let time = randomData.time;
	changePosition(randomData);
	setTimeout(() => {
		virusImg.src = `./assets/img/${randomData.image}.svg`
		virusImg.style.display = "block";
		virusShown = Date.now();
	}, time)
}

// show connection message
const showMsg = (msg) => {
	document.querySelector('#message').innerHTML = `<p>${msg}</p>`
}

const showGame = () => {
	startEl.classList.add('hide');
	gameWrapperEl.classList.remove('hide');
}

const showStartPage = () => {
	document.querySelector('#winner-wrapper').classList.remove('hide');
	startEl.classList.remove('hide');
}

const showPlayers = (players) => {
	document.querySelector('#versus').innerText = `${players[0]} vs ${players[1]}`
}

const showReactionTime = (players) => {
	let reactionTimeList = document.querySelector('#reaction-time')
	let roundEl = document.querySelector('#round');
	reactionTimeList.innerHTML = null;
	reactionTimeList.classList.remove('hide');
	roundEl.classList.remove('hide')
	roundEl.innerText = `${players[0].rounds}`;
	players.forEach(player => {
		reactionTimeList.innerHTML += `<li>${player.name}: ${player.reactionTime}</li>`
	})
}

const showScore = (players) => {
	document.querySelector('#score-list').innerHTML = null;
	document.querySelector('#score-list').classList.remove('hide');
	players.forEach(player => {
		document.querySelector('#score-list').innerHTML += `<li>${player.name}: ${player.score}</li>`
	})
}

const showWinner = (winner, tie, players) => {
	if (players.length === 2) {
		document.querySelector('#winner-wrapper').classList.remove('hide');
		if (tie) {
			document.querySelector('#winner').innerText = tie;
		} else {
			document.querySelector('#winner').innerText = `The winner is ${winner}, congrats!`;
		}
	}
}

const showPlayBtn = (players) => {
	registerBtn.classList.add('hide');
	playBtn.classList.remove('hide');

	playBtn.addEventListener('click', e => {
		e.preventDefault();
		showGame()
		let gameBoardWidth = gameBoardEl.offsetWidth;
		let gameBoardHeight =  gameBoardEl.offsetHeight;
		socket.emit('start-game', gameBoardWidth, gameBoardHeight, players);
	})
}

// get username and emit register-user-event to server
usernameForm.addEventListener('submit', e => {
	e.preventDefault();
	username = usernameForm.username.value;
	socket.emit('register-user', username, (status) => {
		socket.emit('match-player', (status.onlinePlayers));
	});
})

document.querySelector('#play-again').addEventListener('click', e => {
	e.preventDefault();
	window.location.reload()
})

// Click virus
gameBoardEl.addEventListener('click', e => {
	e.preventDefault();

	if (e.target.tagName === 'IMG') {
		virusClicked = Date.now();
		reactionTime = (virusClicked - virusShown) / 1000;
		timesClicked++;
		rounds++
		playerData = {
			reactionTime,
			id: socket.id,
			clicked: timesClicked,
			rounds,
		}
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
	showMsg(msg);
	showPlayBtn(players);
})

socket.on('show-reaction-time', (player) => {
	showReactionTime(player);
})

socket.on('show-score', (players) => {
	showScore(players)
})

socket.on('waiting-for-player', (msg, players) => {
	showMsg(msg, players);
})

socket.on('too-many-players', (msg, players) => {
	showStartPage(players);
	showMsg(msg, players);
})

socket.on('end-game', (winner, tie, players) => {
	showWinner(winner, tie, players)
});
