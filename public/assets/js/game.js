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

const showMsg = (msg) => {
	document.querySelector('#message').innerHTML = `<h2>${msg}</h2>`
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
	reactionTimeList.innerHTML = null;

	document.querySelector('#round').innerText = `${players[0].rounds + 1}`;
	players.forEach(player => {
		reactionTimeList.innerHTML += `<li>${player.name}: ${player.reactionTime}</li>`
	})

}

const showScore = (players) => {
	document.querySelector('#score-list').innerHTML = null;
	players.forEach(player => {
		document.querySelector('#score-list').innerHTML += `<li>${player.name}: ${player.score}</li>`
	})
}

const showWinner = (winner, players) => {
	if (players.length === 2) {
		gameWrapperEl.classList.add('hide');
		document.querySelector('#winner-wrapper').classList.remove('hide');
		document.querySelector('#winner').innerHTML = `<h1>The Winner is ${winner}</h1>`

	}
}

const showPlayBtn = (players) => {
	playBtn.disabled = false;
	playBtn.innerText = 'Play!';

	playBtn.addEventListener('click', e => {
		e.preventDefault();
		showGame()
		let gameBoardWidth = gameBoardEl.offsetWidth;
		let gameBoardHeight =  gameBoardEl.offsetHeight;
		console.log('socket', socket)
		socket.emit('start-game', gameBoardWidth, gameBoardHeight, players);
	})
}

// get username and emit register-user-event to server
usernameForm.addEventListener('submit', e => {
	e.preventDefault();

	username = usernameForm.username.value;
	socket.emit('register-user', username, (status) => {
		usersArray = status.onlinePlayers;

		socket.emit('match-player', (status.onlinePlayers));
		socket.emit('save-player', (status.onlinePlayers));
	});
})

document.querySelector('#play-again').addEventListener('click', e => {
	e.preventDefault();
	window.location.reload()
})

/**
 * Click virus
 */
gameBoardEl.addEventListener('click', e => {
	e.preventDefault();

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
	showMsg(msg, players);
})

socket.on('end-game', (winner, players) => {
	showWinner(winner, players)
});
