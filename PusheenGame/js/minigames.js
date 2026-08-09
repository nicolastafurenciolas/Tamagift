/* ═══════════════════════════════════════════════════════
   PUSHEEN GAME — minigames.js
═══════════════════════════════════════════════════════ */

// --- ROUTING ---
function openMinigame(gameId) {
    document.getElementById('screen-minigame').classList.add('active');
    const container = document.getElementById('minigameContainer');

    // Switch music to match the minigame
    if (window.MusicManager) window.MusicManager.play(gameId);

    switch (gameId) {
        case 'sushi':  startSushiCascade(container); break;
        case 'memory': startMemoryMatch(container);  break;
        case 'battle': startBattleNaval(container);  break;
        case 'quiz':   initQuiz(container);           break;
        case 'puzzle': startPuzzle(container);        break;
        case 'whack':  startWhack(container);         break;
        case 'snake':  startSnake(container);         break;
    }
}

function closeMinigame() {
    document.getElementById('screen-minigame').classList.remove('active');
    document.getElementById('minigameContainer').innerHTML = '';
    if (sushiGameLoop) cancelAnimationFrame(sushiGameLoop);
    // Return to room music
    if (window.MusicManager) window.MusicManager.play('rooms');
}

// ==========================================
// 🍣 MINIGAME: SUSHI CASCADE
// ==========================================
let sushiGameLoop = null;
let _sushiOver = false; // flag accessible by endSushiGame

function startSushiCascade(container) {
    if (sushiGameLoop) { cancelAnimationFrame(sushiGameLoop); sushiGameLoop = null; }
    _sushiOver = false;

    container.innerHTML = `
    <div class="mg-header">
      <button class="icon-btn" onclick="closeMinigame()">✕</button>
      <div class="mg-title">Sushi Cascade 🍣</div>
      <div class="mg-score-wrap">
        <span class="mg-score" id="sushiMgScore">0 pts</span>
        <span class="mg-lives" id="sushiMgLives">❤️❤️❤️</span>
      </div>
    </div>
    <div class="mg-canvas-wrap" id="sushiCanvasWrap">
      <canvas id="sushiCanvas"></canvas>
    </div>
  `;

    const canvas = document.getElementById('sushiCanvas');
    const wrap   = document.getElementById('sushiCanvasWrap');
    const ctx    = canvas.getContext('2d');

    // Fit canvas to wrapper
    function resizeCanvas() {
        const r = wrap.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width  = r.width  * dpr;
        canvas.height = r.height * dpr;
        ctx.scale(dpr, dpr);
        return { w: r.width, h: r.height };
    }
    let { w: W, h: H } = resizeCanvas();

    // --- Images ---
    const imgNormal = new Image(); imgNormal.src = window.getPusheenImage ? window.getPusheenImage('normal') : 'assets/images/pusheen-normal.png';
    const imgHappy  = new Image(); imgHappy.src  = window.getPusheenImage ? window.getPusheenImage('happy') : 'assets/images/pusheen-happy.png';
    const imgAngry  = new Image(); imgAngry.src  = window.getPusheenImage ? window.getPusheenImage('angry') : 'assets/images/pusheen-angry.png';

    // Food images
    const foodImgs = (window.GameData ? window.GameData.FOODS.filter(f => f.type === 'like') : []).map(f => {
        const img = new Image();
        img.src = `assets/images/${f.image}`;
        return img;
    });
    // Fallback: use a colored square if no images
    if (foodImgs.length === 0) {
        const dummy = { complete: true };
        foodImgs.push(dummy);
    }

    // --- Game State ---
    let score      = 0;
    let lives      = 3;
    let sushis     = [];
    let frame      = 0;
    let speedMult  = 1;
    let catState   = 'normal';
    let catTimer   = 0;

    const CAT_W = 70, CAT_H = 70;
    let catX = W / 2 - CAT_W / 2;
    const catY = H - CAT_H - 10;

    // --- Input: track finger / mouse X ---
    let targetX = catX + CAT_W / 2; // where the cat center wants to be

    function setTargetFromEvent(clientX) {
        const rect = wrap.getBoundingClientRect();
        targetX = clientX - rect.left;
    }

    canvas.addEventListener('touchstart',  e => { e.preventDefault(); setTargetFromEvent(e.touches[0].clientX); }, { passive: false });
    canvas.addEventListener('touchmove',   e => { e.preventDefault(); setTargetFromEvent(e.touches[0].clientX); }, { passive: false });
    canvas.addEventListener('mousedown',   e => setTargetFromEvent(e.clientX));
    canvas.addEventListener('mousemove',   e => { if (e.buttons) setTargetFromEvent(e.clientX); });

    // --- Game Loop ---
    function spawnSushi() {
        const x   = Math.random() * (W - 44) + 2;
        const spd = (2.5 + Math.random() * 2.0) * speedMult;  // faster base
        const img = foodImgs[Math.floor(Math.random() * foodImgs.length)];
        sushis.push({ x, y: -40, w: 40, h: 40, img, spd });
    }

    function drawRoundedRect(x, y, w, h, r, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.fill();
    }

    function loop() {
        if (_sushiOver) return;

        // Clear
        ctx.clearRect(0, 0, W, H);

        // Smooth cat movement toward target
        const catCenter = catX + CAT_W / 2;
        const dx = targetX - catCenter;
        catX += dx * 0.18;
        catX = Math.max(0, Math.min(W - CAT_W, catX));

        // Cat expression timer
        if (catTimer > 0) { catTimer--; if (catTimer === 0) catState = 'normal'; }

        // Draw cat
        const img = catState === 'happy' ? imgHappy : catState === 'angry' ? imgAngry : imgNormal;
        const drawY = catState === 'happy' ? catY - 10 : catY;
        if (img.complete && img.naturalWidth) {
            ctx.drawImage(img, catX, drawY, CAT_W, CAT_H);
        } else {
            drawRoundedRect(catX, catY, CAT_W, CAT_H, 12, '#c9b8ff');
        }

        // Spawn: starts fast, gets faster
        frame++;
        const spawnEvery = Math.max(20, Math.floor(65 / speedMult));
        if (frame % spawnEvery === 0) {
            spawnSushi();
            // After score 200 spawn double items periodically
            if (score > 200 && frame % (spawnEvery * 2) === 0) spawnSushi();
        }

        // Speed ramp every 8 seconds @60fps (was every 10)
        if (frame % 480 === 0) speedMult = Math.min(speedMult + 0.35, 5.0);

        // Update sushis
        for (let i = sushis.length - 1; i >= 0; i--) {
            const s = sushis[i];
            s.y += s.spd;

            // Hit box (slightly smaller than sprite for fairness)
            const hit = s.y + s.h > catY + 10 &&
                        s.y < catY + CAT_H &&
                        s.x + s.w > catX + 8 &&
                        s.x < catX + CAT_W - 8;

            if (hit) {
                score += 10;
                document.getElementById('sushiMgScore').innerText = `${score} pts`;
                catState = 'happy'; catTimer = 20;
                sushis.splice(i, 1);
                continue;
            }

            // Missed — fell past bottom
            if (s.y > H + 10) {
                lives--;
                const livesEl = document.getElementById('sushiMgLives');
                if (livesEl) livesEl.innerText = '❤️'.repeat(Math.max(0, lives));
                catState = 'angry'; catTimer = 30;
                sushis.splice(i, 1);
                if (lives <= 0) { endSushiGame(container, score); return; }
                continue;
            }

            // Draw food
            if (s.img && s.img.complete && s.img.naturalWidth) {
                ctx.drawImage(s.img, s.x, s.y, s.w, s.h);
            } else {
                drawRoundedRect(s.x, s.y, s.w, s.h, 8, '#ff9eb5');
            }
        }

        sushiGameLoop = requestAnimationFrame(loop);
    }

    // Small delay so images can start loading before the game starts
    setTimeout(() => { if (!_sushiOver) loop(); }, 150);
}

