class Tetris {
    constructor() {
        this.canvas = document.getElementById('tetris');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-piece-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.boardWidth = 10;
        this.boardHeight = 20;
        this.blockSize = 30;
        
        this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isPaused = false;
        this.gameRunning = false;
        
        this.colors = [
            '#000000', // Пустая клетка
            '#FF0D72', // I
            '#0DC2FF', // J
            '#0DFF72', // L
            '#F538FF', // O
            '#FF8E0D', // S
            '#FFE138', // T
            '#3877FF'  // Z
        ];
        
        this.pieces = [
            { shape: [[1,1,1,1]], color: 1 }, // I
            { shape: [[2,0,0],[2,2,2]], color: 2 }, // J
            { shape: [[0,0,3],[3,3,3]], color: 3 }, // L
            { shape: [[4,4],[4,4]], color: 4 }, // O
            { shape: [[0,5,5],[5,5,0]], color: 5 }, // S
            { shape: [[0,6,0],[6,6,6]], color: 6 }, // T
            { shape: [[7,7,0],[0,7,7]], color: 7 }  // Z
        ];
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        this.spawnPiece();
        this.draw();
        this.updateScore();
    }
    
    spawnPiece() {
        if (this.nextPiece) {
            this.currentPiece = this.nextPiece;
        } else {
            this.currentPiece = this.randomPiece();
        }
        this.nextPiece = this.randomPiece();
        this.drawNextPiece();
        
        // Начальная позиция
        this.currentPiece.x = Math.floor(this.boardWidth / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.currentPiece.y = 0;
        
        // Проверка на game over
        if (this.checkCollision()) {
            this.gameOver = true;
            this.gameRunning = false;
            this.gameOverScreen();
        }
    }
    
    randomPiece() {
        const piece = JSON.parse(JSON.stringify(this.pieces[Math.floor(Math.random() * this.pieces.length)]));
        piece.x = 0;
        piece.y = 0;
        return piece;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем доску
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                this.drawBlock(x, y, this.board[y][x]);
            }
        }
        
        // Рисуем текущую фигуру
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.drawBlock(
                            this.currentPiece.x + x,
                            this.currentPiece.y + y,
                            this.currentPiece.color
                        );
                    }
                }
            }
        }
    }
    
    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const offsetX = (this.nextCanvas.width / 2 - (this.nextPiece.shape[0].length * 15) / 2) / 15;
            const offsetY = (this.nextCanvas.height / 2 - (this.nextPiece.shape.length * 15) / 2) / 15;
            
            for (let y = 0; y < this.nextPiece.shape.length; y++) {
                for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        this.drawNextBlock(
                            offsetX + x,
                            offsetY + y,
                            this.nextPiece.color
                        );
                    }
                }
            }
        }
    }
    
    drawBlock(x, y, color) {
        this.ctx.fillStyle = this.colors[color];
        this.ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
        this.ctx.strokeStyle = '#333';
        this.ctx.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
    }
    
    drawNextBlock(x, y, color) {
        this.nextCtx.fillStyle = this.colors[color];
        this.nextCtx.fillRect(x * 15, y * 15, 15, 15);
        this.nextCtx.strokeStyle = '#333';
        this.nextCtx.strokeRect(x * 15, y * 15, 15, 15);
    }
    
    move(dx, dy) {
        if (this.gameOver || this.isPaused || !this.gameRunning) return false;
        
        this.currentPiece.x += dx;
        this.currentPiece.y += dy;
        
        if (this.checkCollision()) {
            this.currentPiece.x -= dx;
            this.currentPiece.y -= dy;
            
            if (dy > 0) {
                this.lockPiece();
                this.clearLines();
                this.spawnPiece();
            }
            return false;
        }
        
        this.draw();
        return true;
    }
    
    // Методы для мобильного управления
    moveLeft() {
        this.move(-1, 0);
    }
    
    moveRight() {
        this.move(1, 0);
    }
    
    moveDown() {
        this.move(0, 1);
    }
    
    drop() {
        if (this.gameOver || this.isPaused || !this.gameRunning) return;
        while (this.move(0, 1)) {}
    }
    
    rotate() {
        if (this.gameOver || this.isPaused || !this.gameRunning) return;
        
        const originalShape = this.currentPiece.shape;
        // Транспонирование матрицы
        const rotated = originalShape[0].map((_, index) =>
            originalShape.map(row => row[index])
        ).map(row => row.reverse());
        
        const originalRotation = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (this.checkCollision()) {
            this.currentPiece.shape = originalRotation;
        }
        
        this.draw();
    }
    
    checkCollision() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const newX = this.currentPiece.x + x;
                    const newY = this.currentPiece.y + y;
                    
                    if (newX < 0 || newX >= this.boardWidth || 
                        newY >= this.boardHeight ||
                        (newY >= 0 && this.board[newY][newX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    lockPiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    if (boardY >= 0) {
                        this.board[boardY][this.currentPiece.x + x] = this.currentPiece.color;
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.boardHeight - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.boardWidth).fill(0));
                linesCleared++;
                y++; // Проверить ту же строку снова
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.updateScore();
        }
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
    
    gameOverScreen() {
        alert(`ИГРА ОКОНЧЕНА!\nФинальный счет: ${this.score}\nУровень: ${this.level}\nЛинии: ${this.lines}`);
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move(0, 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.rotate();
                    break;
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
            }
        });
        
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });
        
        // Предотвращаем скроллинг страницы при использовании стрелок
        window.addEventListener('keydown', function(e) {
            if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code) > -1) {
                e.preventDefault();
            }
        }, false);
    }
    
    startGame() {
        if (this.gameRunning && !this.isPaused) return;
        
        this.gameRunning = true;
        this.isPaused = false;
        document.getElementById('pause-btn').textContent = 'Пауза';
        
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        
        const speed = 1000 - (this.level - 1) * 100;
        
        this.gameInterval = setInterval(() => {
            if (!this.isPaused && !this.gameOver && this.gameRunning) {
                this.move(0, 1);
            }
        }, Math.max(100, speed));
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.isPaused = !this.isPaused;
        document.getElementById('pause-btn').textContent = this.isPaused ? 'Продолжить' : 'Пауза';
    }
    
    resetGame() {
        // Очищаем интервал
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        
        // Сбрасываем игровое состояние
        this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isPaused = false;
        this.gameRunning = false;
        
        document.getElementById('pause-btn').textContent = 'Пауза';
        
        // Переинициализируем игру
        this.init();
    }
}

// Запуск игры когда страница загружена
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Tetris();
});