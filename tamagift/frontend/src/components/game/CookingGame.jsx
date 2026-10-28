import React, { useEffect, useMemo, useRef, useState } from 'react';
import { C, FONT, SHADOW, soft } from '../../theme';
import { Screen, ScreenHeader, Modal, Toast } from '../ui';
import { play } from '../../sound';
import Sprite from '../Sprite';
import { FOOD_SPRITES } from '../../sprites';
import { findFood } from '../../foodCatalog';
import {
  RECIPES, STEP_TEXT, decoysFor, stepQuality, recipeScore, starsForCooking, portionsFor,
} from '../../cooking';
import {
  counterSvg, boardSvg, bowlSvg, potSvg, panSvg, stoveSvg, flameSvg, ovenSvg, knifeSvg, spoonSvg,
  cookItemSvg, doughSvg, dishBaseSvg, clocheSvg, sparkleSvg, ingredientSvg, INGREDIENTS,
} from '../../art/kitchen';
import { PetSprite, FoodSprite } from './common';
import { useFinish } from './meta';
import { LevelMap, StarRow } from './levelUi';

// ── Cocina ────────────────────────────────────────────────────────
// Recetas de 3 a 5 pasos, cada uno con un gesto: picar deslizando,
// arrastrar ingredientes, revolver en círculos, voltear en su punto,
// cuidar el fuego, amasar a toques y decorar. Lo que se cocina va a la
// nevera de la mochi (comida casera: la mantiene sana).

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const nameOf = (id) => (INGREDIENTS[id] ? INGREDIENTS[id].name.toLowerCase() : id);
const RATING = (q) => (q >= 0.95 ? '¡Perfecto!' : q >= 0.7 ? '¡Bien!' : 'Mmm, regular');

export default function CookingGame({ look, progress, startLevel, onBack, onComplete }) {
  const unlocked = (progress && progress.unlocked) || 1;
  const [level, setLevel] = useState(startLevel && startLevel <= unlocked ? startLevel : null);
  if (level == null) {
    return (
      <Screen>
        <ScreenHeader title="Cocina" subtitle="Cocina y llena su nevera" onBack={onBack} />
        <LevelMap
          count={RECIPES.length} unlocked={unlocked} stars={(progress && progress.stars) || {}} theme="cocina" look={look}
          colors={[C.peach, C.rose, C.amber, C.sage]}
          labels={RECIPES.map((r) => r.name)}
          onPick={(n) => { play('pop'); setLevel(n); }}
        />
      </Screen>
    );
  }
  return <RecipeRun key={level} level={level} recipe={RECIPES[level - 1]} look={look} onExit={() => setLevel(null)} onComplete={onComplete} />;
}

function DishArt({ id, size }) {
  const f = FOOD_SPRITES.find((x) => x.id === id);
  if (f) return <FoodSprite food={f} size={size} />;
  return <Sprite markup={clocheSvg()} cacheKey="ck-cloche" w={size} h={size * 0.77} />;
}

