const player = document.getElementById('player');
const taylor = document.getElementById('taylor');
const gameArea = document.getElementById('game-area');

let playerPosition = { x: 100, y: 100 };
let taylorPosition = { x: 300, y: 300 };

const playerSpeed = 40;

window.addEventListener('keydown', (event) => {

    switch (event.key) {

    case 'ArrowUp':
        if (playerPosition.y - playerSpeed >= 0)
            playerPosition.y -= playerSpeed;
        break;

    case 'ArrowDown':
        if (playerPosition.y + playerSpeed <= gameArea.clientHeight - player.offsetHeight)
            playerPosition.y += playerSpeed;
        break;

    case 'ArrowLeft':
        if (playerPosition.x - playerSpeed >= 0)
            playerPosition.x -= playerSpeed;
        break;

    case 'ArrowRight':
        if (playerPosition.x + playerSpeed <= gameArea.clientWidth - player.offsetWidth)
            playerPosition.x += playerSpeed;
        break;
    }

    updatePositions();
});

const taylorSpeed = 1;

function moveTaylor() {
    if (taylorPosition.x < playerPosition.x) {
        taylorPosition.x += taylorSpeed;
    } else if (taylorPosition.x > playerPosition.x) {
        taylorPosition.x -= taylorSpeed;
    }

    if (taylorPosition.y < playerPosition.y) {
        taylorPosition.y += taylorSpeed;
    } else if (taylorPosition.y > playerPosition.y) {
        taylorPosition.y -= taylorSpeed;
    }

    updatePositions();
    checkCollision();
}

function updatePositions() {
    player.style.transform = `translate(${playerPosition.x}px, ${playerPosition.y}px)`;
    taylor.style.transform = `translate(${taylorPosition.x}px, ${taylorPosition.y}px)`;
}

function checkCollision() {

    // estos cambios fueron hechos pensando en que decidimos que el jugador es un circulo y el area de colision sea mas exacta :)
    // esto obtiene el centro del jugador
    const centerX = playerPosition.x + player.offsetWidth / 2;
    const centerY = playerPosition.y + player.offsetHeight / 2;

    // aqui busca el punto de Taylor más cercano al jugador
    const closestX = Math.max(taylorPosition.x,
        Math.min(centerX, taylorPosition.x + taylor.offsetWidth));

    const closestY = Math.max(taylorPosition.y,
        Math.min(centerY, taylorPosition.y + taylor.offsetHeight));

    // esto calcula la distancia horizontal y vertical entre ambos
    const dx = centerX - closestX;
    const dy = centerY - closestY;

    // esto calcula la distancia total entre los personajes
    const distance = Math.sqrt(dx * dx + dy * dy);

    // esto comprueba si el jugador está tocando a Taylor
    if (distance < player.offsetWidth / 2) {

        alert('Taylor te atrapó!');

        // y aqui finalmente reinicia las posiciones de los personajes
        playerPosition = { x: 100, y: 100 };
        taylorPosition = { x: 300, y: 300 };

    }
}

function gameLoop() {
    moveTaylor();
    requestAnimationFrame(gameLoop);
}

gameLoop();