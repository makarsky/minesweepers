var rowNumber = 9;
var bombsNumber = 10;

var UI = (function() {
	var DOMstrings = {
		enableFlagBtn: '#enable-flag-btn',
		flagIcon: 'flag-icon',
		flagIconBroken: 'flag-icon--broken',
		flagCounter: '#flag-counter',
		restartBtn: '#restart-btn',
		container: '.square-container',
		disabled: 'disabled',
		stopwatch: '#stopwatch',
		squareClass: 'square',
		bomb: 'square--bomb',
		win: 'square--win',
		exploded: 'square--exploded',
		open: 'square--open',
		open0: 'square--open0',
		open1: 'square--open1',
		open2: 'square--open2',
		open3: 'square--open3',
		open4: 'square--open4',
		open5: 'square--open5',
		open6: 'square--open6',
		open7: 'square--open7',
		open8: 'square--open8',
		emoji: 'emoji'
	};

	var stopwatchInterval = null;
	var stopwatchStartTime = null;
	var flagCounter = bombsNumber;
	var squares = null;
	let holdIndicatorRadiusPx = 48;
	let holdIndicatorElement = null;

	function init() {
		var container = document.querySelector(DOMstrings.container);
		var numberOfSquares = rowNumber * rowNumber;

		for (var i = 0; i < numberOfSquares; i++) {
			var square = document.createElement('div');
			square.classList.add(DOMstrings.squareClass);
			container.appendChild(square);
		}

		squares = Array.from(container.getElementsByClassName(DOMstrings.squareClass));
	}

	function getIndexOfSquare(squareElement) {
		return squares.indexOf(squareElement);
	}

	const openSquares = (squareData) => {
		const isBombHit = squareData.some((square) => square.value === 'b');

		if (!isBombHit && stopwatchInterval === null) {
			stopwatchStartTime = Date.now();
			stopwatchInterval = setInterval(updateStopwatch, 95);
		}

		squareData.forEach((square) => {
			const squareElement = squares[square.index];
			squareElement.classList.add(DOMstrings.open);

			if (typeof square.value === 'number' && square.value > 0) {
				squareElement.classList.add(DOMstrings['open' + square.value]);
				squareElement.textContent = square.value;
				return;
			}

			if (square.value === 'b') {
				squareElement.classList.add(DOMstrings.exploded, DOMstrings.emoji);
				document.querySelector(DOMstrings.container).classList.add(DOMstrings.disabled);
				stopStopwatch();
			}
		});
	};

	function showFlagAndBombValidation(bombsAndWrongFlags) {
		bombsAndWrongFlags.forEach(function(square) {
			var squareElement = squares[square.index];

			if (square.value === 'b') {
				squareElement.classList.add(DOMstrings.bomb, DOMstrings.emoji);
			} else if (square.value === 'f') {
				squareElement.classList.add(DOMstrings.flagIconBroken);
			}
		});
	}

	const showWin = (bombs) => {
		stopStopwatch();
		document.querySelector(DOMstrings.container).classList.add(DOMstrings.disabled);

		bombs.forEach((bomb) => {
			squares[bomb.index].classList.add(DOMstrings.win);
		});
	};

	const pad2 = (value) => String(value).padStart(2, '0');
	const pad3 = (value) => String(value).padStart(3, '0');

	const formatStopwatch = (elapsedMs) => {
		const totalMs = Math.max(0, Math.floor(elapsedMs));
		const ninetyNineHoursMs = 99 * 60 * 60 * 1000;

		if (totalMs >= ninetyNineHoursMs) {
			return '99h:99';
		}

		const hours = Math.floor(totalMs / 3_600_000);
		const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
		const seconds = Math.floor((totalMs % 60_000) / 1000);
		const milliseconds = totalMs % 1000;

		if (hours >= 1) {
			return `${pad2(hours)}h:${pad2(minutes)}`;
		}

		if (minutes >= 1) {
			return `${pad2(minutes)}m:${pad2(seconds)}`;
		}

		return `${pad2(seconds)}:${pad3(milliseconds)}`;
	};

	const updateStopwatch = () => {
		const elapsedMs = Date.now() - stopwatchStartTime;
		document.querySelector(DOMstrings.stopwatch).innerText = formatStopwatch(elapsedMs);
	};

	const stopStopwatch = () => {
		if (stopwatchInterval !== null && stopwatchStartTime !== null) {
			updateStopwatch();
		}

		clearInterval(stopwatchInterval);
		stopwatchInterval = null;
	};

	const resetStopwatch = () => {
		stopStopwatch();
		stopwatchStartTime = null;
		document.querySelector(DOMstrings.stopwatch).innerText = '00:000';
	};

	function updateFlagCounterUI() {
		if (flagCounter < 0) {
			var flagCounterUI = ('00' + -flagCounter).slice(-3).split('');
			flagCounterUI.splice(0, 1, '-');
			document.querySelector(DOMstrings.flagCounter).innerText = flagCounterUI.join('');
		} else {
			document.querySelector(DOMstrings.flagCounter).innerText = ('00' + flagCounter).slice(-3);
		}
	}

	function resetFlagCounterUI() {
		document.querySelector(DOMstrings.flagCounter).innerText = ('000' + flagCounter).slice(-3);
	}

	function putFlag(squareElement) {
		flagCounter--;
		squareElement.classList.add(DOMstrings.flagIcon);
		updateFlagCounterUI();
	}

	function removeFlag(squareElement) {
		flagCounter++;
		squareElement.classList.remove(DOMstrings.flagIcon);
		updateFlagCounterUI();
	}

	const removeHoldIndicator = () => {
		if (!holdIndicatorElement) {
			return;
		}

		holdIndicatorElement.remove();
		holdIndicatorElement = null;
	};

	const showHoldIndicator = (squareElement) => {
		removeHoldIndicator();

		const container = document.querySelector(DOMstrings.container);
		const squareRect = squareElement.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();
		const diameter = holdIndicatorRadiusPx * 2;
		const centerX = squareRect.left + squareRect.width / 2 - containerRect.left;
		const centerY = squareRect.top + squareRect.height / 2 - containerRect.top;

		const circle = document.createElement('div');
		circle.className = 'hold-indicator';
		circle.style.width = `${diameter}px`;
		circle.style.height = `${diameter}px`;
		circle.style.left = `${centerX - holdIndicatorRadiusPx}px`;
		circle.style.top = `${centerY - holdIndicatorRadiusPx}px`;
		container.appendChild(circle);
		holdIndicatorElement = circle;
	};

	function restart() {
		resetStopwatch();
		disableFlagEnabled();
		removeHoldIndicator();
		flagCounter = bombsNumber;
		resetFlagCounterUI();

		squares.forEach(function(square) {
			square.textContent = '';
			square.className = DOMstrings.squareClass;
		});
		document.querySelector(DOMstrings.container).classList.remove(DOMstrings.disabled)
	}

	function disableFlagEnabled() {
		document.querySelector(DOMstrings.enableFlagBtn).classList.remove(DOMstrings.open);
	}

	return {
		init,
		getIndexOfSquare,
		putFlag,
		removeFlag,
		showHoldIndicator,
		removeHoldIndicator,
		openSquares,
		getDOMstrings: function() {
			return DOMstrings;
		},
		toggleFlagEnabled: function() {
			document.querySelector(DOMstrings.enableFlagBtn).classList.toggle(DOMstrings.open);
		},
		restart,
		showWin,
		showFlagAndBombValidation,
		stopStopwatch
	};
})();


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var Game = (function() {
	var isFlagEnabled = false;
	var squares = [];
	var flags = [];

	function init() {
		squares = [];

		for (var i = 0; i < rowNumber; i++) {
			squares[i] = [];

			for (var j = 0; j < rowNumber; j++) {
				squares[i][j] = {value: 0, isOpen: false};
			}
		}

		for (var i = 0; i < bombsNumber; i++) {
			var randomRow = Math.floor(Math.random() * rowNumber);
			var randomCol = Math.floor(Math.random() * rowNumber);

			if (squares[randomRow][randomCol].value === 'b') {
				i--;
				continue;
			}

			squares[randomRow][randomCol].value = 'b';
			incrementAdjacentSquares(randomRow, randomCol);
		}
		// helps with debugging
		// console.table(squares.map((i) => i.map(j => j.value)));
	}

	function incrementAdjacentSquares(row, col) {
		var adjacentSquares = [
			squares[row - 1] && squares[row - 1][col - 1],
			squares[row - 1] && squares[row - 1][col],
			squares[row - 1] && squares[row - 1][col + 1],
			squares[row] && squares[row][col - 1],
			squares[row] && squares[row][col + 1],
			squares[row + 1] && squares[row + 1][col - 1],
			squares[row + 1] && squares[row + 1][col],
			squares[row + 1] && squares[row + 1][col + 1]
		];

		adjacentSquares.forEach(function(square) {
			doesSquareHaveNumber(square) ? square.value++ : false;
		});
	}

	function doesSquareHaveNumber(square) {
		return square && typeof square.value === 'number';
	}

	function getSquarePositionByIndex(index) {
		var row = Math.floor(index / rowNumber);
		var col = index % rowNumber;

		if (isNaN(row) || isNaN(col) || row < 0 || col < 0 || row >= rowNumber || col >= rowNumber) {
			return false;
		}

		return {row, col};
	}

	function getSquareIndexByCoords(coords) {
		var i = coords.row * rowNumber + coords.col;

		if (coords.row < 0 || coords.col < 0 || coords.row >= rowNumber || coords.col >= rowNumber) {
			return false;
		}

		return i;
	}

	function toggleFlag(index) {
		var squarePos = getSquarePositionByIndex(index);

		return toggleFlagOnSquare(index, squarePos.row, squarePos.col);
	}

	function toggleFlagOnSquare(index, row, col) {
		var isFlagSet = flags.some(function(el) {return el.index === index;});

		if (isFlagSet) {
			removeFlag(index);
			return false;
		} else {
			putFlag(index, row, col);
			return true;
		}
	}

	function putFlag(index, row, col) {
		flags.push({value: 'f', index, row, col});
	}

	function removeFlag(index) {
		flags = flags.filter(function(el) {return el.index !== index;});
	}

	function openSquaresByIndex(i) {
		var position = getSquarePositionByIndex(i);
		var isFlagSet = flags.some(function(el) {return el.index === i;});

		if (!position || isFlagSet) {
			return [];
		}

		var square = squares[position.row][position.col];

		if (square.isOpen) {
			return [];
		}

		square.isOpen = true;
		var squaresToOpen = [{index: i, value: square.value}];

		if (square.value === 'b') {
			return squaresToOpen;
		}
		if (square.value !== 0) {
			return squaresToOpen;
		}

		var adjacentSquareCoords = [
			{row: position.row - 1, col: position.col - 1},
			{row: position.row - 1, col: position.col},
			{row: position.row - 1, col: position.col + 1},
			{row: position.row, col: position.col - 1},
			{row: position.row, col: position.col + 1},
			{row: position.row + 1, col: position.col - 1},
			{row: position.row + 1, col: position.col},
			{row: position.row + 1, col: position.col + 1}
		];

		return adjacentSquareCoords.reduce(function (squaresToOpen, coords) {
			var i = getSquareIndexByCoords(coords);
			return typeof i === 'number' ? squaresToOpen.concat(openSquaresByIndex(i)) : squaresToOpen;
		}, squaresToOpen);
	}

	function restart() {
		isFlagEnabled = false;
		flags = [];
		init();
	}

	const areAllSafeSquaresOpened = () => {
		const numberOfOpenedSafe = squares.reduce((count, row) => {
			return count + row.filter((square) => square.isOpen && square.value !== 'b').length;
		}, 0);

		return numberOfOpenedSafe === (rowNumber * rowNumber - bombsNumber);
	};

	function areAllFlagsCorrect() {
		return flags.every(function(flag) {
			return squares[flag.row][flag.col].value === 'b';
		}) && (flags.length === bombsNumber);
	}

	const getBombs = () => {
		const bombs = [];

		squares.forEach((row, i) => {
			row.forEach((square, j) => {
				if (square.value === 'b') {
					bombs.push({value: 'b', index: getSquareIndexByCoords({row: i, col: j})});
				}
			});
		});

		return bombs;
	};

	const getUnflaggedBombs = () => {
		return getBombs().filter((bomb) => {
			return !flags.some((flag) => flag.index === bomb.index);
		});
	};

	const getFlagAndBombValidation = () => {
		const wrongFlags = flags.filter((flag) => squares[flag.row][flag.col].value !== 'b');
		return getUnflaggedBombs().concat(wrongFlags);
	};

	return {
		init,
		putFlag,
		toggleFlagEnabled: function() {
			isFlagEnabled = !isFlagEnabled;
		},
		isFlagEnabled: function() {
			return isFlagEnabled;
		},
		toggleFlag,
		openSquaresByIndex,
		restart,
		areAllSafeSquaresOpened,
		areAllFlagsCorrect,
		getBombs,
		getUnflaggedBombs,
		getFlagAndBombValidation
	};
})();


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var Controller = (function(UIController, GameController) {
	var DOM = UIController.getDOMstrings();
	var firstReveal = true;
	let isGameOver = false;

	function setupEventListeners() {
        document.querySelector(DOM.enableFlagBtn).addEventListener('click', toggleFlagEnabled);
		setupTapAndHold();
		document.querySelector(DOM.container).addEventListener('contextmenu', toggleFlag);
		document.querySelector(DOM.restartBtn).addEventListener('click', restart);
		document.addEventListener('checkIfWinByOpenedSquares', checkIfWinByOpenedSquares);
		document.addEventListener('checkIfWinByFlag', checkIfWinByFlag);
		document.addEventListener('gameOver', showFlagAndBombValidation);
	}

	const setupTapAndHold = () => {
		const holdDelayMs = 200;
		let holdTimeout = null;
		let holdTriggered = false;

		const container = document.querySelector(DOM.container);

		const clearHoldTimeout = () => {
			clearTimeout(holdTimeout);
			holdTimeout = null;
		};

		container.addEventListener('touchstart', (e) => {
			container.removeEventListener('contextmenu', toggleFlag);
			container.removeEventListener('mouseup', mouseup);

			clearHoldTimeout();
			holdTriggered = false;

			const target = e.target;

			holdTimeout = setTimeout(() => {
				holdTimeout = null;
				holdTriggered = true;

				if (toggleFlag({ target, preventDefault() {} })) {
					UIController.showHoldIndicator(target);
				}
			}, holdDelayMs);
		});

		container.addEventListener('touchend', (e) => {
			clearHoldTimeout();
			UIController.removeHoldIndicator();

			if (!holdTriggered) {
				handleSquare(e);
			}
		});

		container.addEventListener('touchcancel', () => {
			clearHoldTimeout();
			UIController.removeHoldIndicator();
		});

		container.addEventListener('mouseup', mouseup);
	};

	function mouseup(e) {
		if (e.button === 0) {
			handleSquare(e);
		}
	}

	function init() {
		GameController.init();
		UIController.init();
		setupEventListeners();
	}

	function toggleFlagEnabled(event) {
		GameController.toggleFlagEnabled();
		UIController.toggleFlagEnabled();
	}

	const handleSquare = (event) => {
		if (
			isGameOver
			|| !event.target.classList.contains(DOM.squareClass)
			|| event.target.classList.contains(DOM.open)
		) {
			return;
		}

		if (GameController.isFlagEnabled()) {
			toggleFlag(event);
			return;
		}
		if (event.target.classList.contains(DOM.flagIcon)) {
			return;
		}

		const index = UIController.getIndexOfSquare(event.target);

		/** [{index: 1, value: 'b'||0||5}] */
		const squareData = GameController.openSquaresByIndex(index);

		if (!squareData.length) {
			return;
		}

		if (squareData[0].value === 'b' && firstReveal) {
			GameController.init();
			handleSquare(event);
			return;
		}

		firstReveal = false;
		UIController.openSquares(squareData);

		if (squareData[0].value === 'b') {
			isGameOver = true;
			document.dispatchEvent(new Event('gameOver'));
			return;
		}

		document.dispatchEvent(new Event('checkIfWinByOpenedSquares'));
	};
	
	const restart = () => {
		firstReveal = true;
		isGameOver = false;
		GameController.restart();
		UIController.restart();
	};

	const toggleFlag = (event) => {
		event.preventDefault();

		if (
			isGameOver
			|| !event.target.classList.contains(DOM.squareClass)
			|| event.target.classList.contains(DOM.open)
		) {
			return false;
		}

		const index = UIController.getIndexOfSquare(event.target);
		const isFlagAdded = GameController.toggleFlag(index);

		if (isFlagAdded) {
			UIController.putFlag(event.target);
		} else {
			UIController.removeFlag(event.target);
		}

		document.dispatchEvent(new Event('checkIfWinByFlag'));
		return true;
	};

	const checkIfWinByOpenedSquares = () => {
		if (GameController.areAllSafeSquaresOpened()) {
			showWin();
		}
	};

	const checkIfWinByFlag = () => {
		if (GameController.areAllFlagsCorrect() && !firstReveal) {
			showWin();
		}
	};

	const showWin = () => {
		isGameOver = true;
		UIController.showWin(GameController.getBombs());
	};

	const showFlagAndBombValidation = () => {
		UIController.stopStopwatch();
		UIController.showFlagAndBombValidation(GameController.getFlagAndBombValidation());
	};

	return {
		init
	};
})(UI, Game);

document.addEventListener('DOMContentLoaded', function() {
	Controller.init();
});