function useStageSize() {
  const [W, setW] = useState(330);
  useEffect(() => {
    const calc = () => setW(Math.floor(Math.min(340, window.innerWidth - 28, (window.innerHeight - 250) / 0.95)));
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return [W, Math.round(W * 0.95)];
}

function RecipeRun({ level, recipe, look, onExit, onComplete }) {
  const [phase, setPhase] = useState('intro');
  const [idx, setIdx] = useState(0);
  const [qs, setQs] = useState([]);
  const [toast, setToast] = useState(null);
  const [happy, setHappy] = useState(false);
  const { finish, later } = useFinish(onComplete);
  const [W, H] = useStageSize();
  const food = findFood(recipe.food);

  function stepDone(q) {
    const next = [...qs, q];
    setQs(next);
    setHappy(true);
    play(q >= 0.95 ? 'win' : 'good');
    setToast({ key: Date.now(), text: RATING(q), color: q >= 0.7 ? C.sage : C.amber });
    later(() => { setToast(null); setHappy(false); }, 900);
    later(() => {
      if (idx + 1 < recipe.steps.length) { setIdx(idx + 1); return; }
      const score = recipeScore(next);
      const stars = starsForCooking(score);
      setPhase('done');
      play('ding');
      finish(score, 2600, { level, won: true, stars, dishes: [{ id: recipe.food, n: portionsFor(stars), name: food ? food.name : recipe.name }] });
    }, 950);
  }

  const step = recipe.steps[idx];
  const stepWithNames = { ...step, itemName: step.item ? nameOf(step.item) : null };
  const score = recipeScore(qs);
  const stars = starsForCooking(score);

  return (
    <Screen>
      <ScreenHeader title={recipe.name} onBack={onExit} />
      {phase === 'step' && (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            {recipe.steps.map((_, k) => (
              <span key={k} className="pg-keep-round" style={{ width: k === idx ? 22 : 9, height: 9, borderRadius: 5, background: k < idx ? C.sage : k === idx ? C.rose : C.track, transition: 'all 0.25s' }} />
            ))}
          </div>
          <p style={{ fontFamily: FONT.display, fontSize: 14, fontWeight: 700, color: C.ink, margin: '0 0 8px', textAlign: 'center', minHeight: 20 }}>{STEP_TEXT[step.type](stepWithNames)}</p>
        </>
      )}
      <div style={{ position: 'relative', width: W, height: H, borderRadius: 20, overflow: 'hidden', border: `2.5px solid ${C.ink}`, boxShadow: SHADOW.soft, touchAction: 'none', userSelect: 'none' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <Sprite markup={counterSvg(360, 342)} cacheKey="ck-counter" w={W} h={H} kind="surface" />
        </div>
        <div style={{ position: 'absolute', right: 8, top: H * 0.06, pointerEvents: 'none', transition: 'transform 0.3s', transform: happy ? 'translateY(-6px)' : 'none' }}>
          <PetSprite look={look} mood={happy ? 'feliz' : 'normal'} size={Math.round(W * 0.22)} />
        </div>
        {phase === 'step' && <StepWidget key={idx} step={step} W={W} H={H} onDone={stepDone} />}
        {phase === 'done' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: soft(C.surface, 0.25) }}>
            <div className="pg-anim-pop" style={{ position: 'relative' }}>
              <DishArt id={recipe.food} size={Math.round(W * 0.42)} />
              {[[-20, -10], [W * 0.38, 0], [W * 0.1, -30], [W * 0.34, W * 0.3]].map(([x, y], k) => (
                <div key={k} style={{ position: 'absolute', left: x, top: y, animation: `pg-breathe ${0.9 + k * 0.2}s ease-in-out infinite` }}>
                  <Sprite markup={sparkleSvg()} cacheKey="ck-sparkle" w={22} h={22} />
                </div>
              ))}
            </div>
            <p style={{ fontFamily: FONT.display, fontSize: 18, fontWeight: 800, color: C.ink, margin: 0 }}>¡{food ? food.name : recipe.name} listo!</p>
            <StarRow n={stars} size={30} animate gap={4} />
            <p style={{ fontSize: 12.5, color: C.inkSoft, margin: 0 }}>{portionsFor(stars)} {portionsFor(stars) > 1 ? 'porciones' : 'porción'} para su nevera</p>
          </div>
        )}
        {toast && (
          <div key={toast.key} style={{ position: 'absolute', left: '50%', top: '40%', transform: 'translate(-50%,-50%)', zIndex: 9, pointerEvents: 'none' }}>
            <Toast color={toast.color}>{toast.text}</Toast>
          </div>
        )}
      </div>
      {phase === 'intro' && (
        <Modal>
          <DishArt id={recipe.food} size={86} />
          <h2 style={{ fontFamily: FONT.display, fontSize: 19, fontWeight: 800, color: C.ink, margin: '6px 0 4px' }}>{recipe.name}</h2>
          <ol style={{ textAlign: 'left', fontSize: 12.5, color: C.inkSoft, margin: '0 0 12px', paddingLeft: 20, lineHeight: 1.55 }}>
            {recipe.steps.map((s, k) => <li key={k}>{STEP_TEXT[s.type]({ ...s, itemName: s.item ? nameOf(s.item) : null })}</li>)}
          </ol>
          <button onClick={() => { play('pop'); setPhase('step'); }} className="pg-btn pg-btn-rose pg-focus" style={{ padding: '11px 30px', fontSize: 14 }}>¡A cocinar!</button>
        </Modal>
      )}
    </Screen>
  );
}

function StepWidget(props) {
  switch (props.step.type) {
    case 'picar': return <ChopStep {...props} />;
    case 'agregar': return <AddStep {...props} />;
    case 'revolver': return <StirStep {...props} />;
    case 'punto': return <DoneStep {...props} />;
    case 'fuego': return <FireStep {...props} />;
    case 'amasar': return <KneadStep {...props} />;
    case 'decorar': return <DecorateStep {...props} />;
    default: return null;
  }
}

// Coordenadas del puntero dentro del escenario.
function local(e, el) {
  const r = el.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

// ── Picar ─────────────────────────────────────────────────────────
function ChopStep({ step, W, H, onDone }) {
  const ref = useRef(null);
  const [cuts, setCuts] = useState([]);
  const [knife, setKnife] = useState(null);
  const drag = useRef(null);
  const t0 = useRef(performance.now());
  const done = useRef(false);
  const size = Math.round(W * 0.46);
  const cx = W / 2, cy = H * 0.66;
  const left = cx - size / 2, top = cy - size / 2;

  function down(e) { e.currentTarget.setPointerCapture?.(e.pointerId); const p = local(e, ref.current); drag.current = p; setKnife(p); }
  function move(e) { const p = local(e, ref.current); setKnife(p); }
  function up(e) {
    const s = drag.current;
    drag.current = null;
    if (!s || done.current) return;
    const p = local(e, ref.current);
    const dy = p.y - s.y, dx = p.x - s.x;
    const x = (s.x + p.x) / 2;
    if (dy < 26 || Math.abs(dx) > Math.max(40, dy * 0.8)) return;
    if (x < left || x > left + size) return;
    const f = Math.max(0.12, Math.min(0.88, (x - left) / size));
    if (cuts.some((c) => Math.abs(c - f) < 0.07)) return;
    play('chop');
    const next = [...cuts, f].sort((a, b) => a - b);
    setCuts(next);
    if (next.length >= step.cuts) {
      done.current = true;
      onDone(stepQuality(step, { secs: (performance.now() - t0.current) / 1000 }));
    }
  }

  const edges = [0, ...cuts, 1];
  return (
    <div ref={ref} data-step="picar" onPointerDown={down} onPointerMove={move} onPointerUp={up} style={{ position: 'absolute', inset: 0, cursor: 'crosshair' }}>
      <div style={{ position: 'absolute', left: cx - W * 0.4, top: cy - W * 0.12, pointerEvents: 'none' }}>
        <Sprite markup={boardSvg()} cacheKey="ck-board" w={Math.round(W * 0.8)} h={Math.round(W * 0.8 * 112 / 200)} />
      </div>
      {edges.slice(0, -1).map((a, i) => {
        const b = edges[i + 1];
        const off = (i - (edges.length - 2) / 2) * 7;
        return (
          <div key={i} style={{ position: 'absolute', left, top: top - size * 0.08, width: size, height: size, clipPath: `inset(0 ${(1 - b) * 100}% 0 ${a * 100}%)`, transform: `translateX(${off}px)`, transition: 'transform 0.18s', pointerEvents: 'none' }}>
            <Sprite markup={ingredientSvg(step.item)} cacheKey={`ck-ing-${step.item}`} w={size} h={size} />
          </div>
        );
      })}
      {cuts.length === 0 && !knife && (
        <div style={{ position: 'absolute', left: cx - 2, top: top - 4, width: 4, height: size * 0.9, borderLeft: `3px dashed ${C.rose}`, opacity: 0.7, animation: 'pg-nudge 1.4s ease-in-out infinite', pointerEvents: 'none' }} />
      )}
      {knife && (
        <div style={{ position: 'absolute', left: knife.x - 16, top: knife.y - 96, pointerEvents: 'none', transform: 'rotate(-8deg)' }}>
          <Sprite markup={knifeSvg()} cacheKey="ck-knife" w={36} h={92} />
        </div>
      )}
      <Counter text={`${cuts.length}/${step.cuts} cortes`} />
    </div>
  );
}

function Counter({ text }) {
  return (
    <div style={{ position: 'absolute', left: 10, top: 10, fontFamily: FONT.display, fontSize: 12.5, fontWeight: 800, color: C.ink, background: C.glass, borderRadius: 999, padding: '3px 10px', pointerEvents: 'none' }}>{text}</div>
  );
}

function Container({ into, fill, W, cx, cy }) {
  const w = Math.round(W * (into === 'pan' ? 0.62 : into === 'board' ? 0.74 : 0.56));
  const ratio = into === 'pot' ? 166 / 200 : into === 'pan' ? 110 / 240 : into === 'board' ? 112 / 200 : 136 / 200;
  const h = Math.round(w * ratio);
  const markup = into === 'pot' ? potSvg(fill) : into === 'pan' ? panSvg() : into === 'board' ? boardSvg() : bowlSvg(fill);
  return (
    <div style={{ position: 'absolute', left: cx - w / 2, top: cy - h / 2, pointerEvents: 'none' }}>
      {into === 'pot' && (
        <div style={{ position: 'absolute', left: w * 0.05, top: h * 0.86, width: w * 0.9 }}>
          <Sprite markup={stoveSvg()} cacheKey="ck-stove" w={Math.round(w * 0.9)} h={Math.round(w * 0.9 * 58 / 200)} />
        </div>
      )}
      <Sprite markup={markup} cacheKey={`ck-${into}-${fill || 'x'}`} w={w} h={h} />
    </div>
  );
}

// ── Agregar ───────────────────────────────────────────────────────
function AddStep({ step, W, H, onDone }) {
  const ref = useRef(null);
  const shelf = useMemo(() => shuffle([...step.items, ...decoysFor(step)]), [step]);
  const [added, setAdded] = useState([]);
  const [drag, setDrag] = useState(null);       // { id, x, y }
  const [shake, setShake] = useState(null);
  const mistakes = useRef(0);
  const done = useRef(false);
  const cx = W / 2, cy = H * 0.5;
  const chip = Math.round(W * 0.17);

  function start(e, id) {
    if (added.includes(id) || done.current) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ id, ...local(e, ref.current) });
  }
  function move(e) { if (drag) setDrag({ ...drag, ...local(e, ref.current) }); }
  function end() {
    if (!drag) return;
    const d = drag;
    setDrag(null);
    const inside = Math.abs(d.x - cx) < W * 0.32 && Math.abs(d.y - cy) < H * 0.22;
    if (!inside) return;
    if (!step.items.includes(d.id)) {
      play('bad');
      mistakes.current += 1;
      setShake({ id: d.id, key: Date.now() });
      return;
    }
    play('place');
    const next = [...added, d.id];
    setAdded(next);
    if (next.length === step.items.length && !done.current) {
      done.current = true;
      onDone(stepQuality(step, { mistakes: mistakes.current }));
    }
  }

  const fill = added.length === step.items.length ? step.fill : null;
  return (
    <div ref={ref} data-step="agregar" data-need={step.items.join(',')} onPointerMove={move} onPointerUp={end} style={{ position: 'absolute', inset: 0 }}>
      <Container into={step.into} fill={fill} W={W} cx={cx} cy={cy} />
      {added.map((id, k) => (
        <div key={id} className="pg-anim-pop" style={{ position: 'absolute', left: cx - chip * 0.4 + (k - (added.length - 1) / 2) * chip * 0.55, top: cy - chip * 0.55, pointerEvents: 'none' }}>
          <Sprite markup={ingredientSvg(id)} cacheKey={`ck-ing-${id}`} w={Math.round(chip * 0.8)} h={Math.round(chip * 0.8)} />
        </div>
      ))}
      <div style={{ position: 'absolute', left: 6, right: 6, bottom: 8, display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
        {shelf.map((id) => (
          <div
            key={id} data-id={id} onPointerDown={(e) => start(e, id)}
            className={shake && shake.id === id ? 'pg-anim-shake' : undefined}
            style={{ width: chip, height: chip, borderRadius: 14, background: C.surface, border: `2px solid ${C.line}`, display: 'grid', placeItems: 'center', opacity: added.includes(id) || (drag && drag.id === id) ? 0.25 : 1, cursor: 'grab', touchAction: 'none' }}
            aria-label={nameOf(id)}
          >
            <Sprite markup={ingredientSvg(id)} cacheKey={`ck-ing-${id}`} w={chip - 10} h={chip - 10} />
          </div>
        ))}
      </div>
      {drag && (
        <div style={{ position: 'absolute', left: drag.x - chip / 2, top: drag.y - chip / 2, pointerEvents: 'none', transform: 'scale(1.15)', filter: 'drop-shadow(0 6px 6px rgba(0,0,0,0.25))' }}>
          <Sprite markup={ingredientSvg(drag.id)} cacheKey={`ck-ing-${drag.id}`} w={chip} h={chip} />
        </div>
      )}
      <Counter text={`${added.length}/${step.items.length}`} />
    </div>
  );
}

// ── Revolver ──────────────────────────────────────────────────────
function StirStep({ step, W, H, onDone }) {
  const ref = useRef(null);
  const [acc, setAcc] = useState(0);
  const [spoon, setSpoon] = useState(null);
  const last = useRef(null);
  const t0 = useRef(null);
  const done = useRef(false);
  const lastSound = useRef(0);
  const cx = W / 2, cy = H * 0.5;
  const goal = step.turns * Math.PI * 2;

  function down(e) { e.currentTarget.setPointerCapture?.(e.pointerId); const p = local(e, ref.current); last.current = Math.atan2((p.y - cy) * 2, p.x - cx); if (!t0.current) t0.current = performance.now(); setSpoon(p); }
  function move(e) {
    const p = local(e, ref.current);
    setSpoon(p);
    if (last.current == null || done.current) return;
    const dist = Math.hypot(p.x - cx, (p.y - cy) * 2);
    if (dist < W * 0.06 || dist > W * 0.5) return;
    const a = Math.atan2((p.y - cy) * 2, p.x - cx);
    let d = a - last.current;
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    last.current = a;
    const next = acc + Math.min(0.6, Math.abs(d));
    setAcc(next);
    if (next - lastSound.current > Math.PI) { lastSound.current = next; play('stir'); }
    if (next >= goal) {
      done.current = true;
      onDone(stepQuality(step, { secs: (performance.now() - t0.current) / 1000 }));
    }
  }
  function up() { last.current = null; }

  const ring = Math.min(1, acc / goal);
  return (
    <div ref={ref} data-step="revolver" onPointerDown={down} onPointerMove={move} onPointerUp={up} style={{ position: 'absolute', inset: 0 }}>
      <Container into={step.into} fill={step.fill} W={W} cx={cx} cy={cy} />
      {/* remolino: gira con lo que revolviste (aplastado: es una elipse en 3/4) */}
      <div style={{ position: 'absolute', left: cx - W * 0.22, top: cy - W * 0.22 - H * 0.05, width: W * 0.44, height: W * 0.44, transform: 'scaleY(0.36)', pointerEvents: 'none' }}>
        <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ transform: `rotate(${(acc * 180) / Math.PI}deg)` }}>
          <path d="M50 50 m-30 0 a30 30 0 0 1 30 -30 M50 50 m30 0 a30 30 0 0 1 -30 30 M50 50 m0 -16 a16 16 0 0 1 16 16" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>
      {spoon && (
        <div style={{ position: 'absolute', left: spoon.x - 14, top: spoon.y - 90, pointerEvents: 'none', transform: 'rotate(18deg)' }}>
          <Sprite markup={spoonSvg()} cacheKey="ck-spoon" w={30} h={96} />
        </div>
      )}
      {!spoon && <div style={{ position: 'absolute', left: cx - 40, top: cy - 30, width: 80, height: 40, borderRadius: '50%', border: `3px dashed ${C.rose}`, animation: 'pg-spin 2.4s linear infinite', pointerEvents: 'none' }} />}
      <Counter text={`${Math.min(step.turns, Math.floor((acc / (Math.PI * 2)) * 10) / 10)}/${step.turns} vueltas`} />
      <div style={{ position: 'absolute', left: 10, top: 40, width: 90, height: 7, borderRadius: 999, background: C.track }}>
        <div style={{ width: `${ring * 100}%`, height: '100%', borderRadius: 999, background: C.sage }} />
      </div>
    </div>
  );
}