function endSushiGame(container, score) {
    _sushiOver = true;
    if (sushiGameLoop) { cancelAnimationFrame(sushiGameLoop); sushiGameLoop = null; }

    // Save record
    const prevRecord = parseInt(localStorage.getItem('record_sushi') || '0');
    if (score > prevRecord) {
        localStorage.setItem('record_sushi', score);
        const recEl = document.getElementById('sushiScore');
        if (recEl) recEl.innerText = `${score} pts`;
    }

    // Trophy Unlock: 800+ points
    if (score >= 800 && window.unlockTrophy) {
        window.unlockTrophy('sushi', true);
    }

    // Reward scaling: 1 Roccoin per 10 pts, capped at 80
    const reward = Math.min(80, Math.floor(score / 10));

    container.innerHTML = `
    <div class="mg-result">
      <h2>${score > 0 ? '¡Buen juego!' : '¡Intenta de nuevo!'}</h2>
      <div class="final-score">${score} pts</div>
      <p>Pusheen ${score >= 100 ? 'atrapó montones de sushi 🍣' : 'dejó caer demasiada comida 😿'}</p>
      <div style="margin:16px 0; padding:12px 20px; background:rgba(255,255,255,.08); border-radius:14px; font-size:1.1rem; color:#ffd700; font-weight:800;">
        <img src="assets/images/roccoin.png" style="width:20px; vertical-align:middle; margin-right:5px; border-radius:50%; object-fit:cover;" alt="RC"> +${reward} Roccoins
      </div>
      <button class="btn-primary" onclick="claimCoinsAndClose(${reward})">Recoger y Salir</button>
      <button class="btn-secondary" style="margin-top:12px;" onclick="startSushiCascade(document.getElementById('minigameContainer'))">Jugar de nuevo</button>
    </div>
  `;
}



