/* ═══════════════════════════════════════════════════════
   PUSHEEN GAME — battleship.js  (Batalla Naval)
═══════════════════════════════════════════════════════ */

// ==========================================
// ⚓ MINIGAME: BATALLA NAVAL (BOSS FIGHT)
// ==========================================

// ─── Tiny sound engine using Web Audio ───
const _bnAudio = (function () {
    let ctx = null;
    function get() { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; }
    function tone(freq, dur, type = 'sine', gain = 0.18) {
        try {
            const c = get();
            const o = c.createOscillator();
            const g = c.createGain();
            o.type = type;
            o.frequency.value = freq;
            g.gain.setValueAtTime(gain, c.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
            o.connect(g); g.connect(c.destination);
            o.start(); o.stop(c.currentTime + dur);
        } catch (e) { }
    }
    return {
        splash: () => tone(200, 0.35, 'sine'),
        hit: () => { tone(80, 0.2, 'sawtooth', 0.3); setTimeout(() => tone(120, 0.3, 'square', 0.2), 80); },
        sink: () => { [100, 80, 60].forEach((f, i) => setTimeout(() => tone(f, 0.3, 'sawtooth', 0.35), i * 120)); },
        victory: () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.3, 'triangle', 0.25), i * 130)),
        defeat: () => [300, 200, 150].forEach((f, i) => setTimeout(() => tone(f, 0.4, 'sine', 0.2), i * 200)),
    };
})();

// Ship colors to distinguish them
const SHIP_COLORS = ['#5b8fff', '#ff7043', '#26de81', '#f7b731', '#a55eea'];

function startBattleNaval(container) {
    const seenIntro = localStorage.getItem('bn_intro_seen');
    if (!seenIntro) {
        localStorage.setItem('bn_intro_seen', '1');
        container.innerHTML = `
        <div class="bn-boss-intro" id="bnBossIntro">
          <div class="bn-boss-emblem">⚓</div>
          <div class="bn-boss-name">NINI — EL INSOPORTABLE</div>
          <div class="bn-boss-subtitle">Ya me cansé de perder,<br>juega con este a ver si le ganas</div>
          <div class="bn-boss-prompt">— Toca para continuar —</div>
        </div>`;
        document.getElementById('bnBossIntro').addEventListener('click', () => {
            container.innerHTML = '';
            initBN(container);
        });
    } else {
        initBN(container);
    }
}