// ── En su punto (voltear o sacar del horno) ───────────────────────
function DoneStep({ step, W, H, onDone }) {
  const [d, setD] = useState(0);
  const [flips, setFlips] = useState([]);
  const [flipping, setFlipping] = useState(false);
  const dRef = useRef(0);
  const flipsRef = useRef([]);
  const doneRef = useRef(false);
  const oven = step.tool === 'oven';
  const rate = oven ? 0.13 : step.kind === 'huevo' ? 0.15 : 0.17;
  const cx = W / 2, cy = H * 0.56;

  useEffect(() => {
    let raf, last = performance.now(), sizzleAt = 0;
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!doneRef.current && !flipping) {
        dRef.current += rate * dt;
        setD(dRef.current);
        if (!oven && now - sizzleAt > 900) { sizzleAt = now; play('sizzle'); }
        if (dRef.current >= 1.02) take();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipping]);

  function take() {
    if (doneRef.current || flipping) return;
    const got = [...flipsRef.current, Math.min(1, dRef.current)];
    flipsRef.current = got;
    setFlips(got);
    play(Math.abs(dRef.current - 0.5) <= 0.08 ? 'good' : 'pop');
    if (got.length >= step.flips) {
      doneRef.current = true;
      onDone(stepQuality(step, { flips: got }));
      return;
    }
    setFlipping(true);
    setTimeout(() => { dRef.current = 0; setD(0); setFlipping(false); }, 450);
  }

  const bucket = Math.round(Math.min(1, d) * 10) / 10;
  const panW = Math.round(W * 0.66);
  const itemW = Math.round(W * 0.42);
  return (
    <div data-step="punto" data-d={d.toFixed(3)} style={{ position: 'absolute', inset: 0 }}>
      {oven ? (
        <div style={{ position: 'absolute', left: cx - W * 0.33, top: cy - W * 0.36, pointerEvents: 'none' }}>
          <Sprite markup={ovenSvg(doneColor(step.kind, bucket))} cacheKey={`ck-oven-${step.kind}-${bucket}`} w={Math.round(W * 0.66)} h={Math.round(W * 0.66 * 184 / 200)} />
        </div>
      ) : (
        <>
          <div style={{ position: 'absolute', left: cx - panW * 0.42, top: cy + panW * 0.12, pointerEvents: 'none' }}>
            <Sprite markup={stoveSvg()} cacheKey="ck-stove" w={Math.round(panW * 0.8)} h={Math.round(panW * 0.8 * 58 / 200)} />
          </div>
          <div style={{ position: 'absolute', left: cx - panW * 0.4, top: cy - panW * 0.22, pointerEvents: 'none' }}>
            <Sprite markup={panSvg()} cacheKey="ck-pan" w={panW} h={Math.round(panW * 110 / 240)} />
          </div>
          <div style={{
            position: 'absolute', left: cx - itemW / 2 - panW * 0.0, top: cy - panW * 0.16, pointerEvents: 'none',
            transform: flipping ? 'translateY(-60px) rotateX(180deg)' : 'none', transition: 'transform 0.4s cubic-bezier(.3,1.4,.6,1)',
          }}>
            <Sprite markup={cookItemSvg(step.kind, bucket)} cacheKey={`ck-item-${step.kind}-${bucket}`} w={itemW} h={Math.round(itemW / 2)} />
          </div>
        </>
      )}
      {/* el punto: crudo → dorado → quemado */}
      <div style={{ position: 'absolute', left: W * 0.1, right: W * 0.1, bottom: 62, height: 16, borderRadius: 999, border: `2px solid ${C.ink}`, background: 'linear-gradient(90deg, #F6E8C8 0%, #E9B86A 42%, #E0A458 50%, #E9B86A 58%, #7A4A2A 85%, #3E2418 100%)' }}>
        <div style={{ position: 'absolute', left: '42%', width: '16%', top: -4, bottom: -4, border: `2.5px solid ${C.sage}`, borderRadius: 6 }} />
        <div style={{ position: 'absolute', left: `${Math.min(100, d * 100)}%`, top: -8, width: 4, height: 28, background: C.ink, borderRadius: 2, transform: 'translateX(-50%)' }} />
      </div>
      <button
        onClick={take} className="pg-btn pg-btn-rose pg-focus"
        style={{ position: 'absolute', left: '50%', bottom: 12, transform: 'translateX(-50%)', padding: '9px 26px', fontSize: 14 }}
      >{oven ? '¡Sacar!' : step.flips > 1 ? '¡Voltear!' : '¡Listo!'}</button>
      <Counter text={step.flips > 1 ? `Lado ${Math.min(flips.length + 1, step.flips)} de ${step.flips}` : oven ? 'Horneando…' : 'Cocinando…'} />
    </div>
  );
}