// ==========================================
// 🃏 MINIGAME: MEMORY MATCH
// ==========================================
function startMemoryMatch(container) {
    const isVWunlocked = localStorage.getItem('pusheen_state') && JSON.parse(localStorage.getItem('pusheen_state')).specialUnlocked;

    // Items matching Sarah's favorites (from JS config)
    const possibleImages = window.GameData_MEMORY.map(item => item.image);

    // Double and shuffle
    let cards = [...possibleImages, ...possibleImages].sort(() => Math.random() - 0.5);

    container.innerHTML = `
    <div class="mg-header">
      <button class="icon-btn" onclick="closeMinigame()">✕</button>
      <div class="mg-title">Memory Match 🃏</div>
      <div class="mg-score-wrap">
        <span class="mg-score" id="memScore">0 pts</span>
        <span class="mg-lives">Rápido ✨</span>
      </div>
    </div>
    ${!isVWunlocked ? `<p style="text-align:center; padding:10px 20px; color:#c9b8ff; font-size:.85rem; background:var(--navy);">Saris, si consigues 500 puntos desbloquearás algo muuuy especial... 👀🎁</p>` : ''}
    <div class="memory-grid" id="memGrid"></div>
  `;

    const grid = document.getElementById('memGrid');
    let flipped = [];
    let matches = 0;
    let score = 0;
    let canFlip = true;
    let startTime = Date.now();

    cards.forEach((imageName, i) => {
        const el = document.createElement('div');
        el.className = 'mem-card';
        el.dataset.id = i;
        el.dataset.image = imageName;
        el.innerHTML = `
      <span class="mem-card-back">❔</span>
      <span class="card-face"><img src="assets/images/${imageName}" style="max-width:80%; max-height:80%; object-fit:contain;"></span>
    `;

        el.onclick = () => {
            if (!canFlip || el.classList.contains('flipped') || el.classList.contains('matched')) return;

            el.classList.add('flipped');
            flipped.push(el);

            if (flipped.length === 2) {
                canFlip = false;
                checkMatch();
            }
        };
        grid.appendChild(el);
    });

    function checkMatch() {
        const [c1, c2] = flipped;
        if (c1.dataset.image === c2.dataset.image) {
            setTimeout(() => {
                c1.classList.add('matched');
                c2.classList.add('matched');

                // Calculate points based on speed
                const elapsed = (Date.now() - startTime) / 1000;
                let p = 100;
                if (elapsed < 20) p = 150;
                if (elapsed > 40) p = 50;
                score += p;
                document.getElementById('memScore').innerText = `${score} pts`;

                matches++;
                flipped = [];
                canFlip = true;

                if (matches === 6) {
                    endMemoryGame(container, score, elapsed);
                }
            }, 500);
        } else {
            setTimeout(() => {
                c1.classList.remove('flipped');
                c2.classList.remove('flipped');
                flipped = [];
                canFlip = true;
            }, 1000);
        }
    }
}

function endMemoryGame(container, score, timeSeconds) {
    let reward = Math.floor(score / 25);
    if (reward > 30) reward = 30; // cap

    // Save record to localStorage
    const prevRecord = parseInt(localStorage.getItem('record_memory') || '0');
    if (score > prevRecord) {
        localStorage.setItem('record_memory', score);
        const recEl = document.getElementById('memoryScore');
        if (recEl) recEl.innerText = `${score} pts`;
    }

    // Trophy Unlock: under 60 seconds
    if (timeSeconds <= 60 && window.unlockTrophy) {
        window.unlockTrophy('memory', true);
    }

    // Special Challenge Check!
    const stateRef = JSON.parse(localStorage.getItem('pusheen_state')) || { specialUnlocked: false };
    let specialMsg = '';

    if (score >= 500 && !stateRef.specialUnlocked) {
        specialMsg = `<div style="color:var(--gold); font-weight:900; margin:10px 0;">¡LOGRASTE EL RETO! 🎁✨</div>`;
        // We trigger the unlock modal after they claim
        reward += 50; // big bonus
    }

    container.innerHTML = `
    <div class="mg-result">
      <h2>¡Mentalmente Superior! 🧠</h2>
      <div class="final-score">${score} pts</div>
      ${specialMsg}
      <div class="vw-item" style="margin:20px 0; border:none; background:rgba(255,255,255,.08);">
        <img src="assets/images/roccoin.png" style="width:20px; vertical-align:middle; margin-right:5px; border-radius:50%; object-fit:cover;" alt="RC"> +${reward} Roccoins
      </div>
      <button class="btn-primary" onclick="claimMemory(${reward}, ${score >= 500 && !stateRef.specialUnlocked})">Recoger Recompensa</button>
    </div>
  `;
}

// Global exposure for reward claiming
window.claimCoinsAndClose = function (amount) {
    if (window.addCoins) window.addCoins(amount);
    closeMinigame();
}

window.claimMemory = function (amount, wonSpecial) {
    if (window.addCoins) window.addCoins(amount);
    closeMinigame();
    if (wonSpecial && window.unlockSpecial) {
        setTimeout(() => {
            window.unlockSpecial();
        }, 500); // short delay after closing minigame
    }
}
