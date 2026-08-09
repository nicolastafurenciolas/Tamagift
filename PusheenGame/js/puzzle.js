/* ═══════════════════════════════════════════════════════
   PUSHEEN GAME — puzzle.js (Sliding Puzzle)
═══════════════════════════════════════════════════════ */

function startPuzzle(container) {
    if (!window.GameData || !window.GameData.PUZZLES || window.GameData.PUZZLES.length === 0) {
        container.innerHTML = `
            <div class="mg-header">
                <button class="icon-btn" onclick="closeMinigame()">✕</button>
                <div class="mg-title">Rompecabezas</div>
            </div>
            <div style="padding: 20px; text-align:center; color:white;">
                <p>No hay imágenes configuradas para el rompecabezas.</p>
                <p>Configura imágenes en <code>assets/data/puzzle.js</code></p>
            </div>
        `;
        return;
    }

    // Show puzzle selector
    let selHTML = `
        <div class="mg-header">
            <button class="icon-btn" onclick="closeMinigame()">✕</button>
            <div class="mg-title">Elige un Rompecabezas</div>
        </div>
        <div class="puzzle-selector" style="padding:16px; display:flex; flex-direction:column; gap:12px; overflow-y:auto; flex:1;">
    `;

    window.GameData.PUZZLES.forEach((p, idx) => {
        selHTML += `
            <div class="game-card" onclick="selectPuzzleDifficulty('${p.id}')">
                <div class="game-card-icon" style="overflow:hidden; padding:0;">
                    <img src="assets/images/${p.image}" alt="Img" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/images/pusheen-normal.png'"/>
                </div>
                <div class="game-card-info">
                    <div class="game-card-name">${p.name}</div>
                    <div class="game-card-desc">${p.desc}</div>
                    <div class="game-card-reward">Recompensas y Trofeos 🏆</div>
                </div>
            </div>
        `;
    });

    selHTML += `</div>`;
    container.innerHTML = selHTML;

    window.selectPuzzleDifficulty = function(puzzleId) {
        container.innerHTML = `
            <div class="mg-header">
                <button class="icon-btn" onclick="startPuzzle(document.getElementById('minigameContainer'))">←</button>
                <div class="mg-title">Dificultad</div>
            </div>
            <div style="padding:16px; display:flex; flex-direction:column; gap:12px; flex:1;" id="diffSelectorCont">
                <!-- Injected via JS -->
            </div>
        `;

        const diffCont = document.getElementById('diffSelectorCont');
        
        // Read completions for this image
        const saved = JSON.parse(localStorage.getItem('pusheen_state') || '{}');
        const completions = saved.puzzleCompletions || {};
        const pComps = completions[puzzleId] || [];

        const diffs = [
            { level: 3, name: "3x3 (Fácil)", reward: 30, color: "#1368ce" },
            { level: 4, name: "4x4 (Medio)", reward: 60, color: "#d89e00" },
            { level: 5, name: "5x5 (Difícil)", reward: 100, color: "#e21b3c" }
        ];

        let html = '';
        diffs.forEach(d => {
            const done = pComps.includes(d.level);
            html += `
                <div class="game-card" onclick="initPuzzleGame('${puzzleId}', ${d.level}, ${d.reward})" style="border-left: 4px solid ${d.color};">
                    <div class="game-card-icon" style="background:${d.color}; color:white;">${d.level}x${d.level}</div>
                    <div class="game-card-info">
                        <div class="game-card-name">${d.name} ${done ? '✅' : ''}</div>
                        <div class="game-card-reward">Gana <b>${d.reward} Roccoins</b></div>
                    </div>
                </div>
            `;
        });

        // Add note about master trophy
        html += `
            <div style="margin-top:20px; padding:12px; background:rgba(255,255,255,0.05); border-radius:10px; text-align:center;">
                <p style="color:#ffd700; font-size:0.9rem; margin-bottom:5px;">🏆 Trofeo Maestro 🏆</p>
                <p style="color:#c9b8ff; font-size:0.8rem;">Completa las 3 dificultades para desbloquear un trofeo especial en tu estantería.</p>
            </div>
        `;

        diffCont.innerHTML = html;
    };


    window.initPuzzleGame = function(puzzleId, gridSize, rewardAmount) {
        const puzzleData = window.GameData.PUZZLES.find(p => p.id === puzzleId);
        if (!puzzleData) return;

        // Configuration
        const SZ = gridSize;
        const TILE_COUNT = SZ * SZ;
        let pstate = [];
        let emptyPos = TILE_COUNT - 1; // last tile is empty
        let isSolved = false;
        let moves = 0;
        let timerInt;

        function forceSolvable(arr) {
            let inversions = 0;
            for (let i = 0; i < TILE_COUNT - 1; i++) {
                if (arr[i] === TILE_COUNT - 1) continue;
                for (let j = i + 1; j < TILE_COUNT; j++) {
                    if (arr[j] === TILE_COUNT - 1) continue;
                    if (arr[i] > arr[j]) inversions++;
                }
            }

            const blankIdx = arr.indexOf(TILE_COUNT - 1);
            const blankRowFromBottom = SZ - Math.floor(blankIdx / SZ);

            let isSolvable = false;
            if (SZ % 2 !== 0) {
                // Odd grid: solvable if inversions is even
                isSolvable = (inversions % 2 === 0);
            } else {
                // Even grid: solvable if (blankRowFromBottom is even AND inversions is odd) OR (blankRowFromBottom is odd AND inversions is even)
                if (blankRowFromBottom % 2 === 0) {
                    isSolvable = (inversions % 2 !== 0);
                } else {
                    isSolvable = (inversions % 2 === 0);
                }
            }

            if (!isSolvable) {
                // Swap first two non-blank tiles to change inversion parity
                let first = -1, second = -1;
                for (let i = 0; i < TILE_COUNT; i++) {
                    if (arr[i] !== TILE_COUNT - 1) {
                        if (first === -1) first = i;
                        else if (second === -1) { second = i; break; }
                    }
                }
                [arr[first], arr[second]] = [arr[second], arr[first]];
            }
        }

        function shuffle() {
            let arr;
            do {
                arr = [...Array(TILE_COUNT).keys()];
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
            } while (isWin(arr));
            
            forceSolvable(arr);
            pstate = arr;
            emptyPos = arr.indexOf(TILE_COUNT - 1);
        }

        function isWin(arr) {
            for (let i = 0; i < arr.length - 1; i++) {
                if (arr[i] !== i) return false;
            }
            return true;
        }

        function renderGrid() {
            const grid = document.getElementById('puzzleGrid');
            if(!grid) return;
            grid.innerHTML = '';

            // Update grid template columns dynamically
            grid.style.gridTemplateColumns = `repeat(${SZ}, 1fr)`;
            grid.style.gridTemplateRows = `repeat(${SZ}, 1fr)`;
            
            pstate.forEach((tileIdx, posIdx) => {
                const el = document.createElement('div');
                if (tileIdx === TILE_COUNT - 1) {
                    el.className = 'puzzle-piece empty';
                } else {
                    el.className = 'puzzle-piece';
                    el.style.backgroundImage = `url('assets/images/${puzzleData.image}')`;
                    el.style.backgroundSize = `${SZ * 100}% ${SZ * 100}%`;
                    
                    // calculate background position
                    const r = Math.floor(tileIdx / SZ);
                    const c = tileIdx % SZ;
                    el.style.backgroundPosition = `${(c / (SZ - 1)) * 100}% ${(r / (SZ - 1)) * 100}%`;
                }

                // Interaction
                el.onclick = () => {
                    if (isSolved) return;
                    attemptMove(posIdx);
                };
                grid.appendChild(el);
            });
        }

        function attemptMove(posIdx) {
            const r = Math.floor(posIdx / SZ);
            const c = posIdx % SZ;
            const er = Math.floor(emptyPos / SZ);
            const ec = emptyPos % SZ;

            // Check if adjacent (manhattan distance === 1)
            if (Math.abs(r - er) + Math.abs(c - ec) === 1) {
                // Swap
                pstate[emptyPos] = pstate[posIdx];
                pstate[posIdx] = TILE_COUNT - 1;
                emptyPos = posIdx;
                moves++;
                document.getElementById('puzzleMoves').innerText = String(moves);

                renderGrid();

                // Check win
                if (isWin(pstate)) {
                    isSolved = true;
                    clearInterval(timerInt);
                    showWin();
                }
            }
        }

        function showWin() {
            document.getElementById('puzzleGrid').innerHTML = `
                <div style="width:100%; height:100%; border-radius:12px; overflow:hidden; border:4px solid #ffd700; animation: fadeIn 1s;">
                    <img src="assets/images/${puzzleData.image}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/images/pusheen-normal.png'">
                </div>
            `;

            setTimeout(() => {
                // Tracking completions
                const saved = JSON.parse(localStorage.getItem('pusheen_state') || '{}');
                if (!saved.puzzleCompletions) saved.puzzleCompletions = {};
                if (!saved.puzzleCompletions[puzzleId]) saved.puzzleCompletions[puzzleId] = [];
                
                if (!saved.puzzleCompletions[puzzleId].includes(SZ)) {
                    saved.puzzleCompletions[puzzleId].push(SZ);
                    localStorage.setItem('pusheen_state', JSON.stringify(saved));
                }

                // Check Master Trophy (3, 4, and 5 completed for this image)
                const pComps = saved.puzzleCompletions[puzzleId];
                const gotMaster = pComps.includes(3) && pComps.includes(4) && pComps.includes(5);

                if (window.unlockTrophy) {
                    // Unlock the base puzzle trophy just for completing ANY puzzle
                    window.unlockTrophy('puzzle', true);
                    
                    if (gotMaster) {
                        // Small delay so that toasts don't overlap completely
                        setTimeout(() => {
                            window.unlockTrophy('puzzle_master', true);
                        }, 1000);
                    }
                }

                container.innerHTML = `
                <div class="mg-result">
                    <div style="font-size:3rem;margin-bottom:8px">🧩</div>
                    <h2>¡Rompecabezas Armado!</h2>
                    <div class="final-score">${moves} movimientos</div>
                    <p style="color:#c9b8ff;font-size:.9rem;margin:8px 0 12px">Tu cerebro es inmenso 🧠</p>
                    <div style="margin:20px 0;">
                        <span style="background:rgba(255,255,255,0.15); padding:10px 20px; border-radius:20px; font-weight:bold; font-size:1.2rem; color:#ffd700; display:inline-flex; align-items:center; gap:8px;">
                            <img src="assets/images/roccoin.png" style="width:24px; border-radius:50%; object-fit:cover;" alt="RC"> +${rewardAmount} Roccoins
                        </span>
                    </div>${gotMaster ? '<p style="color:#ffd700; font-weight:900; animation: fadeIn 1s infinite alternate; text-shadow: 0 0 10px #ffd700;">🏆 ¡MAESTRO DEL PUZZLE DESBLOQUEADO!<br><strong style="color:white; font-size: 0.9rem;">Código secreto: teamoryo</strong></p>' : ''}
                    <button class="btn-primary" onclick="claimCoinsAndClose(${rewardAmount})">Recoger y Salir</button>
                    <button class="btn-secondary" style="margin-top:10px;" onclick="selectPuzzleDifficulty('${puzzleId}')">Volver a jugar</button>
                </div>`;
            }, 1000);
        }

        // Setup UI
        container.innerHTML = `
        <div class="mg-header">
            <button class="icon-btn" onclick="selectPuzzleDifficulty('${puzzleId}')">←</button>
            <div class="mg-title">Arma la Foto (${SZ}x${SZ})</div>
            <div class="mg-score-wrap"><span class="mg-score" id="puzzleMoves">0</span> movs</div>
        </div>
        <div style="flex:1; display:flex; align-items:center; justify-content:center; padding:16px;">
            <div class="puzzle-board" id="puzzleGrid"></div>
        </div>
        <div style="padding:16px; text-align:center; padding-bottom:30px;">
            <p style="color:#c9b8ff; font-size:.85rem;">Toca una pieza junto al espacio vacío para moverla.</p>
        </div>
        `;

        shuffle();
        renderGrid();
    };
}
