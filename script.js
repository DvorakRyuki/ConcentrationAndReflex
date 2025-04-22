const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const comboDisplay = document.getElementById('combo');
const accuracyDisplay = document.getElementById('accuracy');
const startButton = document.getElementById('startButton');
const gameMusic = document.getElementById('gameMusic');

// Configuración
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables del juego
let score = 0;
let combo = 0;
let hits = 0;
let totalHits = 0;
let gameActive = false;
let hitObjects = [];
let keysPressed = {};
let gameStartTime = 0;

// Teclas (OSU! usa Z y X por defecto)
const KEY_BINDINGS = {
    'z': 'k1',
    'x': 'k2',
    's': 'start'
};

// Clase HitCircle (igual que antes)
class HitCircle {
    constructor(x, y, time) {
        this.x = x;
        this.y = y;
        this.radius = 50;
        this.time = time;
        this.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
        this.hit = false;
    }

    draw(currentTime) {
        const fadeTime = 500;
        const opacity = Math.min(1, (currentTime - (this.time - fadeTime)) / fadeTime);
        
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    checkHit(x, y, currentTime) {
        if (this.hit) return false;
        const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        const timeDiff = Math.abs(currentTime - this.time);
        
        if (distance <= this.radius && timeDiff < 200) {
            this.hit = true;
            return true;
        }
        return false;
    }
}

// Clase Slider (simplificada para prueba)
class Slider {
    constructor(x, y, time, duration) {
        this.x = x;
        this.y = y;
        this.time = time;
        this.duration = duration;
        this.hit = false;
    }

    draw(currentTime) {
        if (currentTime < this.time - 500 || currentTime > this.time + this.duration) return;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, 40, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
        ctx.fill();
    }
}

// Iniciar juego
startButton.addEventListener('click', startGame);
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

function handleKeyDown(e) {
    keysPressed[e.key] = true;
    if (e.key === 's' && !gameActive) startGame();
    if (!gameActive) return;

    // Detección de golpes con teclas (Z/X)
    if (e.key === 'z' || e.key === 'x') {
        hitObjects.forEach(obj => {
            if (obj instanceof HitCircle && !obj.hit) {
                const currentTime = performance.now() - gameStartTime;
                if (obj.checkHit(canvas.width / 2, canvas.height / 2, currentTime)) {
                    increaseScore(300);
                }
            }
        });
    }
}

function handleKeyUp(e) {
    keysPressed[e.key] = false;
}

function startGame() {
    gameActive = true;
    score = 0;
    combo = 0;
    hits = 0;
    totalHits = 0;
    hitObjects = [];
    gameStartTime = performance.now();
    
    scoreDisplay.textContent = score;
    comboDisplay.textContent = combo;
    accuracyDisplay.textContent = '100%';
    
    // Ejemplo: Generar objetos de prueba
    hitObjects.push(new HitCircle(300, 300, 1000)); // Círculo en (300,300) a los 1s
    hitObjects.push(new Slider(500, 400, 3000, 1000)); // Slider en (500,400) a los 3s
    
    gameMusic.currentTime = 0;
    gameMusic.play().catch(e => console.log("Error al reproducir música:", e));
    gameLoop();
}

function gameLoop() {
    if (!gameActive) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const currentTime = performance.now() - gameStartTime; // Tiempo desde el inicio
    
    // Dibujar objetos
    hitObjects.forEach(obj => {
        obj.draw(currentTime);
    });
    
    requestAnimationFrame(gameLoop);
}

function increaseScore(points) {
    score += points;
    combo += 1;
    hits += 1;
    totalHits += 1;
    scoreDisplay.textContent = score;
    comboDisplay.textContent = combo;
    accuracyDisplay.textContent = `${Math.round((hits / totalHits) * 100)}%`;
}