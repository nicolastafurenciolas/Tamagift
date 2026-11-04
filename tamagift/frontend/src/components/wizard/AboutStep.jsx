// Paso "Sobre {su nombre}": 30 segundos para contarle al juego de tu
// pareja. Todo opcional y con ideas tocables (PLAN_REGALO_VIVO.md §4).
import React from 'react';
import { C, FONT } from '../../theme';
import { IconHeart, IconGift } from '../icons';
import { IdeaChips, SoftInput, DatePick, Section } from './personalBits';
import { QUICK_LIKES, QUICK_DATES } from './profileDraft';

// Cómo se le suele decir a la pareja (sin género).
// TODO(catalog): mover a personal/catalog.js como NICKNAME_IDEAS.
const NICKNAME_IDEAS = ['Amor', 'Mi vida', 'Cielo', 'Bebé', 'Corazón', 'Mi persona'];

const DATE_ICON = { cumple: IconGift, aniversario: IconHeart };

export default function AboutStep({ about, setAbout, partnerName }) {
  const who = (partnerName || '').trim();
  const thisYear = new Date().getFullYear();
  const setNick = (nickname) => setAbout((a) => ({ ...a, nickname }));
  const setLike = (id, v) => setAbout((a) => ({ ...a, likes: { ...a.likes, [id]: v } }));
  const setDate = (id, v) => setAbout((a) => {
    const dates = { ...a.dates };
    if (v) dates[id] = v; else delete dates[id];
    return { ...a, dates };
  });

  return (
    <div>
      <Section title="¿Cómo le dices?" hint={`La mascota le va a decir así${who ? ` a ${who}` : ''} cuando hable de tu parte.`}>
        <SoftInput label="Cómo le dices" value={about.nickname} onChange={setNick} placeholder={who ? `Ej: ${who}, amor, cielo…` : 'Ej: amor, cielo…'} maxLength={60} />
        <IdeaChips ideas={NICKNAME_IDEAS} value={about.nickname} onPick={setNick} />
      </Section>

      <Section title="Sus fechas" hint="Ese día su mundo se va a vestir de fiesta. Día y mes; el año si quieres.">
        {QUICK_DATES.map((k, i) => {
          const Icon = DATE_ICON[k.id] || IconHeart;
          return (
            <div key={k.id} style={{ marginBottom: i === QUICK_DATES.length - 1 ? 0 : 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Icon size={15} color={C.rose} />
                <span style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, color: C.inkSoft }}>{k.label}</span>
              </div>
              <DatePick
                label={k.label}
                value={about.dates[k.id]}
                onChange={(v) => setDate(k.id, v)}
                yearFrom={k.id === 'cumple' ? 1940 : 1970}
                yearTo={k.id === 'cumple' ? thisYear - 10 : thisYear}
              />
            </div>
          );
        })}
      </Section>

      <Section title={`Tres cositas de ${who || 'tu pareja'}`} hint="Escríbelas o toca una idea. La mascota las va a recordar." last>
        {QUICK_LIKES.map((l, i) => (
          <div key={l.id} style={{ marginBottom: i === QUICK_LIKES.length - 1 ? 0 : 10 }}>
            <p style={{ fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, color: C.inkSoft, margin: '0 0 6px' }}>{l.label}</p>
            <SoftInput label={l.label} value={about.likes[l.id]} onChange={(v) => setLike(l.id, v)} placeholder={`Ej: ${l.ideas[0]}`} maxLength={80} />
            <IdeaChips ideas={l.ideas} value={about.likes[l.id]} onPick={(v) => setLike(l.id, v)} color={C.sage} />
          </div>
        ))}
      </Section>
    </div>
  );
}