function initBN(container) {
    const SZ = 10;
    const SHIPS = [5, 4, 3, 3, 2, 2]; // 6 ships for a 10x10 board
    const TOTAL = SHIPS.reduce((a, b) => a + b, 0); // 19

    let phase = 'place';
    let placingIdx = 0;
    let placingH = true;

    // pBoard[r][c] = shipIndex+1 (1-5) or 0
    let pBoard, aBoard, pShots, aShots;
    // Track cells per ship for sunk detection
    let pShipCells, aShipCells;  // array of arrays of [r,c] per ship
    let pSunk, aSunk;            // bool per ship

    let pHits = 0, aHits = 0;
    let playerTurn = true;

    // ─── Hard AI state ───
    let aiMode = 'hunt';
    let aiQueue = [];             // cells to target after first hit
    let aiHitLine = [];           // track hits on current ship for direction lock
    let aiDir = null;             // locked direction once 2 hits on same line

    // ─── helpers ───
    function emptyBN() { return Array.from({ length: SZ }, () => Array(SZ).fill(0)); }
    function inBN(r, c) { return r >= 0 && r < SZ && c >= 0 && c < SZ; }
    function canBN(b, r, c, len, h) {
        for (let i = 0; i < len; i++) {
            const nr = h ? r : r + i, nc = h ? c + i : c;
            if (!inBN(nr, nc) || b[nr][nc]) return false;
        }
        return true;
    }
    function placeBN(b, r, c, len, h, val) {
        const cells = [];
        for (let i = 0; i < len; i++) {
            const nr = h ? r : r + i, nc = h ? c + i : c;
            b[nr][nc] = val;
            cells.push([nr, nc]);
        }
        return cells;
    }
    function randomBoardBN() {
        const b = emptyBN();
        const shipCells = [];
        SHIPS.forEach((len, idx) => {
            let ok = false;
            while (!ok) {
                const h = Math.random() < .5, r = Math.floor(Math.random() * SZ), c = Math.floor(Math.random() * SZ);
                if (canBN(b, r, c, len, h)) {
                    shipCells.push(placeBN(b, r, c, len, h, idx + 1));
                    ok = true;
                }
            }
        });
        return { board: b, cells: shipCells };
    }
    function cid(pfx, r, c) { return `${pfx}_${r}_${c}`; }

    // Check if a ship is fully sunk
    function checkSunk(shipIdx, shots) {
        return pShipCells[shipIdx].every(([r, c]) => shots[r][c] === 3);
    }

    // ─── Grid HTML ───
    function gridHTML(pfx, board, shots, shipCells, sunk, clickable) {
        let h = `<div class="bn-grid" id="grid-${pfx}">`;
        for (let r = 0; r < SZ; r++) {
            for (let c = 0; c < SZ; c++) {
                const shot = shots[r][c]; // 0=none, 2=miss, 3=hit
                const shipIdx = board[r][c]; // 0=empty, 1-5=ship index
                const isSunk = shipIdx > 0 && sunk[shipIdx - 1];

                let cls = 'bn-cell';
                let style = '';

                if (pfx === 'player') {
                    if (shipIdx > 0 && !isSunk) {
                        cls += ' bn-ship';
                        style = `background:${SHIP_COLORS[shipIdx - 1]}33;border-color:${SHIP_COLORS[shipIdx - 1]}88;`;
                    }
                }
                // Both grids — show shots
                if (shot === 2) cls += ' bn-miss';
                if (shot === 3) cls += isSunk ? ' bn-sunk' : ' bn-hit';

                const oc = clickable ? `onclick="bnFire(${r},${c})"` : '';
                h += `<div class="${cls}" id="${cid(pfx, r, c)}" ${oc} style="${style}"></div>`;
            }
        }
        return h + '</div>';
    }

    // ─── Turn indicator ───
    function setTurnGlow(isPlayer) {
        const pg = document.getElementById('grid-player');
        const ag = document.getElementById('grid-ai');
        if (!pg || !ag) return;
        // Highlight the ENEMY grid when it's the player's turn (so you know where to click)
        ag.classList.toggle('bn-active-turn', isPlayer);
        pg.classList.toggle('bn-active-turn', !isPlayer);
    }

    // ─── Placement ───
    function renderPlace() {
        const len = SHIPS[placingIdx];
        container.innerHTML = `
        <div class="mg-header">
          <button class="icon-btn" onclick="closeMinigame()">✕</button>
          <div class="mg-title">⚓ Batalla Naval</div>
          <div class="mg-score-wrap">
            <span class="mg-score" style="font-size:.8rem">Barco ${placingIdx + 1}/${SHIPS.length} &bull; ${len} celdas</span>
          </div>
        </div>
        <div class="bn-wrapper">
          <div class="bn-instructions">
            Coloca barco de <b>${len}</b> celdas
            <button class="btn-secondary"
              style="margin-left:8px;padding:3px 12px;font-size:.78rem;"
              onclick="bnFlip()">🔄 ${placingH ? 'Horizontal' : 'Vertical'}</button>
          </div>
          <div class="bn-label">Tu tablero — toca para colocar</div>
          ${gridHTML('player', pBoard, aShots, pShipCells, pSunk, false)}
        </div>`;

        document.getElementById('grid-player').querySelectorAll('.bn-cell').forEach(el => {
            const parts = el.id.split('_');
            const r = +parts[1], c = +parts[2];
            el.addEventListener('mouseenter', () => previewBN(r, c));
            el.addEventListener('mouseleave', () => clearPreviewBN());
            el.addEventListener('click', () => doPlaceBN(r, c));
            el.addEventListener('touchend', e => { e.preventDefault(); doPlaceBN(r, c); }, { passive: false });
        });
    }

    function previewBN(r, c) {
        clearPreviewBN();
        const len = SHIPS[placingIdx];
        const ok = canBN(pBoard, r, c, len, placingH);
        for (let i = 0; i < len; i++) {
            const nr = placingH ? r : r + i, nc = placingH ? c + i : c;
            if (!inBN(nr, nc)) continue;
            const el = document.getElementById(cid('player', nr, nc));
            if (el) { el.classList.add('bn-preview'); if (!ok) el.classList.add('bn-invalid'); }
        }
    }
    function clearPreviewBN() {
        document.querySelectorAll('.bn-preview').forEach(el => el.classList.remove('bn-preview', 'bn-invalid'));
    }

    window.bnFlip = function () { placingH = !placingH; renderPlace(); };
    window.doPlaceBN = function (r, c) {
        if (!canBN(pBoard, r, c, SHIPS[placingIdx], placingH)) return;
        const cells = placeBN(pBoard, r, c, SHIPS[placingIdx], placingH, placingIdx + 1);
        pShipCells[placingIdx] = cells;
        // Re-color placed cells
        cells.forEach(([nr, nc]) => {
            const el = document.getElementById(cid('player', nr, nc));
            if (el) {
                el.classList.add('bn-ship');
                el.style.background = SHIP_COLORS[placingIdx] + '33';
                el.style.borderColor = SHIP_COLORS[placingIdx] + '88';
            }
        });
        placingIdx++;
        if (placingIdx >= SHIPS.length) { phase = 'battle'; renderBattle(); }
        else renderPlace();
    };

    // ─── Battle view ───
    function renderBattle() {
        container.innerHTML = `
        <div class="mg-header">
          <button class="icon-btn" onclick="closeMinigame()">✕</button>
          <div class="mg-title">⚓ Batalla Naval</div>
          <div class="mg-score-wrap">
            <span class="mg-score" id="bnSt" style="font-size:.78rem">Tu turno — dispara a Nini</span>
          </div>
        </div>
        <div class="bn-wrapper">
          <div class="bn-label">Tablero de Nini 🎯</div>
          ${gridHTML('ai', aBoard, pShots, aShipCells, aSunk, true)}
          <div class="bn-separator"></div>
          <div class="bn-label">Tu tablero</div>
          ${gridHTML('player', pBoard, aShots, pShipCells, pSunk, false)}
        </div>`;
        setTurnGlow(true);
    }

    function setSt(txt) { const e = document.getElementById('bnSt'); if (e) e.innerText = txt; }

    // Update a cell's visuals after a shot
    function updateCell(pfx, r, c, hit, sunk) {
        const el = document.getElementById(cid(pfx, r, c));
        if (!el) return;
        el.classList.remove('bn-miss', 'bn-hit', 'bn-sunk');
        el.classList.add(hit ? (sunk ? 'bn-sunk' : 'bn-hit') : 'bn-miss');
        if (pfx === 'ai') el.removeAttribute('onclick');
    }

    // Reveal all cells of a sunk ship on enemy grid
    function revealSunkShip(shipIdx) {
        aShipCells[shipIdx].forEach(([r, c]) => {
            updateCell('ai', r, c, true, true);
        });
        _bnAudio.sink();
    }
    function markPlayerSunk(shipIdx) {
        pShipCells[shipIdx].forEach(([r, c]) => {
            updateCell('player', r, c, true, true);
        });
        _bnAudio.sink();
    }

    // ─── Player fires ───
    window.bnFire = function (r, c) {
        if (phase !== 'battle' || !playerTurn) return;
        if (pShots[r][c]) return;

        const shipIdx = aBoard[r][c] - 1; // -1 if miss
        const hit = shipIdx >= 0;
        pShots[r][c] = hit ? 3 : 2;
        updateCell('ai', r, c, hit, false);

        if (hit) {
            pHits++;
            _bnAudio.hit();
            // check if ship sunk
            const shipSunk = aShipCells[shipIdx].every(([sr, sc]) => pShots[sr][sc] === 3);
            if (shipSunk) {
                aSunk[shipIdx] = true;
                revealSunkShip(shipIdx);
                setSt(`💥 ¡Hundiste un barco de Nini! Sigue disparando`);
            } else {
                setSt('¡Tocado! 💥 Sigue disparando');
            }
            if (pHits >= TOTAL) { endBN(true); return; }
            // Player keeps turn on hit
        } else {
            _bnAudio.splash();
            setSt('Agua... 💧 Turno de Nini');
            playerTurn = false;
            setTurnGlow(false);
            phase = '__waiting__';
            setTimeout(() => { phase = 'battle'; aiFireBN(); }, 1100);
        }
    };

    // ─── AI fires — VERY HARD ───
    // Strategy: full probability density hunt (top 5%) + perfect target mode with direction lock
    function aiFireBN() {
        if (phase !== 'battle') return;
        let r, c;

        if (aiMode === 'target' && aiQueue.length > 0) {
            // Direction-locked targeting: if we have 2 hits in a line, keep going that way
            let picked = false;
            if (aiDir !== null && aiHitLine.length >= 2) {
                const [dr, dc] = aiDir;
                // Try both ends of the hit line
                const sorted = [...aiHitLine].sort((a, b) => a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]);
                const candidates = [
                    [sorted[0][0] - dr, sorted[0][1] - dc],
                    [sorted[sorted.length - 1][0] + dr, sorted[sorted.length - 1][1] + dc]
                ];
                for (const [nr, nc] of candidates) {
                    if (inBN(nr, nc) && !aShots[nr][nc]) {
                        r = nr; c = nc; picked = true; break;
                    }
                }
                // Direction exhausted — try reverse
                if (!picked) {
                    aiDir = [-aiDir[0], -aiDir[1]];
                    for (const [nr, nc] of candidates.reverse()) {
                        if (inBN(nr, nc) && !aShots[nr][nc]) {
                            r = nr; c = nc; picked = true; break;
                        }
                    }
                }
                if (!picked) { aiDir = null; }
            }

            if (!picked) {
                // Regular queue targeting
                do { ([r, c] = aiQueue.shift()); } while (aiQueue.length > 0 && aShots[r][c]);
                if (aShots[r][c]) { aiMode = 'hunt'; aiHitLine = []; aiDir = null; return aiFireBN(); }
            }
        } else {
            aiMode = 'hunt';
            aiHitLine = []; aiDir = null;
            // 30% chance to pick random shot (makes AI beatable ~25% of time)
            const dumb = Math.random() < 0.30;
            if (dumb) {
                const empties = [];
                for (let i = 0; i < SZ; i++) for (let j = 0; j < SZ; j++) if (!aShots[i][j]) empties.push([i, j]);
                if (!empties.length) return;
                [r, c] = empties[Math.floor(Math.random() * empties.length)];
            } else {
                // Probability density map
                const scores = [];
                for (let i = 0; i < SZ; i++) {
                    for (let j = 0; j < SZ; j++) {
                        if (aShots[i][j]) continue;
                        // Strict checkerboard (guarantees we cover every possible ship position)
                        if ((i + j) % 2 !== 0) continue;
                        let s = 10;
                        // Center bias
                        const dist = Math.abs(i - 3.5) + Math.abs(j - 3.5);
                        s += Math.max(0, 4 - dist) * 0.8;
                        scores.push({ r: i, c: j, s });
                    }
                }
                if (!scores.length) {
                    // fallback: any empty cell
                    for (let i = 0; i < SZ; i++) for (let j = 0; j < SZ; j++) if (!aShots[i][j]) scores.push({ r: i, c: j, s: 1 });
                }
                scores.sort((a, b) => b.s - a.s);
                // Pick from top 5% → very consistent
                const topN = Math.max(1, Math.floor(scores.length * 0.05));
                const pick = scores[Math.floor(Math.random() * topN)];
                r = pick.r; c = pick.c;
            }
        }

        const shipIdx = pBoard[r][c] - 1;
        const hit = shipIdx >= 0;
        aShots[r][c] = hit ? 3 : 2;
        updateCell('player', r, c, hit, false);

        if (hit) {
            aHits++;
            _bnAudio.hit();
            aiMode = 'target';
            aiHitLine.push([r, c]);
            // Determine direction if we have 2+ hits
            if (aiHitLine.length === 2) {
                aiDir = [aiHitLine[1][0] - aiHitLine[0][0], aiHitLine[1][1] - aiHitLine[0][1]];
            }
            // Queue adjacent cells
            [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
                const nr = r + dr, nc = c + dc;
                if (inBN(nr, nc) && !aShots[nr][nc]) aiQueue.push([nr, nc]);
            });

            // Check sunk
            const shipSunk = pShipCells[shipIdx].every(([sr, sc]) => aShots[sr][sc] === 3);
            if (shipSunk) {
                pSunk[shipIdx] = true;
                markPlayerSunk(shipIdx);
                // Reset targeting — ship is done
                aiMode = 'hunt'; aiHitLine = []; aiDir = []; aiQueue = [];
                setSt(`💥 Nini hundió uno de tus barcos...`);
            } else {
                setSt('🔥 Nini te pegó... Nini vuelve a disparar');
            }
            if (aHits >= TOTAL) { endBN(false); return; }
            setTimeout(aiFireBN, 950);
        } else {
            _bnAudio.splash();
            if (!aiQueue.length) { aiMode = 'hunt'; aiHitLine = []; aiDir = null; }
            setSt('Nini falló 😅 Tu turno');
            playerTurn = true;
            setTurnGlow(true);
        }
    }

    // ─── End ───
    function endBN(playerWon) {
        phase = 'over';
        const reward = playerWon ? 100 : 20;
        if (playerWon) { _bnAudio.victory(); } else { _bnAudio.defeat(); }

        // Save record
        const prev = parseInt(localStorage.getItem('record_battle') || '0');
        if (playerWon && prev === 0) {
            localStorage.setItem('record_battle', '1');
            const recEl = document.getElementById('battleScore');
            if (recEl) recEl.innerText = '¡VICTORIA! 🏆';
        }

        // Trophy Unlock: Win the game
        if (playerWon && window.unlockTrophy) {
            window.unlockTrophy('battle', true);
        }

        container.innerHTML = `
        <div class="mg-result">
          <div style="font-size:3.5rem;margin-bottom:8px">${playerWon ? '🏆' : '💀'}</div>
          <h2 style="color:${playerWon ? '#ffd700' : '#ff6b8a'}">${playerWon ? '¡Le ganaste a Nini!' : '¡Nini ganó otra vez!'}</h2>
          <p style="color:#c9b8ff;font-size:.9rem;margin:8px 0 0">
            ${playerWon
                ? '"No... no puede ser..." — Nini, destruido'
                : '"¿Viste? Sabía que ganaría." — Nini, insoportable'}
          </p>
          <p style="font-size:.9rem; color:#bbb; margin-bottom:15px;">¡Hundiste la flota de ${ENEMY_NAME}!</p>
        <div style="background:rgba(255,255,255,.08); padding:12px; border-radius:12px; display:inline-block;">
            <img src="assets/images/roccoin.png" style="width:20px; vertical-align:middle; margin-right:5px; border-radius:50%; object-fit:cover;" alt="RC"> +${reward} Roccoins
        </div>
        <div style="margin-top:20px; display:flex; gap:10px; justify-content:center;">
          <button class="btn-primary" onclick="claimBattle(${reward})">Recoger y Salir</button>
          <button class="btn-secondary"
            onclick="initBN(document.getElementById('minigameContainer'))">Revancha ⚓</button>
        </div>`;
    }

    // ─── Init ───
    const { board: ab, cells: ac } = randomBoardBN();
    pBoard = emptyBN(); aBoard = ab;
    pShipCells = SHIPS.map(() => []); aShipCells = ac;
    pSunk = SHIPS.map(() => false); aSunk = SHIPS.map(() => false);
    pShots = emptyBN(); aShots = emptyBN();
    pHits = 0; aHits = 0;
    playerTurn = true;
    aiMode = 'hunt'; aiQueue = []; aiHitLine = []; aiDir = null;
    renderPlace();
}

window.claimBattle = function (amount) {
    if (window.addCoins) window.addCoins(amount);
    closeMinigame();
};
