import React from 'react';
import { PetRecipeMarkup, DEFAULT_RECIPE } from '../PetRecipe';
import { BODIES, EARS, EYES, MOUTHS, CHEEK_STYLES } from '../petParts';
import { TAILS, PATTERNS, HEAD_ACCESSORIES, NECK_ACCESSORIES, EXTRA_ACCESSORIES } from '../petAccessories';
import { PET_STYLES } from '../petStyles';
import { FURNITURE, WALL_STYLES, FLOOR_STYLES, FURNITURE_PAINTS, findPaint } from '../roomCatalog';
import { DECOR_CATALOG } from '../shopCatalog';

// Página interna de revisión de arte (solo para desarrollo, ruta /artcheck).
// Muestra cada variante de cada parte para poder mirarlas todas de una.
function Cell({ label, recipe, mood = 'normal' }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 108, height: 108, background: '#FFF7EC', borderRadius: 14, border: '1px solid #EAD9C7' }}>
        <svg viewBox="0 0 200 200" width={108} height={108}>
          <PetRecipeMarkup recipe={recipe} mood={mood} />
        </svg>
      </div>
      <div style={{ fontSize: 10, marginTop: 3, fontFamily: 'sans-serif' }}>{label}</div>
    </div>
  );
}

function Row({ title, field, options, extra }) {
  return (
    <section style={{ marginBottom: 22 }}>
      <h3 style={{ fontFamily: 'sans-serif', fontSize: 14, margin: '0 0 8px' }}>{title}</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {options.map((o) => (
          <Cell key={o.id} label={o.label} recipe={{ ...DEFAULT_RECIPE, ...extra, [field]: o.id }} />
        ))}
      </div>
    </section>
  );
}

export default function ArtCheck() {
  return (
    <div style={{ padding: 20, background: '#FBF3E9', minHeight: '100vh' }}>
      <h2 style={{ fontFamily: 'sans-serif' }}>Revisión de arte</h2>

      <section style={{ marginBottom: 22 }}>
        <h3 style={{ fontFamily: 'sans-serif', fontSize: 14, margin: '0 0 8px' }}>Ánimos</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {['normal', 'feliz', 'enojado'].map((m) => (
            <Cell key={m} label={m} mood={m}
              recipe={{ ...DEFAULT_RECIPE, ears: 'gato', neckAcc: 'bufanda', tail: 'gato', cheeks: 'redondos' }} />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 26 }}>
        <h3 style={{ fontFamily: 'sans-serif', fontSize: 14, margin: '0 0 8px' }}>Estilos (presets)</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PET_STYLES.map((s) => (
            <Cell key={s.id} label={s.label} recipe={{ ...DEFAULT_RECIPE, ...s.recipe }} />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 26 }}>
        <h3 style={{ fontFamily: 'sans-serif', fontSize: 14, margin: '0 0 8px' }}>Estilos — los 3 ánimos</h3>
        {PET_STYLES.map((s) => (
          <div key={s.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontFamily: 'sans-serif', fontSize: 11, width: 92 }}>{s.label}</span>
            {['normal', 'feliz', 'enojado'].map((m) => (
              <Cell key={m} label={m} mood={m} recipe={{ ...DEFAULT_RECIPE, ...s.recipe }} />
            ))}
          </div>
        ))}
      </section>

      <Row title="Cuerpos" field="body" options={BODIES} />
      <Row title="Orejas" field="ears" options={EARS} />
      <Row title="Ojos" field="eyes" options={EYES} />
      <Row title="Bocas" field="mouth" options={MOUTHS} />
      <Row title="Cachetes" field="cheeks" options={CHEEK_STYLES} />
      <Row title="Colas" field="tail" options={TAILS} />
      <Row title="Patrones" field="pattern" options={PATTERNS} />
      <Row title="Cabeza" field="headAcc" options={HEAD_ACCESSORIES} />
      <Row title="Cuello" field="neckAcc" options={NECK_ACCESSORIES} />
      <Row title="Cara" field="extraAcc" options={EXTRA_ACCESSORIES} />

      {/* Los accesorios oscuros hay que verlos también sobre un cuerpo
          oscuro: es donde se pierden si el contraste está mal. */}
      {/* Los muebles no estaban en esta página: no había forma de
          revisarlos sin entrar al juego y colocarlos uno por uno. */}
      <h2 style={{ fontFamily: 'sans-serif', marginTop: 34 }}>Muebles</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 22 }}>
        {FURNITURE.map((f) => (
          <div key={f.id} style={{ textAlign: 'center' }}>
            <div style={{ width: Math.min(150, f.w), height: Math.min(150, f.w) * (f.h / f.w), background: '#E0BE95', borderRadius: 10, border: '1px solid #EAD9C7', padding: 4 }}>
              {f.render(findPaint('natural'))}
            </div>
            <div style={{ fontSize: 10, marginTop: 3, fontFamily: 'sans-serif' }}>{f.name}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: 'sans-serif' }}>Muebles en otras pinturas</h2>
      {['nogal', 'negro', 'pastel'].map((pid) => (
        <div key={pid} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 14 }}>
          <span style={{ fontFamily: 'sans-serif', fontSize: 11, width: 60 }}>{pid}</span>
          {FURNITURE.slice(0, 8).map((f) => (
            <div key={f.id} style={{ width: 96, height: 96 * (f.h / f.w), background: '#C9BCB1', borderRadius: 8, padding: 3 }}>
              {f.render(findPaint(pid))}
            </div>
          ))}
        </div>
      ))}

      <h2 style={{ fontFamily: 'sans-serif', marginTop: 26 }}>Decoración de la tienda</h2>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
        {DECOR_CATALOG.map((d) => (
          <div key={d.id} style={{ textAlign: 'center' }}>
            <div style={{ width: 92, height: 92, background: '#E0BE95', borderRadius: 10, border: '1px solid #EAD9C7' }}>{d.render()}</div>
            <div style={{ fontSize: 10, marginTop: 3, fontFamily: 'sans-serif' }}>{d.name}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: 'sans-serif' }}>Paredes y pisos</h2>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
        {[...WALL_STYLES.map((w) => ({ ...w, kind: 'pared' })), ...FLOOR_STYLES.map((f) => ({ ...f, kind: 'piso' }))].map((st) => (
          <div key={st.kind + st.id} style={{ textAlign: 'center' }}>
            <svg viewBox="0 0 150 100" width={128} height={85} style={{ borderRadius: 8, border: '1px solid #EAD9C7' }}>
              <rect width="150" height="100" fill={st.base} />
              {st.render && st.render(150, 100)}
            </svg>
            <div style={{ fontSize: 10, marginTop: 2, fontFamily: 'sans-serif' }}>{st.kind}: {st.name}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontFamily: 'sans-serif', marginTop: 30 }}>Sobre base oscura</h2>
      <Row title="Cabeza (oscuro)" field="headAcc" options={HEAD_ACCESSORIES} extra={DARK_BASE} />
      <Row title="Cuello (oscuro)" field="neckAcc" options={NECK_ACCESSORIES} extra={DARK_BASE} />
      <Row title="Cara (oscuro)" field="extraAcc" options={EXTRA_ACCESSORIES} extra={DARK_BASE} />
      <Row title="Patrones (oscuro)" field="pattern" options={PATTERNS} extra={DARK_BASE} />
      <Row title="Orejas (oscuro)" field="ears" options={EARS} extra={DARK_BASE} />
    </div>
  );
}

const DARK_BASE = {
  bodyColor: '#3D3A44', innerColor: '#8E8299',
  accentColor: '#C9A227', accentAlt: '#A7A9AC', eyeColor: '#C9A227',
};