function doneColor(kind, d) {
  const base = kind === 'pastel' ? ['#FBE3C2', '#E0A458'] : ['#F2D3A0', '#D9954E'];
  const mixHex = (a, b, t) => {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [x, y] = [p(a), p(b)];
    return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
  };
  return d < 0.5 ? mixHex(base[0], base[1], d / 0.5) : mixHex(base[1], '#3E2418', (d - 0.5) / 0.5);
}

// ── Fuego ─────────────────────────────────────────────────────────
const BAND = [0.45, 0.72];
function FireStep({ step, W, H, onDone }) {
  const [heat, setHeat] = useState(0.15);
  const [inBand, setInBand] = useState(0);
  const holding = useRef(false);
  const st = useRef({ heat: 0.15, inBand: 0, total: 0, done: false });
  const cx = W / 2, cy = H * 0.5;

  useEffect(() => {
    let raf, last = performance.now(), sound = 0;
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = st.current;
      if (!s.done) {
        s.heat = Math.max(0, Math.min(1, s.heat + (holding.current ? 0.55 : -0.35) * dt));
        s.total += dt;
        const ok = s.heat >= BAND[0] && s.heat <= BAND[1];
        if (ok) s.inBand += dt;
        if (ok && now - sound > 1100) { sound = now; play('sizzle'); }
        setHeat(s.heat);
        setInBand(s.inBand);
        if (s.inBand >= step.secs || s.total >= step.secs * 3.2) {
          s.done = true;
          onDone(stepQuality(step, { inBand: Math.min(s.inBand, step.secs), total: Math.max(step.secs, s.total * 0.75) }));
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ok = heat >= BAND[0] && heat <= BAND[1];
  // llamitas que asoman entre la olla y el fogón: más grandes con más fuego
  const potW = W * 0.56, potH = potW * 166 / 200;
  const fw = Math.round(W * (0.06 + heat * 0.12));
  return (
    <div data-step="fuego" data-heat={heat.toFixed(3)} style={{ position: 'absolute', inset: 0 }}>
      <Container into="pot" fill={step.fill} W={W} cx={cx} cy={cy} />
      {[-0.24, 0, 0.24].map((k) => (
        <div key={k} style={{ position: 'absolute', left: cx + k * potW - fw / 2, top: cy + potH * 0.46 - fw * 0.75, pointerEvents: 'none', opacity: heat < 0.05 ? 0 : 0.55 + heat * 0.45, animation: 'pg-breathe 0.5s ease-in-out infinite' }}>
          <Sprite markup={flameSvg()} cacheKey="ck-flame" w={fw} h={fw} />
        </div>
      ))}
      {ok && [0, 1, 2, 3].map((k) => (
        <span key={k} className="pg-keep-round" style={{ position: 'absolute', left: cx - W * 0.16 + k * W * 0.1, top: cy - W * 0.09, width: 9, height: 9, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', animation: `pg-bubble-float ${0.7 + k * 0.15}s ease-in infinite`, pointerEvents: 'none' }} />
      ))}
      {/* termómetro */}
      <div style={{ position: 'absolute', right: 12, top: H * 0.3, width: 16, height: H * 0.42, borderRadius: 999, border: `2px solid ${C.ink}`, background: 'linear-gradient(0deg, #8CCBF0, #FFE08A 50%, #E8505E)' }}>
        <div style={{ position: 'absolute', left: -5, right: -5, bottom: `${BAND[0] * 100}%`, height: `${(BAND[1] - BAND[0]) * 100}%`, border: `2.5px solid ${C.sage}`, borderRadius: 4 }} />
        <div style={{ position: 'absolute', left: -7, right: -7, bottom: `${heat * 100}%`, height: 4, background: C.ink, borderRadius: 2 }} />
      </div>
      <button
        onPointerDown={() => { holding.current = true; }} onPointerUp={() => { holding.current = false; }} onPointerLeave={() => { holding.current = false; }}
        className="pg-btn pg-btn-rose pg-focus"
        style={{ position: 'absolute', left: '50%', bottom: 12, transform: 'translateX(-50%)', padding: '10px 22px', fontSize: 13.5, touchAction: 'none' }}
        aria-label="Mantén para subir el fuego"
      >Mantén apretado</button>
      <Counter text={`${Math.min(step.secs, Math.floor(inBand * 10) / 10).toFixed(1)}/${step.secs} s en su punto`} />
    </div>
  );
}

// ── Amasar ────────────────────────────────────────────────────────
function KneadStep({ step, W, H, onDone }) {
  const [n, setN] = useState(0);
  const [k, setK] = useState(0);
  const t0 = useRef(null);
  const done = useRef(false);
  const p = Math.min(1, n / step.taps);
  const size = Math.round(W * 0.5);
  function tap() {
    if (done.current) return;
    if (!t0.current) t0.current = performance.now();
    play('pop');
    setK((x) => x + 1);
    const next = n + 1;
    setN(next);
    if (next >= step.taps) {
      done.current = true;
      onDone(stepQuality(step, { secs: (performance.now() - t0.current) / 1000 }));
    }
  }
  return (
    <div data-step="amasar" onPointerDown={tap} style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}>
      <div style={{ position: 'absolute', left: W / 2 - size / 2, top: H * 0.58 - size * 0.4, transform: `scale(${1 + p * 0.28}, ${1 - p * 0.32})`, transformOrigin: '50% 90%', transition: 'transform 0.15s' }}>
        <div key={k} style={{ animation: k ? 'pg-jelly 0.25s ease' : undefined }}>
          <Sprite markup={doughSvg(step.color)} cacheKey={`ck-dough-${step.color}`} w={size} h={Math.round(size * 92 / 120)} />
        </div>
      </div>
      {n === 0 && <div style={{ position: 'absolute', left: '50%', top: H * 0.3, transform: 'translateX(-50%)', fontFamily: FONT.display, fontSize: 13, fontWeight: 700, color: C.rose, animation: 'pg-nudge 1.2s ease-in-out infinite' }}>¡Toca, toca, toca!</div>}
      <Counter text={`${n}/${step.taps}`} />
    </div>
  );
}

// ── Decorar ───────────────────────────────────────────────────────
function DecorateStep({ step, W, H, onDone }) {
  const ref = useRef(null);
  const [placed, setPlaced] = useState([]);
  const done = useRef(false);
  const bw = Math.round(W * 0.78), bh = Math.round(bw * 104 / 160);
  const left = W / 2 - bw / 2, top = H * 0.56 - bh / 2;
  const chip = Math.round(W * 0.13);
  function tap(e) {
    if (done.current) return;
    const p = local(e, ref.current);
    // dentro del plato (una elipse)
    const nx = (p.x - (left + bw / 2)) / (bw * 0.44), ny = (p.y - (top + bh * 0.62)) / (bh * 0.3);
    if (nx * nx + ny * ny > 1.4) return;
    play('place');
    const next = [...placed, { ...p, id: Date.now() + Math.random() }];
    setPlaced(next);
    if (next.length >= step.n) { done.current = true; setTimeout(() => onDone(1), 350); }
  }
  return (
    <div ref={ref} data-step="decorar" onPointerDown={tap} style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}>
      <div style={{ position: 'absolute', left, top, pointerEvents: 'none' }}>
        <Sprite markup={dishBaseSvg(step.base)} cacheKey={`ck-base-${step.base}`} w={bw} h={bh} />
      </div>
      {placed.map((pp) => (
        <div key={pp.id} className="pg-anim-pop" style={{ position: 'absolute', left: pp.x - chip / 2, top: pp.y - chip / 2, pointerEvents: 'none' }}>
          <Sprite markup={ingredientSvg(step.item)} cacheKey={`ck-ing-${step.item}`} w={chip} h={chip} />
        </div>
      ))}
      <div style={{ position: 'absolute', left: '50%', bottom: 10, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6, background: C.glass, borderRadius: 999, padding: '4px 12px 4px 6px', pointerEvents: 'none' }}>
        <Sprite markup={ingredientSvg(step.item)} cacheKey={`ck-ing-${step.item}`} w={28} h={28} />
        <span style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 800, color: C.ink }}>{placed.length}/{step.n}</span>
      </div>
    </div>
  );
}
