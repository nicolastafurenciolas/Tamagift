/* ═══════════════════════════════════════════════════════
   PUSHEEN GAME — quiz.js  (¿How Much Conoces?)
═══════════════════════════════════════════════════════ */

// ─── Trophies now managed globally in game.js ───

const KAHOOT_COLORS = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];
const KAHOOT_ICONS = ['▲', '◆', '●', '■'];

// Generic incorrect messages — only shown when no custom wrong message
function genericWrongMsg() {
    return Math.random() < 0.20 ? 'gracias a Dios el icfes ya pasó' : 'incorrecto';
}

const QUIZ_QUESTIONS = [
    // Q1 — Aniversario. Correct is ANY of the three "4 de diciembre". No afterMsg.
    {
        q: "¿Cuándo cumplimos aniversario?",
        opts: [
            { text: "4 de diciembre", correct: true },
            { text: "4 de diciembre", correct: false },
            { text: "4 de diciembre", correct: false },
            { text: "5 de diciembre", correct: false }
        ]
    },
    // Q2 — Mascota favorita. Juan Pablo is correct.
    {
        q: "¿Qué mascota es mejor?",
        opts: [
            { text: "Ryo", correct: false },
            { text: "Rocco", correct: false },
            { text: "Tritón", correct: false },
            { text: "Juan Pablo", correct: true }
        ],
        afterMsgCorrect: "Correcto, Juan Pablo reina",
        afterMsgWrong: "incorrectoo, encima era re obvia"
    },
    // Q3 — Papitas. Special reveal. No afterMsg.
    {
        q: "Si tuviera que escoger entre tú y unas papitas de limón Margarita... ¿por qué escogería las papitas?",
        opts: [
            { text: "Qué putas Nicolás", correct: false },
            { text: "hmmm ya", correct: false }
        ],
        special: 'papitas'
    },
    // Q4 — Cara limpia. Single invisible option. No afterMsg.
    {
        q: "¿Cómo hago para tener una cara tan limpia como la tuya?",
        opts: [
            { text: "                   ", correct: true, secretText: "El tutorial me lo dices al 3127064641" }
        ],
        special: 'invisible'
    },
    // Q5 — Ramen. All correct. No afterMsg.
    {
        q: "¿Mi ramen sabía a mierda?",
        opts: [
            { text: "Sí", correct: true },
            { text: "También", correct: true },
            { text: "La opción 1", correct: true },
            { text: "Sí", correct: true, altColor: true }
        ],
        allCorrect: true
    },
    // Q6 — Batalla Naval. Lo admito is correct. No afterMsg.
    {
        q: "¿Vas a admitir que haces trampa en Batalla Naval?",
        opts: [
            { text: "Lo admito", correct: true },
            { text: "No lo admito", correct: false }
        ]
    },
    // Q7 — Niña más hermosa. None correct. Custom afterMsg.
    {
        q: "¿Quién es la niña más hermosa del mundo mundial?",
        opts: [
            { text: "Yo", correct: false },
            { text: "Yo mi vida", correct: false },
            { text: "AWWW, te amo, yo.", correct: false },
            { text: "Sho", correct: false }
        ],
        noneCorrect: true,
        afterMsgWrong: "Ya no eres una niña, cumples 18 jejeje"
    },
    // Q8 — Mentiras amor. All hearts correct. No afterMsg.
    {
        q: "Mentiras amor, sí eres la más linda",
        opts: [
            { text: "❤️", correct: true },
            { text: "❤️", correct: true },
            { text: "❤️", correct: true },
            { text: "❤️", correct: true }
        ],
        allCorrect: true
    },
    // Q9 — Quiz. First option is correct. Custom afterMsg after correct.
    {
        q: "¿Te gustó el quiz?",
        opts: [
            { text: "Sí, porque si digo \"No\" me lo contarías como respuesta incorrecta", correct: true },
            { text: "No, porque si digo \"Sí\" me lo contarías como respuesta incorrecta", correct: false },
            { text: "Sí, porque si digo \"Sí\" no parecería que no me gustó y que en realidad me gusta Samuel", correct: false },
            { text: "No, porque la verdad no sé qué putas escribí en las 3 anteriores, esta es la correcta amor", correct: false }
        ],
        afterMsgCorrect: "cómo me vas a creer jajajajajaja"
    },
    // Q10 — Física cuántica. All correct. Custom afterMsg.
    {
        q: "En el contexto de la paradoja de la medición en mecánica cuántica, considerando la decoherencia ambiental... ¿cuál es el valor esperado del observable conjugado al momentum lineal del gato?",
        opts: [
            { text: "ħ/2", correct: true },
            { text: "0 (cancelación de fases)", correct: true },
            { text: "∞ (divergencia)", correct: true },
            { text: "Indeterminado, viola el principio de complementariedad", correct: true }
        ],
        allCorrect: true,
        afterMsgCorrect: "en realidad ninguna es correcta pero por ser buena gentes regalo punto"
    }
];

