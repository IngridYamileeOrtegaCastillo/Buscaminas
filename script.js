let board = [];
let boardSize = { rows: 0, cols: 0 };
let minesCount = 0;
let firstClick = true;
let gameOver = false; // Nueva variable para manejar el estado del juego
let revealedCells = 0; // Contador de celdas reveladas

const startButton = document.getElementById('startButton');
const gameBoard = document.getElementById('gameBoard');
const message = document.getElementById('message');
const difficultySelect = document.getElementById('difficulty');

// Mapa de niveles de dificultad
const difficultyMap = {
    easy: { rows: 5, cols: 5, mines: 5 },
    medium: { rows: 8, cols: 8, mines: 10 },
    hard: { rows: 10, cols: 10, mines: 15 },
    hardcore: { rows: 12, cols: 12, mines: 20 },
    legend: { rows: 15, cols: 15, mines: 30 },
};

// Evento para cambiar el tablero según la dificultad seleccionada
difficultySelect.addEventListener('change', function () {
    const difficulty = this.value;
    if (difficultyMap[difficulty]) {
        const { rows, cols, mines } = difficultyMap[difficulty];
        document.getElementById('rows').value = rows;
        document.getElementById('cols').value = cols;
        document.getElementById('mines').value = mines;
    }
});

startButton.addEventListener('click', startGame);

function startGame() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value);
    minesCount = parseInt(document.getElementById('mines').value);

    // Validación de tamaño mínimo
    if (rows < 5 || cols < 5) {
        alert("El tamaño mínimo del tablero es 5x5.");
        return;
    }

    boardSize = { rows, cols };
    firstClick = true;
    gameOver = false; // Reiniciar el estado de juego al iniciar
    revealedCells = 0; // Reiniciar el contador de celdas reveladas
    board = createBoard(rows, cols, minesCount);
    drawBoard();
    message.innerText = '';
}

function createBoard(rows, cols, mines) {
    const newBoard = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({ revealed: false, mine: false, flagged: false }))
    );
    placeMines(newBoard, mines);
    return newBoard;
}

function placeMines(board, mines) {
    let count = 0;
    while (count < mines) {
        const x = Math.floor(Math.random() * board.length);
        const y = Math.floor(Math.random() * board[0].length);
        if (!board[x][y].mine) {
            board[x][y].mine = true;
            count++;
        }
    }
}

function drawBoard() {
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${boardSize.cols}, 1fr)`;
    board.forEach((row, x) => {
        row.forEach((cell, y) => {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            cellDiv.addEventListener('click', () => handleCellClick(x, y));
            cellDiv.addEventListener('contextmenu', (event) => {
                event.preventDefault(); // Prevenir el menú contextual
                handleCellFlag(x, y);
            });
            gameBoard.appendChild(cellDiv);
        });
    });
}

function handleCellClick(x, y) {
    if (board[x][y].revealed || board[x][y].flagged || gameOver) return; // Comprobar si el juego está bloqueado

    if (firstClick) {
        while (board[x][y].mine) {
            board = createBoard(boardSize.rows, boardSize.cols, minesCount);
        }
        firstClick = false;
    }

    revealCell(x, y);
}

function handleCellFlag(x, y) {
    const cell = board[x][y];
    if (cell.revealed || gameOver) return; // No se puede marcar una celda ya revelada o si el juego está bloqueado

    cell.flagged = !cell.flagged; // Cambiar el estado de la bandera
    const cellDiv = gameBoard.children[x * boardSize.cols + y];

    if (cell.flagged) {
        cellDiv.classList.add('flagged');
        cellDiv.innerText = '🚩'; // Mostrar la bandera
    } else {
        cellDiv.classList.remove('flagged');
        cellDiv.innerText = ''; // Limpiar la bandera
    }
}

function revealCell(x, y) {
    const cell = board[x][y];
    cell.revealed = true;
    revealedCells++; // Incrementar el contador de celdas reveladas

    const cellDiv = gameBoard.children[x * boardSize.cols + y];
    cellDiv.classList.add('revealed');

    if (cell.mine) {
        cellDiv.classList.add('mine');
        gameOver = true; // Bloquear el juego al presionar una mina
        message.innerText = '¡Perdiste! Haz clic en "Iniciar Juego" para volver a intentarlo.';
    } else {
        const surroundingMines = getSurroundingMines(x, y);
        cellDiv.innerText = surroundingMines > 0 ? surroundingMines : '';
        if (surroundingMines === 0) {
            revealSurroundingCells(x, y);
        }
    }

    checkWinCondition(); // Comprobar si el jugador ha ganado
}

function checkWinCondition() {
    const totalCells = boardSize.rows * boardSize.cols; // Total de celdas en el tablero
    const totalNonMineCells = totalCells - minesCount; // Celdas no minadas

    if (revealedCells === totalNonMineCells) {
        gameOver = true; // Bloquear el juego
        message.innerText = '¡Ganaste! Haz clic en "Iniciar Juego" para volver a intentarlo.';
    }
}

function getSurroundingMines(x, y) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    let count = 0;

    directions.forEach(([dx, dy]) => {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newY >= 0 && newX < boardSize.rows && newY < boardSize.cols) {
            if (board[newX][newY].mine) {
                count++;
            }
        }
    });

    return count;
}

function revealSurroundingCells(x, y) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(([dx, dy]) => {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newY >= 0 && newX < boardSize.rows && newY < boardSize.cols) {
            if (!board[newX][newY].revealed) {
                revealCell(newX, newY);
            }
        }
    });
}
