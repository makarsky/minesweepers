var rowNumber = 9;
var bombsNumber = 10;

var UI = (function() {
	var DOMstrings = {
		enableFlagBtn: '#enable-flag-btn',
		enabledFlag: 'enabled-flag',
		container: '.container',
		squareClass: 'square',
		flag: 'flag',
		open: 'open',
		bomb: 'bomb',
		open1: 'open1',
		open2: 'open2',
		open3: 'open3',
		open4: 'open4',
		open5: 'open5',
		open6: 'open6',
		open7: 'open7',
		open8: 'open8'
	};

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

		squares = Array.from(document.getElementsByClassName(DOMstrings.squareClass));
	}

	function getIndexOfSquare(squareElement) {
		return squares.indexOf(squareElement);
	}

	function handleSquares(squareData) {
		squareData.forEach(function(el) {
			squares[el.index].classList.add(DOMstrings.open);

			if (el.label > 1 && el.label < 9) {
				squares[el.index].classList.add(DOMstrings['open' . el.label]);
			}
			if (el.label === 'b') {
				squares[el.index].classList.add(DOMstrings.bomb);
			}
		});
	}

	function putFlag(squareElement) {
		squareElement.classList.add(DOMstrings.flag);
	}

	function removeFlag(squareElement) {
		squareElement.classList.remove(DOMstrings.flag);
	}

	return {
		init,
		getIndexOfSquare,
		putFlag,
		removeFlag,
		getDOMstrings: function() {
			return DOMstrings;
		},
		toggleFlagEnabled: function() {
			document.querySelector(DOMstrings.enableFlagBtn).classList.toggle(DOMstrings.enabledFlag);
		}
	};
})();

var Game = (function() {
	var isFlagEnabled = false;
	var squares = [];
	var flags = [];

	function init() {
		for (var i = 0; i < rowNumber; i++) {
			squares[i] = [];

			for (var j = 0; j < rowNumber; j++) {
				squares[i][j] = {value: 0, isOpen: false};
			}
		}

		for (var i = 0; i < bombsNumber; i++) {
			var randomRow = Math.floor(Math.random() * bombsNumber / 2);
			var randomCol = Math.floor(Math.random() * bombsNumber / 2);
			squares[randomRow][randomCol] = 'b';
			incrementNeighbours(randomRow, randomCol);
		}
	}

	function incrementNeighbours(row, col) {
		if (row - 1 >= 0) {
			for (var j = col - 1; j <= col + 1; j++) {
				typeof squares[row - 1][j] === 'number' ? squares[row - 1][j]++ : null;
			}
		}

		typeof squares[row][col - 1] === 'number' ? squares[row][col - 1]++ : null;
		typeof squares[row][col + 1] === 'number' ? squares[row][col + 1]++ : null;

		if (row + 1 < bombsNumber / 2) {
			for (var j = col - 1; j <= col + 1; j++) {
				typeof squares[row + 1][j] === 'number' ? squares[row + 1][j]++ : null;
			}
		}
	}

	function getSquarePositionByIndex(index) {
		var row = Math.floor(index / rowNumber);
		var col = index % rowNumber;

		return {row, col};
	}

	function handleFlag(index) {
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
		console.log(flags);
	}

	function removeFlag(index, row, col) {
		flags = flags.filter(function(el) {return el.index !== index;});
		console.log(flags);
	}

	// restart() {}

	return {
		init,
		putFlag,
		toggleFlagEnabled: function() {
			isFlagEnabled = !isFlagEnabled;
		},
		isFlagEnabled: function() {
			return isFlagEnabled;
		},
		handleFlag
	};
})();

var Controller = (function(UIController, GameController) {
	var DOM = UIController.getDOMstrings();

	function setupEventListeners() {
        document.querySelector(DOM.enableFlagBtn).addEventListener('click', toggleFlagEnabled);
        document.querySelector(DOM.container).addEventListener('click', handleSquare);
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
        if (event.target.classList.contains(DOM.squareClass)) {

        	var index = UIController.getIndexOfSquare(event.target);

        	if (GameController.isFlagEnabled()) {
            	var isFlagAdded = GameController.handleFlag(index);

            	if (isFlagAdded) {
	            	UIController.putFlag(event.target);
	            } else {
            		UIController.removeFlag(event.target);
	            }
        	} else {
        		var squareData = GameController.handleSquare(index);
        		// [{index: 1, label: 'b' / 5}]
        		UIController.handleSquares(squareData);
        	}
        }
    };

	return {
		init
	};
})(UI, Game);

document.addEventListener('DOMContentLoaded', function() {
	Controller.init();
});