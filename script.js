const boardElement = document.querySelector('.board');
const message = document.getElementById('message');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const resetButton = document.getElementById('reset');
const undoButton = document.getElementById('undo');
const themeToggle = document.getElementById('theme-toggle');
const boardSizeSelect = document.getElementById('board-size');
const gameModeSelect = document.getElementById('game-mode');
const playerXInput = document.getElementById('playerX');
const playerOInput = document.getElementById('playerO');

let size = 3;
let board = Array(size * size).fill('');
let currentPlayer = 'X';
let gameActive = true;
let scores = { X: 0, O: 0 };
let moveHistory = [];
let timeLeft = 10;
let timer;
let mode = 'human';

function generateBoard() {
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${size}, 70px)`;
    board = Array(size * size).fill('');
    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', handleCellClick);
        boardElement.appendChild(cell);
    }
}

function getWinningCombinations() {
    const wins = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) row.push(i * size + j);
        wins.push(row);
    }
    for (let i = 0; i < size; i++) {
        const col = [];
        for (let j = 0; j < size; j++) col.push(j * size + i);
        wins.push(col);
    }
    const diag1 = [], diag2 = [];
    for (let i = 0; i < size; i++) {
        diag1.push(i * size + i);
        diag2.push(i * size + (size - 1 - i));
    }
    wins.push(diag1, diag2);
    return wins;
}

function handleCellClick(e) {
    const index = e.target.getAttribute('data-index');
    if (board[index] === '' && gameActive) {
        board[index] = currentPlayer;
        e.target.textContent = currentPlayer;
        e.target.classList.add('clicked');
        moveHistory.push({ index, player: currentPlayer });
        checkWin();
        if (gameActive) {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateMessage();
            resetTimer();
            if (mode !== 'human' && currentPlayer === 'O') {
                mode === 'random' ? randomAIMove() : minimaxAIMove();
            }
        }
    }
}

function checkWin() {
    const winningCombinations = getWinningCombinations();
    for (let combo of winningCombinations) {
        if (combo.every(i => board[i] === currentPlayer)) {
            message.textContent = `${getPlayerName(currentPlayer)} Wins!`;
            scores[currentPlayer]++;
            scoreDisplay.textContent = `${getPlayerName('X')}: ${scores.X} | ${getPlayerName('O')}: ${scores.O}`;
            gameActive = false;
            boardElement.classList.add('win-animation');
            setTimeout(resetGame, 2000);
            clearInterval(timer);
            return;
        }
    }
    if (!board.includes('')) {
        message.textContent = "It's a Draw!";
        gameActive = false;
        setTimeout(resetGame, 2000);
        clearInterval(timer);
    }
}

function randomAIMove() {
    let emptyCells = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
    if (emptyCells.length > 0) {
        let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomIndex] = 'O';
        const cell = document.querySelector(`[data-index="${randomIndex}"]`);
        cell.textContent = 'O';
        cell.classList.add('clicked');
        moveHistory.push({ index: randomIndex, player: 'O' });
        checkWin();
        if (gameActive) {
            currentPlayer = 'X';
            updateMessage();
            resetTimer();
        }
    }
}

function minimaxAIMove() {
    let bestMove = minimax(board, 'O').index;
    board[bestMove] = 'O';
    const cell = document.querySelector(`[data-index="${bestMove}"]`);
    cell.textContent = 'O';
    cell.classList.add('clicked');
    moveHistory.push({ index: bestMove, player: 'O' });
    checkWin();
    if (gameActive) {
        currentPlayer = 'X';
        updateMessage();
        resetTimer();
    }
}

function minimax(newBoard, player) {
    let emptyCells = newBoard.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
    let winner = checkWinner(newBoard);
    if (winner === 'O') return { score: 10 };
    if (winner === 'X') return { score: -10 };
    if (emptyCells.length === 0) return { score: 0 };

    let moves = [];
    for (let i of emptyCells) {
        let move = {};
        move.index = i;
        newBoard[i] = player;
        move.score = player === 'O' ? minimax(newBoard, 'X').score : minimax(newBoard, 'O').score;
        newBoard[i] = '';
        moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
        bestMove = moves.reduce((best, move) => move.score > best.score ? move : best, { score: -Infinity });
    } else {
        bestMove = moves.reduce((best, move) => move.score < best.score ? move : best, { score: Infinity });
    }
    return bestMove;
}

function checkWinner(board) {
    const winningCombinations = getWinningCombinations();
    for (let combo of winningCombinations) {
        if (combo.every(i => board[i] === 'X')) return 'X';
        if (combo.every(i => board[i] === 'O')) return 'O';
    }
    return null;
}

function resetGame() {
    board = Array(size * size).fill('');
    gameActive = true;
    currentPlayer = 'X';
    moveHistory = [];
    boardElement.classList.remove('win-animation');
    updateMessage();
    resetTimer();
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('clicked');
    });
}

function updateMessage() {
    message.textContent = `${getPlayerName(currentPlayer)}'s Turn`;
}

function getPlayerName(player) {
    return player === 'X' ? (playerXInput.value || 'X') : (playerOInput.value || 'O');
}

function startTimer() {
    clearInterval(timer);
    timeLeft = 10;
    timerDisplay.textContent = `Time: ${timeLeft}`;
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Time: ${timeLeft}`;
        if (timeLeft <= 0) {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            resetTimer();
            updateMessage();
            if (mode !== 'human' && currentPlayer === 'O') {
                mode === 'random' ? randomAIMove() : minimaxAIMove();
            }
        }
    }, 1000);
}

function resetTimer() {
    timeLeft = 10;
    timerDisplay.textContent = `Time: ${timeLeft}`;
    clearInterval(timer);
    startTimer();
}

resetButton.addEventListener('click', resetGame);

undoButton.addEventListener('click', () => {
    if (moveHistory.length > 0 && gameActive) {
        const lastMove = moveHistory.pop();
        board[lastMove.index] = '';
        const cell = document.querySelector(`[data-index="${lastMove.index}"]`);
        cell.textContent = '';
        cell.classList.remove('clicked');
        currentPlayer = lastMove.player;
        updateMessage();
        resetTimer();
    }
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? 'Switch to Light Mode' : 'Switch to Dark Mode';
});

boardSizeSelect.addEventListener('change', () => {
    size = parseInt(boardSizeSelect.value);
    generateBoard();
    resetGame();
});

gameModeSelect.addEventListener('change', () => {
    mode = gameModeSelect.value;
    resetGame();
});

// Initial setup
generateBoard();
startTimer();
scoreDisplay.textContent = `${getPlayerName('X')}: ${scores.X} | ${getPlayerName('O')}: ${scores.O}`;