function adaptFontSize(text) {
    if (text.length > 90) return '0.6rem';
    if (text.length > 60) return '0.68rem';
    if (text.length > 40) return '0.78rem';
    return '0.88rem';
}

function initQuiz(container) {
    let currentQ = -1;
    let score = 0;
    let answered = false;

    function showIntro() {
        container.innerHTML = `
        <div class="mg-header">
          <button class="icon-btn" onclick="closeMinigame()">✕</button>
          <div class="mg-title">Quiz</div>
          <div class="mg-score-wrap"><span class="mg-score" id="quizSc">0 pts</span></div>
        </div>
        <div class="quiz-intro">
          <div class="quiz-intro-emoji">🎉</div>
          <h2 class="quiz-intro-title">¡Comienza el quiz creado por el mejor novio del mundo!</h2>
          <p class="quiz-intro-sub">10 preguntas muy serias</p>
          <button class="btn-primary quiz-start-btn" onclick="quizNext()">¡Empezar!</button>
        </div>`;
    }

    window.quizNext = function () {
        currentQ++;
        if (currentQ >= QUIZ_QUESTIONS.length) { showFinalScore(); return; }
        answered = false;
        renderQuestion(QUIZ_QUESTIONS[currentQ]);
    };

    function renderQuestion(qData) {
        const num = currentQ + 1;
        const total = QUIZ_QUESTIONS.length;
        const twoCol = qData.opts.length <= 2;
        const singleFull = qData.special === 'invisible';

        container.innerHTML = `
        <div class="mg-header">
          <button class="icon-btn" onclick="closeMinigame()">✕</button>
          <div class="mg-title">Quiz</div>
          <div class="mg-score-wrap"><span class="mg-score" id="quizSc">${score} pts</span></div>
        </div>
        <div class="quiz-q-wrap">
          <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${((num-1)/total)*100}%"></div></div>
          <div class="quiz-q-counter">${num} / ${total}</div>
          <div class="quiz-q-box"><div class="quiz-q-text">${qData.q}</div></div>
          <div class="quiz-opts-grid ${singleFull ? 'single-full' : twoCol ? 'two-col' : 'four-col'}" id="quizOpts"></div>
          ${qData.special === 'papitas' ? `<div id="hiddenOpt"></div>` : ''}
        </div>
        <div class="quiz-overlay" id="quizOverlay" style="display:none;">
          <div class="quiz-overlay-msg" id="quizOverlayMsg"></div>
        </div>`;

        const grid = document.getElementById('quizOpts');

        qData.opts.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-opt-btn';
            btn.style.background = opt.altColor ? '#7c3aed' : KAHOOT_COLORS[i % KAHOOT_COLORS.length];

            const fs = adaptFontSize(opt.text.trim());

            if (qData.special === 'invisible') {
                btn.innerHTML = `<span class="quiz-opt-icon">${KAHOOT_ICONS[i]}</span><span class="quiz-opt-text" style="font-size:${fs};color:transparent">${opt.text}</span>`;
                btn.addEventListener('click', () => {
                    if (answered) return;
                    answered = true;
                    const span = btn.querySelector('.quiz-opt-text');
                    span.style.color = 'white';
                    span.innerText = opt.secretText;
                    span.style.fontSize = adaptFontSize(opt.secretText);
                    btn.style.outline = '4px solid white';
                    score += 100;
                    document.getElementById('quizSc').innerText = `${score} pts`;
                    setTimeout(() => window.quizNext(), 3200);
                });
            } else {
                btn.innerHTML = `<span class="quiz-opt-icon">${KAHOOT_ICONS[i]}</span><span class="quiz-opt-text" style="font-size:${fs}">${opt.text}</span>`;
                btn.addEventListener('click', () => handleAnswer(qData, i, btn));
            }
            grid.appendChild(btn);
        });

        // Papitas: reveal hidden 5th option after any click
        if (qData.special === 'papitas') {
            grid.querySelectorAll('.quiz-opt-btn').forEach(b => {
                b.addEventListener('click', () => {
                    if (answered) return;
                    answered = true;
                    b.style.background = '#6b0b0b';
                    setTimeout(() => {
                        const hidden = document.getElementById('hiddenOpt');
                        if (!hidden) return;
                        const revText = "Porque las papitas de limón no hablan con Samuel";
                        const hBtn = document.createElement('button');
                        hBtn.className = 'quiz-opt-btn quiz-hidden-reveal';
                        hBtn.style.background = '#26890c';
                        hBtn.style.width = '100%';
                        hBtn.style.margin = '6px 8px';
                        hBtn.innerHTML = `<span class="quiz-opt-icon">⭐</span><span class="quiz-opt-text" style="font-size:${adaptFontSize(revText)}">${revText}</span>`;
                        hidden.appendChild(hBtn);
                        score += 100;
                        document.getElementById('quizSc').innerText = `${score} pts`;
                        setTimeout(() => window.quizNext(), 3500);
                    }, 800);
                });
            });
        }
    }

    function showOverlay(msg, callback) {
        const ov = document.getElementById('quizOverlay');
        const msgEl = document.getElementById('quizOverlayMsg');
        if (!ov || !msgEl) { setTimeout(callback, 200); return; }
        msgEl.innerText = msg;
        ov.style.display = 'flex';
        setTimeout(() => { ov.style.display = 'none'; callback(); }, 2800);
    }

    function handleAnswer(qData, chosenIdx, chosenBtn) {
        if (answered) return;
        answered = true;

        const grid = document.getElementById('quizOpts');
        const allBtns = grid.querySelectorAll('.quiz-opt-btn');
        const opts = qData.opts;

        // Determine if correct
        let isCorrect;
        if (qData.allCorrect) isCorrect = true;
        else if (qData.noneCorrect) isCorrect = false;
        else isCorrect = opts[chosenIdx].correct;

        if (isCorrect) score += 100;
        document.getElementById('quizSc').innerText = `${score} pts`;

        // Colour all buttons
        allBtns.forEach((btn, i) => {
            btn.disabled = true;
            let correct;
            if (qData.allCorrect) correct = true;
            else if (qData.noneCorrect) correct = false;
            else correct = opts[i].correct;

            if (correct) {
                btn.style.background = '#26890c';
                btn.style.transform = 'scale(1.04)';
                btn.style.border = '3px solid #fff';
            } else {
                btn.style.background = '#444';
                btn.style.opacity = '0.55';
            }
            if (btn === chosenBtn) {
                btn.style.outline = `4px solid ${correct ? '#fff' : '#ff4444'}`;
            }
        });

        // Resolve which message to show (if any)
        let msg = null;
        if (qData.noneCorrect) {
            msg = qData.afterMsgWrong || null;
        } else if (isCorrect) {
            msg = qData.afterMsgCorrect || null;
        } else {
            msg = qData.afterMsgWrong || genericWrongMsg();
        }

        if (msg) {
            showOverlay(msg, () => window.quizNext());
        } else {
            setTimeout(() => window.quizNext(), 2000);
        }
    }

    function showFinalScore() {
        const total = QUIZ_QUESTIONS.length * 100;
        const pct = Math.round((score / total) * 100);
        const grade = pct >= 80 ? 'Gran desempeño' : pct >= 50 ? 'Puede mejorar' : 'Hay que estudiar más';
        const reward = Math.min(50, Math.floor(score / 20));

        // Save record
        const prev = parseInt(localStorage.getItem('record_quiz') || '0');
        if (score > prev) {
            localStorage.setItem('record_quiz', score);
            const el = document.getElementById('quizScore');
            if (el) el.innerText = `${score} pts`;
        }
        // Unlock trophy
        window.unlockTrophy('quiz', true);

        container.innerHTML = `
        <div class="mg-result">
          <div style="font-size:3rem;margin-bottom:8px">🎉</div>
          <h2>¡Quiz terminado!</h2>
          <div class="final-score">${score} pts  •  ${pct}%</div>
          <p style="color:#c9b8ff;font-size:.9rem;margin:8px 0 12px">${grade}</p>
          <p style="margin-bottom:10px; color:#ddd;">¡Demostraste que la amas!</p>
        <div style="background:rgba(255,255,255,.08); padding:8px 15px; border-radius:12px; display:inline-block; font-weight:800; color:#ffd700;">
            <img src="assets/images/roccoin.png" style="width:20px; vertical-align:middle; margin-right:5px; border-radius:50%; object-fit:cover;" alt="RC"> +${reward} Roccoins
        </div>
        <br/><br/><button class="btn-primary" onclick="claimCoinsAndClose(${reward})">Recoger y Salir</button>
          <button class="btn-secondary" style="margin-top:10px;" onclick="startQuiz(document.getElementById('minigameContainer'))">Repetir quiz</button>
        </div>`;
    }

    showIntro();
}
