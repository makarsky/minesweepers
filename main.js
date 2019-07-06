"use strict";
var rowNumber = 9;
var bombsNumber = 10;

var UI = (function() {
	var DOMstrings = {
		enableFlagBtn: '#enable-flag-btn',
		flagIcon: 'flag-icon',
		restartBtn: '#restart-btn',
		container: '.container',
		disabled: 'disabled',
		squareClass: 'square',
		flag: 'flag',
		bomb: 'square--bomb',
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
		emoji: 'emoji',
		emojiSmileId: 'emoji-smile',
		emojiCoolId: 'emoji-cool',
		emojiOId: 'emoji-o',
		emojiSadId: 'emoji-sad',
		hidden: 'hidden'
	};

	var emojis = null
	var squares = null;

	function init() {
		var container = document.querySelector(DOMstrings.container);
		var numberOfSquares = rowNumber * rowNumber;

		for (var i = 0; i < numberOfSquares; i++) {
			var square = document.createElement('div');
			square.classList.add(DOMstrings.squareClass);
			container.appendChild(square);
			(i + 1) % Math.sqrt(numberOfSquares) === 0 ? container.innerHTML += '<br>' : null;
		}

		squares = Array.from(container.querySelectorAll('.' + DOMstrings.squareClass));
		emojis = Array.from(document.getElementsByClassName(DOMstrings.emoji));
	}

	function getIndexOfSquare(squareElement) {
		return squares.indexOf(squareElement);
	}

	function openSquares(squareData) {
		squareData.forEach(function(square) {
			squares[square.index].classList.add(DOMstrings.open);

			if (typeof (square.value) === 'number' && square.value > 0) {
				squares[square.index].classList.add(DOMstrings['open' + square.value]);
				squares[square.index].textContent = square.value;
			} else if (square.value === 'b') {
				squares[square.index].classList.add(DOMstrings.bomb);
				squares[square.index].textContent = square.value;
				document.querySelector(DOMstrings.container).classList.add(DOMstrings.disabled);
				showEmojiSad();
			}
		});
	}

	function showWin() {
		document.querySelector(DOMstrings.container).classList.add(DOMstrings.disabled);
		showEmojiCool()
	}

	function putFlag(squareElement) {
		squareElement.classList.add(DOMstrings.flag);
	}

	function removeFlag(squareElement) {
		squareElement.classList.remove(DOMstrings.flag);
	}

	function restart() {
		squares.forEach(function(square) {
			square.textContent = '';
			Array.from(square.classList).forEach(function(className) {
				square.classList.remove(className);
			});
			square.classList.add(DOMstrings.squareClass);
		});
		document.querySelector(DOMstrings.container).classList.remove(DOMstrings.disabled)
		showEmojiSmile();
	}

	function hideEmojis() {
		emojis.forEach(function(emoji) {
			emoji.classList.add(DOMstrings.hidden);
		});
	}

	function toggleEmojiO() {
		document.getElementById(DOMstrings.emojiOId).classList.toggle(DOMstrings.hidden);
		document.getElementById(DOMstrings.emojiSmileId).classList.toggle(DOMstrings.hidden);
	}

	function showEmojiSad(restart) {
		hideEmojis();
		document.getElementById(DOMstrings.emojiSadId).classList.remove(DOMstrings.hidden);
	}

	function showEmojiCool() {
		hideEmojis();
		document.getElementById(DOMstrings.emojiCoolId).classList.remove(DOMstrings.hidden);
	}

	function showEmojiSmile() {
		hideEmojis();
		document.getElementById(DOMstrings.emojiSmileId).classList.remove(DOMstrings.hidden);
	}

	return {
		init,
		getIndexOfSquare,
		putFlag,
		removeFlag,
		openSquares,
		getDOMstrings: function() {
			return DOMstrings;
		},
		toggleFlagEnabled: function() {
			document.querySelector(DOMstrings.enableFlagBtn).classList.toggle(DOMstrings.open);
		},
		restart,
		toggleEmojiO,
		showWin
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
		flags.push({index, row, col});
	}

	function removeFlag(index) {
		flags = flags.filter(function(el) {return el.index !== index;});
	}

	function handleSquare(index) {
		return openSquaresByIndex(index);
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

		if (square.value === 'b' || square.value !== 0) {
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

	function areAllSafeSquaresOpened() {
		var numberOfOpened = 0;
		squares.forEach(function(row) {
			numberOfOpened += row.filter(function(square) {
				return square.isOpen;
			}).length;
		});
		
		return (rowNumber * rowNumber - numberOfOpened) === bombsNumber;
	}

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
		handleSquare,
		restart,
		areAllSafeSquaresOpened
	};
})();


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var Controller = (function(UIController, GameController) {
	var DOM = UIController.getDOMstrings();

	function setupEventListeners() {
        document.querySelector(DOM.enableFlagBtn).addEventListener('click', toggleFlagEnabled);
		// document.querySelector(DOM.container).addEventListener('click', handleSquare);
		setupTapAndHold();
		document.querySelector(DOM.container).addEventListener('contextmenu', toggleFlag);
		document.querySelector(DOM.restartBtn).addEventListener('click', restart);
		document.addEventListener('checkIfWin', checkIfWin);
	}

	function setupTapAndHold() {
		var holdStart;
		document.querySelector(DOM.container).addEventListener('mousedown', function(e) {
			if (e.button === 0) {
				holdStart = new Date();
				UIController.toggleEmojiO();
			}
		});
		document.querySelector(DOM.container).addEventListener('mouseup', function(e) {
			if (e.button === 0) {
				var diff = new Date() - holdStart;
				UIController.toggleEmojiO();
				diff > 300 ? toggleFlag(e) : handleSquare(e);
			}
		});
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

	function handleSquare(event) {
        if (!event.target.classList.contains(DOM.squareClass)) {
			return;
		}

		if (GameController.isFlagEnabled()) {
			toggleFlag(event);
			return;
		}

		var index = UIController.getIndexOfSquare(event.target);

		/** [{index: 1, value: 'b'||0||5}] */
		var squareData = GameController.handleSquare(index);

		var event = new Event('checkIfWin');
		document.dispatchEvent(event);

		if (squareData) {
			UIController.openSquares(squareData);
		}
	};
	
	function restart() {
		GameController.restart();
		UIController.restart();
	}

	function toggleFlag(event) {
		event.preventDefault();

		if (!event.target.classList.contains(DOM.squareClass) || event.target.classList.contains(DOM.open)) {
			return;
		}
		
		var index = UIController.getIndexOfSquare(event.target);
		var isFlagAdded = GameController.toggleFlag(index);

		if (isFlagAdded) {
			UIController.putFlag(event.target);
		} else {
			UIController.removeFlag(event.target);
		}
	}

	function checkIfWin() {
		if (GameController.areAllSafeSquaresOpened()) {
			UIController.showWin();
		}
	}

	return {
		init
	};
})(UI, Game);

document.addEventListener('DOMContentLoaded', function() {
	Controller.init();
});