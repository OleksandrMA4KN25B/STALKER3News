// === Полтергейст для всіх сторінок ===

// створюємо елемент
const ghost = document.createElement("div");
ghost.id = "poltergeist";
document.body.appendChild(ghost);

// рандомна позиція в межах екрану
function moveGhostRandom(fast = false) {
    const margin = 80;
    const randX = Math.random() * (window.innerWidth - margin);
    const randY = Math.random() * (window.innerHeight - margin);

    ghost.style.left = randX + "px";
    ghost.style.top = randY + "px";

    if (fast) {
        ghost.classList.add("dash");
        setTimeout(() => ghost.classList.remove("dash"), 250);
    }
}

// тікає коли натискаєш
ghost.addEventListener("click", () => moveGhostRandom(true));

// початковий рух
setTimeout(moveGhostRandom, 800);

// періодичне плавне “літання”
setInterval(moveGhostRandom, 6000);



// Генерація випадкового числа
function rand(min, max) {
    return Math.random() * (max - min) + min;
} // кінець програми





// === ГРА: СПІЙМАЙ АНОМАЛІЮ (Оновлена версія) ===

let orbs = [];
let orbScore = 0;
let orbTimeLeft = 60;
let orbTimerId = null;
let orbGameRunning = false;
let orbIsPaused = false; // Нова змінна для паузи

// Оновлення інтерфейсу
function updateUI() {
    const scoreEl = document.getElementById("orb-score");
    const timerEl = document.getElementById("orb-timer");
    const pauseBtn = document.getElementById("orb-pause");

    if (scoreEl) scoreEl.textContent = orbScore;
    if (timerEl) timerEl.textContent = orbTimeLeft;
    
    // Оновлюємо текст кнопки паузи
    if (pauseBtn) {
        pauseBtn.textContent = orbIsPaused ? "Продовжити" : "Пауза";
    }
}

// Генерація випадкового числа
function rand(min, max) {
    return Math.random() * (max - min) + min;
}

// Функція створення аномалії (З ВЕЛИКОЮ ЗОНОЮ КЛІКУ)
function spawnOrb() {
    const arena = document.getElementById("arena");
    if (!arena) return;

    const orb = document.createElement("div");
    orb.classList.add("orb");

    // === ЗМІНА 1: ВЕЛИКА ЗОНА КЛІКУ ===
    // Робимо елемент великим (60px), але візуально малюємо кульку в центрі через градієнт.
    // Це створює невидиме "поле" навколо кульки, по якому легше влучити.
    orb.style.width = "60px";
    orb.style.height = "60px";
    orb.style.position = "absolute";
    orb.style.cursor = "crosshair";
    orb.style.borderRadius = "50%";
    // Візуальна частина (червоне ядро 15px, решта прозоре):
    orb.style.background = "radial-gradient(circle, rgba(255,50,50,1) 0%, rgba(255,50,50,1) 25%, rgba(0,0,0,0) 30%)";
    
    // Початкова позиція (враховуємо розмір 60px)
    orb.style.left = rand(0, arena.clientWidth - 60) + "px";
    orb.style.top = rand(0, arena.clientHeight - 60) + "px";

    // Швидкість
    orb.dx = rand(-2, 2);
    orb.dy = rand(-2, 2);

    // Клік по кульці
    orb.addEventListener("click", () => {
        // Якщо гра на паузі або не йде – кліки не працюють
        if (!orbGameRunning || orbIsPaused) return;

        if (orb.parentNode === arena) arena.removeChild(orb);
        orbs = orbs.filter(o => o !== orb);

        orbScore++;
        updateUI();
    });

    arena.appendChild(orb);
    orbs.push(orb);
}

// Рух аномалій
function animate() {
    // Якщо гра не йде або НА ПАУЗІ – не рухаємо кульки
    if (!orbGameRunning || orbIsPaused) {
        requestAnimationFrame(animate);
        return;
    }

    const arena = document.getElementById("arena");
    if (!arena) return;

    orbs.forEach(orb => {
        let x = parseFloat(orb.style.left);
        let y = parseFloat(orb.style.top);

        x += orb.dx;
        y += orb.dy;

        // Відбивання від стінок (враховуємо розмір 60px)
        if (x <= 0 || x >= arena.clientWidth - 60) orb.dx *= -1;
        if (y <= 0 || y >= arena.clientHeight - 60) orb.dy *= -1;

        orb.style.left = x + "px";
        orb.style.top = y + "px";
    });

    requestAnimationFrame(animate);
}

// Очистка арени
function clearOrbs() {
    const arena = document.getElementById("arena");
    if (arena) {
        orbs.forEach(orb => arena.removeChild(orb));
    }
    orbs = [];
}

// === КЕРУВАННЯ ГРОЮ ===

function startOrbGame() {
    // Скидаємо все
    clearOrbs();
    orbScore = 0;
    orbTimeLeft = 60;
    orbGameRunning = true;
    orbIsPaused = false;
    
    updateUI();
    toggleButtons(true); // Вмикаємо кнопки керування

    // Таймер
    if (orbTimerId) clearInterval(orbTimerId);
    orbTimerId = setInterval(() => {
        // Якщо пауза – час не йде
        if (orbIsPaused) return;

        orbTimeLeft--;
        updateUI();

        if (orbTimeLeft <= 0) {
            endOrbGame(true); // true означає "час вийшов"
        }
    }, 1000);
}

function stopOrbGame() {
    endOrbGame(false); // false означає "гравець натиснув стоп"
}

function endOrbGame(timeIsUp) {
    orbGameRunning = false;
    orbIsPaused = false;
    
    if (orbTimerId) clearInterval(orbTimerId);
    orbTimerId = null;

    clearOrbs();
    toggleButtons(false); // Вимикаємо ігрові кнопки
    updateUI();

    if (timeIsUp) {
        alert("Час вийшов! Ти зібрав " + orbScore + " аномалій.");
    }
}

function togglePause() {
    if (!orbGameRunning) return;
    orbIsPaused = !orbIsPaused;
    updateUI();
}

// Допоміжна функція для кнопок
function toggleButtons(isPlaying) {
    document.getElementById("orb-start").disabled = isPlaying; // Блокуємо старт, якщо гра йде
    document.getElementById("orb-stop").disabled = !isPlaying;
    document.getElementById("orb-pause").disabled = !isPlaying;
    document.getElementById("orb-manual-spawn").disabled = !isPlaying;
}

// Ініціалізація кнопок
document.addEventListener("DOMContentLoaded", () => {
    // Старт
    document.getElementById("orb-start").addEventListener("click", startOrbGame);
    
    // Стоп
    document.getElementById("orb-stop").addEventListener("click", stopOrbGame);
    
    // Пауза
    document.getElementById("orb-pause").addEventListener("click", togglePause);
    
    // Створити аномалію (Ручний спавн)
    document.getElementById("orb-manual-spawn").addEventListener("click", () => {
        if (orbGameRunning && !orbIsPaused) {
            spawnOrb();
        }
    });
});

// Запускаємо цикл анімації (він чекатиме старту гри)
animate();