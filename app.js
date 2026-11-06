const player = document.getElementById('player');
const goal = document.getElementById('goal');
const gameArea = document.getElementById('game-area');

const playButton = document.getElementById('play-button');
const timerText = document.getElementById('timer');
const playerSpeedInput = document.getElementById('player-speed');
const taylorSpeedInput = document.getElementById('taylor-speed');
const playerSpeedText = document.getElementById('player-speed-text');
const taylorSpeedText = document.getElementById('taylor-speed-text');
const addTaylorButton = document.getElementById('add-taylor');
const removeTaylorButton = document.getElementById('remove-taylor');
const taylorCountText = document.getElementById('taylor-count');

let playerPosition;
let goalPosition;

// lista de Taylors: cada una tiene su div (el) y su posicion (x, y)
let taylors = [];
let cantidadTaylors = 1;

// lista de bolitas verdes
let balas = [];
const tiempoEntreDisparos = 2000; // milisegundos
const velocidadBala = 3;

let playing = false;
let startTime = 0;
let goalVisible = false;

const keys = {};

window.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

window.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

playerSpeedInput.addEventListener('input', () => {
    playerSpeedText.textContent = playerSpeedInput.value;
});
taylorSpeedInput.addEventListener('input', () => {
    taylorSpeedText.textContent = taylorSpeedInput.value;
});

// Crea una Taylor nueva en el mapa
function crearTaylor() {
    const el = document.createElement('div');
    el.className = 'character taylor';
    gameArea.appendChild(el);

    const maxX = gameArea.clientWidth - el.offsetWidth;
    const maxY = gameArea.clientHeight - el.offsetHeight;
    let x, y;

    if (taylors.length === 0) {
        // la primera Taylor empieza en la esquina inferior derecha
        x = maxX;
        y = maxY;
    } else {
        // las demas salen en un lugar al azar, pero lejos del player
        do {
            x = Math.random() * maxX;
            y = Math.random() * maxY;
        } while (Math.abs(x - playerPosition.x) < 150 && Math.abs(y - playerPosition.y) < 150);
    }

    // ultimoDisparo con algo de azar para que no disparen todas al mismo tiempo
    const t = { el: el, x: x, y: y, ultimoDisparo: Date.now() - Math.random() * tiempoEntreDisparos };
    taylors.push(t);
    el.style.transform = `translate(${x}px, ${y}px)`;
}

addTaylorButton.addEventListener('click', () => {
    cantidadTaylors++;
    taylorCountText.textContent = cantidadTaylors;
    crearTaylor();
});

removeTaylorButton.addEventListener('click', () => {
    if (cantidadTaylors > 1) {
        cantidadTaylors--;
        taylorCountText.textContent = cantidadTaylors;
        taylors.pop().el.remove();
    }
});

function reiniciar() {
    playerPosition = { x: 20, y: 20 };

    // borra las Taylors viejas y crea las nuevas
    taylors.forEach(t => t.el.remove());
    taylors = [];
    for (let i = 0; i < cantidadTaylors; i++) crearTaylor();

    // borra las bolitas
    balas.forEach(b => b.el.remove());
    balas = [];

    goalVisible = false;
    goal.style.display = 'none';
    timerText.textContent = 0;
    actualizarPosiciones();
}

function inicio() {
    reiniciar();
    playing = true;
    startTime = Date.now();
    playButton.textContent = 'Reiniciar';
}

function Final(message) {
    playing = false;
    playButton.textContent = 'Play';
    keys.ArrowUp = keys.ArrowDown = keys.ArrowLeft = keys.ArrowRight = false;
    alert(message);
    reiniciar();
}

playButton.addEventListener('click', () => {
    inicio();
});

function moverPlayer() {
    const speed = Number(playerSpeedInput.value);
    const maxX = gameArea.clientWidth - player.offsetWidth;
    const maxY = gameArea.clientHeight - player.offsetHeight;

    if (keys.ArrowUp) playerPosition.y -= speed;
    if (keys.ArrowDown) playerPosition.y += speed;
    if (keys.ArrowLeft) playerPosition.x -= speed;
    if (keys.ArrowRight) playerPosition.x += speed;

    playerPosition.x = Math.max(0, Math.min(playerPosition.x, maxX));
    playerPosition.y = Math.max(0, Math.min(playerPosition.y, maxY));
}

