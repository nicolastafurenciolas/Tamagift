/* ═══════════════════════════════════════════════════════
   PUSHEEN GAME — whack.js  (Golpea a Nini)
═══════════════════════════════════════════════════════ */

function startWhack(container) {
    container.innerHTML = `
    <div class="mg-header">
      <button class="icon-btn" onclick="closeMinigame()">✕</button>
      <div class="mg-title">¡Golpea a Nini! 🔨</div>
      <div class="mg-score-wrap">
        <span class="mg-score" id="whackScore">0 pts</span>
        <span class="mg-lives" id="whackTimer">60s</span>
      </div>
    </div>
    <div class="whack-arena" id="whackArena">
      <div class="whack-grid" id="whackGrid"></div>
      <div class="whack-overlay hidden" id="whackOverlay">
        <h2>¡Tiempo!</h2>
        <div class="final-score" id="whackFinalScore">0 pts</div>
        <p id="whackFinalMsg">Buen intento</p>
        <button class="btn-primary" onclick="startWhack(document.getElementById('minigameContainer'))">Otra vez</button>
        <button class="btn-secondary" style="margin-top:10px" onclick="closeMinigame()">Salir</button>
      </div>
    </div>
  `;

    const HOLES = 9;
    const GAME_TIME = 60; // seconds

    let score = 0;
    let timeLeft = GAME_TIME;
    let gameActive = true;
    let activeHoles = {}; // holeIdx → {type, timeout}

    // Force overlay hidden via inline style (CSS specificity fix: .whack-overlay{display:flex} would override .hidden{display:none})
    const _whackOverlay = document.getElementById('whackOverlay');
    if (_whackOverlay) _whackOverlay.style.display = 'none';

    // Build the grid
    const grid = document.getElementById('whackGrid');
    for (let i = 0; i < HOLES; i++) {
        const hole = document.createElement('div');
        hole.className = 'whack-hole';
        hole.id = `wh_${i}`;
        hole.innerHTML = `
      <div class="whack-mound"></div>
      <div class="whack-character" id="wc_${i}" style="pointer-events:auto; cursor:pointer;">
        <img id="wi_${i}" src="" alt="" class="whack-char-img" style="pointer-events:none;" />
      </div>
    `;
        // Attach hit listeners to the hole AND the character — captures clicks anywhere
        function makeHitter(idx) {
            return function(e) {
                if (e.type === 'touchend') e.preventDefault();
                hitHole(idx);
            };
        }
        const hitter = makeHitter(i);
        hole.addEventListener('click',    hitter);
        hole.addEventListener('touchend', hitter, { passive: false });
        grid.appendChild(hole);
    }

    // Timer
    const timerEl = document.getElementById('whackTimer');
    const scoreEl = document.getElementById('whackScore');

    const timerInterval = setInterval(() => {
        timeLeft--;
        if (timerEl) timerEl.innerText = timeLeft + 's';
        if (timeLeft <= 0) endWhack();
    }, 1000);

    // Spawn loop
    let spawnLoop = null;
    function scheduleSpawn() {
        if (!gameActive) return;
        // Faster spawn: min 250ms, max 1000ms
        const delay = Math.max(250, 1000 - ((GAME_TIME - timeLeft) * 12));
        spawnLoop = setTimeout(() => {
            spawnCharacter();
            scheduleSpawn();
        }, delay);
    }
    scheduleSpawn();

    function spawnCharacter() {
        if (!gameActive) return;
        // Find empty holes
        const empties = [];
        for (let i = 0; i < HOLES; i++) {
            if (!activeHoles[i]) empties.push(i);
        }
        if (empties.length === 0) return;
        const idx = empties[Math.floor(Math.random() * empties.length)];

        // 35% chance it's Rocco (the good one — do NOT hit), always at least 20% late-game
        const roccoChance = Math.min(0.45, 0.35 + (GAME_TIME - timeLeft) / GAME_TIME * 0.15);
        const isRocco = Math.random() < roccoChance;
        const type = isRocco ? 'rocco' : 'nini';

        const charEl   = document.getElementById(`wc_${idx}`);
        const imgEl    = document.getElementById(`wi_${idx}`);
        const holeEl   = document.getElementById(`wh_${idx}`);

        if (!charEl || !imgEl || !holeEl) return;

        imgEl.src = isRocco
            ? 'assets/images/pusheen-rocco.png'
            : 'assets/images/nini-face.png';

        charEl.classList.remove('hide-char');
        charEl.classList.add('show-char');
        holeEl.classList.add('whack-occupied');
        activeHoles[idx] = { type };

        // Auto-hide faster: min 400ms, max 1200ms
        const visibleMs = Math.max(400, 1200 - ((GAME_TIME - timeLeft) * 14));
        const hideTimeout = setTimeout(() => {
            hideHole(idx, false);
        }, visibleMs);
        activeHoles[idx].hideTimeout = hideTimeout;
    }

    function hideHole(idx, wasHit) {
        if (!activeHoles[idx]) return;
        clearTimeout(activeHoles[idx].hideTimeout);
        delete activeHoles[idx];

        const charEl = document.getElementById(`wc_${idx}`);
        const holeEl = document.getElementById(`wh_${idx}`);
        if (!charEl || !holeEl) return;
        charEl.classList.remove('show-char');
        charEl.classList.add('hide-char');
        holeEl.classList.remove('whack-occupied');
    }

    function hitHole(idx) {
        if (!gameActive) return;
        const entry = activeHoles[idx];
        if (!entry) return; // nothing there

        const type = entry.type;
        hideHole(idx, true);

        const holeEl   = document.getElementById(`wh_${idx}`);
        // Re-query the score element each time so it's never stale
        const scoreDisp = document.getElementById('whackScore');

        if (type === 'nini') {
            score += 10;
            if (scoreDisp) scoreDisp.innerText = score + ' pts';
            showHitFeedback(holeEl, '+10 ✊', 'hit-good');
        } else {
            score = Math.max(0, score - 15);
            if (scoreDisp) scoreDisp.innerText = score + ' pts';
            showHitFeedback(holeEl, '-15 😱', 'hit-bad');
        }
    }

    function showHitFeedback(el, text, cls) {
        const fb = document.createElement('div');
        fb.className = `whack-feedback ${cls}`;
        fb.textContent = text;
        el.appendChild(fb);
        setTimeout(() => fb.remove(), 700);
    }

    function endWhack() {
        gameActive = false;
        clearInterval(timerInterval);
        clearTimeout(spawnLoop);

        // Hide all active characters
        for (const idx of Object.keys(activeHoles)) hideHole(+idx, false);

        // Show overlay using inline style (not classList.remove to avoid CSS specificity conflict)
        const overlay = document.getElementById('whackOverlay');
        const finalScore = document.getElementById('whackFinalScore');
        const finalMsg = document.getElementById('whackFinalMsg');
        if (!overlay) return;
        overlay.style.display = 'flex'; // inline style wins over CSS class rules
        if (finalScore) finalScore.innerText = score + ' pts';

        let msg = 'Buen intento jajaja';
        if (score >= 200) msg = '¡Increíble, eres una máquina golpeando a Nini! 🏆';
        else if (score >= 120) msg = '¡Muy bien! Nini no puede con vos 💪';
        else if (score >= 60) msg = '¡Vamos, puedes hacerlo mejor! 😤';
        if (finalMsg) finalMsg.innerText = msg;

        // Award coins + record
        const coins = Math.floor(score / 10);
        if (coins > 0 && window.addCoins) {
            window.addCoins(coins);
        }

        // Save record
        const prevRecord = parseInt(localStorage.getItem('record_whack') || '0');
        const isNewRecord = score > prevRecord;
        if (isNewRecord) localStorage.setItem('record_whack', score);
        const recordEl = document.getElementById('whackRecord');
        if (finalMsg) finalMsg.innerText = msg + (isNewRecord ? ' 🏆 ¡NUEVO RÉCORD!' : ` (Récord: ${Math.max(score, prevRecord)} pts)`);
    }
}
