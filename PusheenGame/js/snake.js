/* ═══════════════════════════════════════════════════════
   PUSHEEN GAME — snake.js  (Pusheen Snake)
═══════════════════════════════════════════════════════ */

function startSnake(container) {
    container.innerHTML = `
    <div class="mg-header">
      <button class="icon-btn" onclick="closeMinigame()">✕</button>
      <div class="mg-title">Pusheen Snake 🐍🍣</div>
      <div class="mg-score-wrap">
        <span class="mg-score" id="snakeScore">0 pts</span>
      </div>
    </div>
    <div class="snake-wrap" id="snakeWrap">
      <canvas id="snakeCanvas"></canvas>
      <div class="snake-overlay hidden" id="snakeOverlay">
        <div class="snake-over-emoji">💀</div>
        <h2 class="snake-over-title">¡Game Over!</h2>
        <div class="final-score" id="snakeFinalScore">0 pts</div>
        <p id="snakeFinalMsg"></p>
        <button class="btn-primary" onclick="startSnake(document.getElementById('minigameContainer'))">Otra vez 🐱</button>
        <button class="btn-secondary" style="margin-top:12px" onclick="closeMinigame()">Salir</button>
      </div>
      <div class="snake-start-hint" id="snakeStartHint">
        <div style="font-size:2rem">🐱</div>
        <div style="font-weight:800;color:white;font-size:1rem;">Desliza o usa las flechas</div>
        <div style="color:#c9b8ff;font-size:.85rem;">para mover a Pusheen</div>
        <button class="btn-primary" style="margin-top:16px" onclick="snakeStartGame()">¡Jugar!</button>
      </div>
    </div>
  `;

    const canvas = document.getElementById('snakeCanvas');
    const wrapEl = document.getElementById('snakeWrap');
    const ctx = canvas.getContext('2d');

    // --- Constants ---
    const CELL = 28;          // px per grid cell
    let COLS = 12, ROWS = 16; // safe defaults until layout resolves
    let W, H;

    function resize() {
        const r = wrapEl.getBoundingClientRect();
        W = r.width  || 336;
        H = r.height || 448;
        COLS = Math.max(8,  Math.floor(W / CELL));
        ROWS = Math.max(10, Math.floor(H / CELL));
        canvas.width  = COLS * CELL;
        canvas.height = ROWS * CELL;
        canvas.style.width  = canvas.width  + 'px';
        canvas.style.height = canvas.height + 'px';
    }

    // Ensure layout is done before sizing (double rAF trick)
    let _snakeReady = false;
    requestAnimationFrame(() => requestAnimationFrame(() => {
        resize();
        initState();
        draw();
        _snakeReady = true;
    }));

    // Force overlay hidden via inline style (CSS specificity fix)
    const _snakeOverlay = document.getElementById('snakeOverlay');
    if (_snakeOverlay) _snakeOverlay.style.display = 'none';

    // --- Images ---
    const imgHead   = new Image(); imgHead.src   = window.getPusheenImage ? window.getPusheenImage('happy') : 'assets/images/pusheen-happy.png';
    const imgNormal = new Image(); imgNormal.src = window.getPusheenImage ? window.getPusheenImage('normal') : 'assets/images/pusheen-normal.png';

    // Load food images from game data
    const foodSrcs = (window.GameData ? window.GameData.FOODS.filter(f => f.type==='like').slice(0,6) : []).map(f => `assets/images/${f.image}`);
    if (foodSrcs.length === 0) foodSrcs.push('assets/images/pusheen-happy.png'); // fallback
    const foodImgs = foodSrcs.map(src => { const i = new Image(); i.src = src; return i; });

    // --- State ---
    let snake, dir, nextDir, food, foodImg, score, loop, speed, running, gameStarted;

    function initState() {
        snake = [
            { x: Math.floor(COLS / 2),     y: Math.floor(ROWS / 2) },
            { x: Math.floor(COLS / 2) - 1, y: Math.floor(ROWS / 2) },
            { x: Math.floor(COLS / 2) - 2, y: Math.floor(ROWS / 2) },
        ];
        dir = { x: 1, y: 0 };
        nextDir = { x: 1, y: 0 };
        score = 0;
        speed = 200;
        running = false;
        gameStarted = false;
        placeFood();
        updateScore();
    }

    function placeFood() {
        let nx, ny;
        let tries = 0;
        do {
            nx = Math.floor(Math.random() * (COLS - 2)) + 1;
            ny = Math.floor(Math.random() * (ROWS - 2)) + 1;
            tries++;
        } while (snake.some(s => s.x === nx && s.y === ny) && tries < 100);
        food = { x: nx, y: ny };
        foodImg = foodImgs[Math.floor(Math.random() * foodImgs.length)];
    }

    function updateScore() {
        const el = document.getElementById('snakeScore');
        if (el) el.innerText = score + ' pts';
    }

    // --- Drawing ---
    function draw() {
        // Background
        ctx.fillStyle = '#0d1530';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid lines (subtle but visible)
        ctx.strokeStyle = 'rgba(150,170,255,0.12)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= COLS; x++) {
            ctx.beginPath();
            ctx.moveTo(x * CELL, 0);
            ctx.lineTo(x * CELL, ROWS * CELL);
            ctx.stroke();
        }
        for (let y = 0; y <= ROWS; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * CELL);
            ctx.lineTo(COLS * CELL, y * CELL);
            ctx.stroke();
        }

        // Border glow (walls)
        const bw = 3;
        ctx.strokeStyle = 'rgba(201,184,255,0.7)';
        ctx.lineWidth = bw;
        ctx.shadowColor = 'rgba(201,184,255,0.9)';
        ctx.shadowBlur = 12;
        ctx.strokeRect(bw/2, bw/2, canvas.width - bw, canvas.height - bw);
        ctx.shadowBlur = 0;

        // Body segments
        snake.forEach((seg, i) => {
            if (i === 0) return; // head drawn separately
            const alpha = Math.max(0.3, 1 - i / (snake.length + 2));
            ctx.fillStyle = `rgba(201,184,255,${alpha})`;
            const pad = 3;
            ctx.beginPath();
            ctx.roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad*2, CELL - pad*2, 6);
            ctx.fill();
        });

        // Head (Pusheen image)
        const head = snake[0];
        const headSize = CELL + 4;
        if (imgHead.complete && imgHead.naturalWidth) {
            ctx.drawImage(imgHead, head.x * CELL - 2, head.y * CELL - 2, headSize, headSize);
        } else {
            ctx.fillStyle = '#c9b8ff';
            ctx.beginPath();
            ctx.roundRect(head.x * CELL + 2, head.y * CELL + 2, CELL - 4, CELL - 4, 8);
            ctx.fill();
        }

        // Food
        const fp = 3;
        if (foodImg && foodImg.complete && foodImg.naturalWidth) {
            ctx.drawImage(foodImg, food.x * CELL + fp, food.y * CELL + fp, CELL - fp*2, CELL - fp*2);
        } else {
            ctx.fillStyle = '#ff9eb5';
            ctx.beginPath();
            ctx.arc(food.x * CELL + CELL/2, food.y * CELL + CELL/2, CELL/2 - 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // --- Game tick ---
    function tick() {
        if (!running) return;

        dir = { ...nextDir };
        const head = snake[0];
        const newHead = { x: head.x + dir.x, y: head.y + dir.y };

        // Wall collision
        if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
            endSnake(); return;
        }
        // Self collision (skip last segment since it will be removed)
        for (let i = 0; i < snake.length - 1; i++) {
            if (snake[i].x === newHead.x && snake[i].y === newHead.y) { endSnake(); return; }
        }

        snake.unshift(newHead);

        // Check food
        if (newHead.x === food.x && newHead.y === food.y) {
            score += 10;
            updateScore();
            placeFood();
            // Speed up slightly
            speed = Math.max(80, speed - 5);
            clearInterval(loop);
            loop = setInterval(tick, speed);
        } else {
            snake.pop();
        }

        draw();
    }

    function endSnake() {
        running = false;
        clearInterval(loop);

        const overlay = document.getElementById('snakeOverlay');
        const finalScore = document.getElementById('snakeFinalScore');
        const finalMsg = document.getElementById('snakeFinalMsg');
        if (overlay) overlay.style.display = 'flex'; // use inline style to override CSS specificity
        if (finalScore) finalScore.innerText = score + ' pts';

        let msg = '¡Pusheencita se estampó!';
        if (score >= 200) msg = '¡Pusheen se comió todo el sushi del restaurante! 🍣👑';
        else if (score >= 100) msg = '¡Muy bien! Pusheen está feliz y llena 🐱✨';
        if (finalMsg) finalMsg.innerText = msg;

        const coins = Math.floor(score / 5);
        if (coins > 0 && window.addCoins) window.addCoins(coins);

        const prev = localStorage.getItem('record_snake') || 0;
        if (score > +prev) localStorage.setItem('record_snake', score);
    }

    // --- Controls: keyboard ---
    function handleKey(e) {
        const map = {
            ArrowUp:    { x:  0, y: -1 },
            ArrowDown:  { x:  0, y:  1 },
            ArrowLeft:  { x: -1, y:  0 },
            ArrowRight: { x:  1, y:  0 },
        };
        const d = map[e.key];
        if (!d) return;
        // No 180° reverse
        if (d.x === -dir.x && d.y === -dir.y) return;
        nextDir = d;
        e.preventDefault();
    }
    document.addEventListener('keydown', handleKey);

    // --- Controls: swipe ---
    let touchStartX = 0, touchStartY = 0;
    function onTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
    function onTouchEnd(e) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        let d;
        if (Math.abs(dx) > Math.abs(dy)) {
            d = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
        } else {
            d = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
        }
        if (d.x === -dir.x && d.y === -dir.y) return;
        nextDir = d;
    }
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchend',   onTouchEnd,   { passive: true });

    // --- Public start ---
    window.snakeStartGame = function() {
        const hint = document.getElementById('snakeStartHint');
        if (hint) hint.style.display = 'none';
        running = true;
        gameStarted = true;
        loop = setInterval(tick, speed);
        draw();
    };

    // --- Cleanup when minigame closed ---
    const origClose = window.closeMinigame;
    window.closeMinigame = function() {
        running = false;
        clearInterval(loop);
        document.removeEventListener('keydown', handleKey);
        window.closeMinigame = origClose;
        origClose();
    };

    // initState() and draw() are called inside the requestAnimationFrame above
    // to ensure the canvas has proper dimensions from the browser layout.
}
