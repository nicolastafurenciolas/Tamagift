import React, { useState } from 'react';
import { C, FONT, SHADOW } from '../../theme';
import { Screen, ScreenHeader, HeaderTag } from '../ui';
import { play } from '../../sound';
import { useFinish } from './meta';

// ── Trivia del corazón ────────────────────────────────────────────
// Las preguntas salen de lo que configuró quien regaló. Acertar una
// comida muestra la reacción que él/ella escribió.

const ROUNDS = 6;
const FAKE_FOODS = ['Sushi', 'Tacos', 'Lasaña', 'Panqueques', 'Ceviche', 'Ramen', 'Empanadas', 'Waffles', 'Arepas', 'Croissant'];
const FAKE_NAMES = ['Luna', 'Mochi', 'Pelusa', 'Coco', 'Nube', 'Simba', 'Kiwi', 'Bruno'];
const FAKE_PHRASES = [
  'Hoy soñé con un pastel gigante',
  'Creo que necesito una siesta',
  'Me gusta mirar por la ventana',
  '¿Sabías que puedo contar hasta diez?',
  'Las nubes parecen algodón de azúcar',
];

const norm = (s) => String(s || '').trim().toLowerCase();

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Elige `count` opciones distintas que NO estén en `forbidden` (nombres
// que también serían respuesta correcta). Antes, si le gustaban Pizza y
// Sushi, la pregunta de la pizza podía traer Sushi como "incorrecta".
function pickDistinct(pool, count, forbidden) {
  const banned = new Set([...forbidden].map(norm));
  const out = [];
  for (const item of shuffle(pool)) {
    if (out.length >= count) break;
    const k = norm(item);
    if (banned.has(k)) continue;
    banned.add(k);
    out.push(item);
  }
  return out;
}

export function buildTriviaQuestions(pet) {
  const qs = [];
  const foods = pet.food_preferences || [];
  const likes = foods.filter((f) => f.preference === 'gusta');
  const dislikes = foods.filter((f) => f.preference === 'no_gusta');
  const phrases = (pet.phrases || []).filter((p) => p.text);
  const likeNames = likes.map((l) => l.food_name);
  const dislikeNames = dislikes.map((d) => d.food_name);

  likes.forEach((f) => {
    const wrong = pickDistinct([...dislikeNames, ...FAKE_FOODS], 3, likeNames);
    if (wrong.length === 3) qs.push({ q: '¿Cuál de estas comidas me encanta?', correct: f.food_name, options: [f.food_name, ...wrong], reveal: f.reaction_message });
  });
  dislikes.forEach((f) => {
    const wrong = pickDistinct([...likeNames, ...FAKE_FOODS], 3, dislikeNames);
    if (wrong.length === 3) qs.push({ q: '¿Cuál de estas NO me gusta nada?', correct: f.food_name, options: [f.food_name, ...wrong], reveal: f.reaction_message });
  });
  const allPhrases = phrases.map((p) => p.text);
  phrases.forEach((p) => {
    const wrong = pickDistinct(FAKE_PHRASES, 3, allPhrases);
    if (wrong.length === 3) qs.push({ q: '¿Cuál de estas frases te digo yo?', correct: p.text, options: [p.text, ...wrong], long: true });
  });
  if (pet.name) {
    qs.push({ q: '¿Cómo me llamo?', correct: pet.name, options: [pet.name, ...pickDistinct(FAKE_NAMES, 3, [pet.name, pet.creator_name || ''])] });
  }
  if (pet.creator_name) {
    qs.push({ q: '¿Quién te preparó este regalo?', correct: pet.creator_name, options: [pet.creator_name, ...pickDistinct(FAKE_NAMES, 3, [pet.creator_name, pet.name || ''])] });
  }
  return shuffle(qs).slice(0, ROUNDS).map((q) => ({ ...q, options: shuffle(q.options) }));
}

export default function TriviaGame({ pet, onBack, onComplete }) {
  const [questions] = useState(() => buildTriviaQuestions(pet));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const { finish, later } = useFinish(onComplete);
  const current = questions[idx];

  function choose(opt) {
    if (picked) return;
    const right = opt === current.correct;
    setPicked(opt);
    play(right ? 'good' : 'bad');
    const total = right ? score + 1 : score;
    if (right) setScore(total);
    later(() => {
      if (idx + 1 >= questions.length) finish(total, 0);
      else { setIdx((i) => i + 1); setPicked(null); }
    }, right && current.reveal ? 1900 : 1100);
  }

  if (questions.length === 0) {
    return (
      <Screen>
        <ScreenHeader title="Trivia del corazón" onBack={onBack} />
        <div className="pg-card" style={{ padding: 20, textAlign: 'center', maxWidth: 320 }}>
          <p style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>
            Este juego usa las comidas y frases que configuró quien te regaló la mascota, y todavía no hay suficientes para armar preguntas.
          </p>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Trivia del corazón" onBack={onBack} right={<HeaderTag>{idx + 1}/{questions.length}</HeaderTag>} />
      <div style={{ width: '100%', maxWidth: 340 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {questions.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 6, borderRadius: 999, background: i < idx ? C.sage : i === idx ? C.rose : C.track }} />
          ))}
        </div>
        <div className="pg-card" style={{ padding: 16, marginBottom: 12, textAlign: 'center' }}>
          <p style={{ fontFamily: FONT.display, fontSize: 16, fontWeight: 800, color: C.ink, margin: 0, lineHeight: 1.3 }}>{current.q}</p>
        </div>
        <div className="flex flex-col gap-2.5">
          {current.options.map((opt) => {
            const isCorrect = opt === current.correct;
            const isPicked = picked === opt;
            const show = picked != null;
            return (
              <button
                key={opt} onClick={() => choose(opt)} disabled={show} className="pg-focus"
                style={{
                  padding: current.long ? '11px 14px' : '13px 16px', borderRadius: 16, cursor: show ? 'default' : 'pointer', textAlign: 'left',
                  fontFamily: FONT.body, fontSize: current.long ? 13 : 14.5, fontWeight: 700, lineHeight: 1.35,
                  background: show && isCorrect ? C.sageSoft : show && isPicked ? C.roseSoft : C.surface,
                  color: C.ink, display: 'flex', justifyContent: 'space-between', gap: 8,
                  border: `2px solid ${show && isCorrect ? C.sage : show && isPicked ? C.rose : C.line}`,
                  boxShadow: show ? 'none' : SHADOW.soft,
                  animation: show && isPicked && !isCorrect ? 'pg-shake 0.4s ease' : 'none',
                }}
              >
                <span>{opt}</span>
                {show && isCorrect && <span style={{ color: C.sage }}>✓</span>}
                {show && isPicked && !isCorrect && <span style={{ color: C.rose }}>✕</span>}
              </button>
            );
          })}
        </div>
        {picked === current.correct && current.reveal && (
          <div className="pg-card pg-anim-pop" style={{ marginTop: 12, padding: 14, background: C.sageSoft, borderColor: C.sage }}>
            <p style={{ fontFamily: FONT.hand, fontSize: 18, color: C.ink, margin: 0, lineHeight: 1.35, textAlign: 'center' }}>“{current.reveal}”</p>
          </div>
        )}
      </div>
    </Screen>
  );
}