function moverTaylors() {
    const speed = Number(taylorSpeedInput.value) * 0.5;

    taylors.forEach(t => {
        if (t.x < playerPosition.x) t.x += speed;
        else if (t.x > playerPosition.x) t.x -= speed;

        if (t.y < playerPosition.y) t.y += speed;
        else if (t.y > playerPosition.y) t.y -= speed;
    });
}

function disparar(t) {
    const el = document.createElement('div');
    el.className = 'bala';
    gameArea.appendChild(el);

    const x = t.x + t.el.offsetWidth / 2 - el.offsetWidth / 2;
    const y = t.y + t.el.offsetHeight / 2 - el.offsetHeight / 2;

    const dx = playerPosition.x - x;
    const dy = playerPosition.y - y;
    const distancia = Math.sqrt(dx * dx + dy * dy) || 1;

    balas.push({
        el: el,
        x: x,
        y: y,
        vx: dx / distancia * velocidadBala,
        vy: dy / distancia * velocidadBala,
        rebotes: 0
    });
}

function moverBalas() {
    taylors.forEach(t => {
        if (Date.now() - t.ultimoDisparo > tiempoEntreDisparos) {
            disparar(t);
            t.ultimoDisparo = Date.now();
        }
    });

    balas.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;

        const maxX = gameArea.clientWidth - b.el.offsetWidth;
        const maxY = gameArea.clientHeight - b.el.offsetHeight;

        const tocaLados = b.x < 0 || b.x > maxX;
        const tocaArribaAbajo = b.y < 0 || b.y > maxY;

        if (tocaLados || tocaArribaAbajo) {
           
            if (b.rebotes >= 5) {
                b.borrar = true;
                return;
            }
            b.rebotes++;
        }

        
        if (tocaLados) {
            b.vx = -b.vx;
            b.x = Math.max(0, Math.min(b.x, maxX));
        }

        if (tocaArribaAbajo) {
            b.vy = -b.vy;
            b.y = Math.max(0, Math.min(b.y, maxY));
        }

        b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
    });

    balas = balas.filter(b => {
        if (b.borrar) b.el.remove();
        return !b.borrar;
    });
}

function meta() {
    goal.style.display = 'block';
    goalPosition = {
        x: Math.random() * (gameArea.clientWidth - goal.offsetWidth),
        y: Math.random() * (gameArea.clientHeight - goal.offsetHeight)
    };
    goal.style.transform = `translate(${goalPosition.x}px, ${goalPosition.y}px)`;
    goalVisible = true;
}

function actualizarPosiciones() {
    player.style.transform = `translate(${playerPosition.x}px, ${playerPosition.y}px)`;
    taylors.forEach(t => {
        t.el.style.transform = `translate(${t.x}px, ${t.y}px)`;
    });
}


function colision(squarePosition, square) {

    const centerX = playerPosition.x + player.offsetWidth / 2;
    const centerY = playerPosition.y + player.offsetHeight / 2;

    const closestX = Math.max(squarePosition.x,
        Math.min(centerX, squarePosition.x + square.offsetWidth));
    const closestY = Math.max(squarePosition.y,
        Math.min(centerY, squarePosition.y + square.offsetHeight));

    const dx = centerX - closestX;
    const dy = centerY - closestY;

    return Math.sqrt(dx * dx + dy * dy) < player.offsetWidth / 2;
}

function Ciclojuego() {
    if (playing) {

        const seconds = Math.floor((Date.now() - startTime) / 1000);
        timerText.textContent = seconds;

        if (seconds >= 15 && !goalVisible) meta();

        moverPlayer();
        moverTaylors();
        moverBalas();
        actualizarPosiciones();

        if (taylors.some(t => colision(t, t.el))) {
            Final('Taylor te atrapó!');
        } else if (balas.some(b => colision(b, b.el))) {
            Final('¡Te dio una bolita verde!');
        } else if (goalVisible && colision(goalPosition, goal)) {
            Final('¡Ganaste! Duraste ' + seconds + ' segundos');
        }
    }
    requestAnimationFrame(Ciclojuego);
}

reiniciar();
Ciclojuego();
