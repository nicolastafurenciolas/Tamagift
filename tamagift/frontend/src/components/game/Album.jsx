import React, { useEffect, useState } from 'react';
import { C, FONT, SHADOW } from '../../theme';
import { Modal } from '../ui';
import { play } from '../../sound';
import { saveSnapshot, listSnapshots, getSnapshot, deleteSnapshot } from '../../api';

// ─────────────────────────────────────────────────────────────────
// La cámara y el álbum.
//   · PhotoModal: la foto recién tomada (polaroid) → guardarla en el
//     álbum, bajarla o compartirla.
//   · AlbumModal: todas las fotos; tocar una la abre en grande.
// Las fotos viven en el servidor (api.js): quien regaló también las ve.
// ─────────────────────────────────────────────────────────────────

const fileName = (petName) => `${(petName || 'mascota').toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, '-')}-${Date.now().toString(36)}.jpg`;

async function toFile(dataUrl, name) {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], name, { type: 'image/jpeg' });
}

export function downloadPhoto(dataUrl, petName) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName(petName);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Compartir con el menú del teléfono (WhatsApp, Instagram…). Si el
// navegador no deja compartir archivos, se baja.
export async function sharePhoto(dataUrl, petName) {
  try {
    const file = await toFile(dataUrl, fileName(petName));
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: petName });
      return 'shared';
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return 'cancel';
  }
  downloadPhoto(dataUrl, petName);
  return 'downloaded';
}
export const canShareFiles = () => typeof navigator !== 'undefined' && !!navigator.canShare;

function Polaroid({ src, alt, tilt = -1.5 }) {
  return (
    <div style={{ transform: `rotate(${tilt}deg)`, boxShadow: SHADOW.lifted || '0 6px 18px rgba(0,0,0,0.18)', borderRadius: 4, overflow: 'hidden', background: '#FFFDF8' }}>
      <img src={src} alt={alt} style={{ display: 'block', width: '100%', height: 'auto' }} />
    </div>
  );
}

const ERR = { 'muchas-fotos': 'Hoy ya guardaste muchas fotos. Mañana caben más.', 'muy-pesada': 'La foto quedó muy pesada para guardarla.', 'sin-conexion': 'No hay conexión: bájala para no perderla.' };

// `canSave`: el regalo está en el servidor (si no, solo bajar/compartir).
export function PhotoModal({ photo, slug, petName, giverName, canSave, onClose, onOpenAlbum }) {
  const [state, setState] = useState('nueva'); // nueva | guardando | guardada | error
  const [err, setErr] = useState('');
  async function save() {
    setState('guardando');
    const r = await saveSnapshot(slug, { image: photo.image, thumb: photo.thumb, caption: photo.caption });
    if (r.ok) { play('coin'); setState('guardada'); } else { play('bad'); setErr(ERR[r.error] || ERR['sin-conexion']); setState('error'); }
  }
  return (
    <Modal onClose={onClose} maxWidth={340} z={86}>
      <div className="pg-anim-pop" style={{ padding: '4px 6px 10px' }}><Polaroid src={photo.image} alt={`Foto de ${petName}`} /></div>
      {state === 'guardada' ? (
        <p style={{ fontFamily: FONT.display, fontSize: 13.5, fontWeight: 800, color: C.sageDeep || C.sage, margin: '6px 0 2px' }}>¡Guardada en el álbum!{giverName ? ` ${giverName} también la puede ver.` : ''}</p>
      ) : state === 'error' ? (
        <p style={{ fontSize: 12.5, color: C.rose, margin: '6px 0 2px' }}>{err}</p>
      ) : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
        {canSave && state !== 'guardada' && (
          <button onClick={save} disabled={state === 'guardando'} className="pg-btn pg-btn-rose pg-focus" style={{ padding: '11px 18px', fontSize: 14 }}>
            {state === 'guardando' ? 'Guardando…' : 'Guardar en el álbum'}
          </button>
        )}
        <div style={{ display: 'flex', gap: 7 }}>
          <button onClick={() => { play('pop'); sharePhoto(photo.image, petName); }} className="pg-btn pg-btn-ghost pg-focus" style={{ flex: 1, padding: '9px 10px', fontSize: 13 }}>{canShareFiles() ? 'Compartir' : 'Descargar'}</button>
          {canShareFiles() && <button onClick={() => { play('pop'); downloadPhoto(photo.image, petName); }} className="pg-btn pg-btn-ghost pg-focus" style={{ flex: 1, padding: '9px 10px', fontSize: 13 }}>Descargar</button>}
        </div>
        {canSave && state === 'guardada' && <button onClick={onOpenAlbum} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '9px 10px', fontSize: 13 }}>Ver el álbum</button>}
        <button onClick={onClose} className="pg-focus" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, color: C.inkSoft, padding: 6 }}>{state === 'guardada' ? 'Listo' : 'Descartar'}</button>
      </div>
    </Modal>
  );
}

// El álbum. `readOnly`: para el buzón de quien regaló (no borra).
export function AlbumGrid({ slug, petName, readOnly = false, empty }) {
  const [list, setList] = useState(null);
  const [open, setOpen] = useState(null); // { id, image, caption } | { id, loading }
  useEffect(() => {
    let alive = true;
    listSnapshots(slug).then((l) => { if (alive) setList(l || []); });
    return () => { alive = false; };
  }, [slug]);
  async function openOne(s) {
    play('pop');
    setOpen({ id: s.id, loading: true, thumb: s.thumb });
    const full = await getSnapshot(slug, s.id);
    setOpen(full ? { id: s.id, image: full.image } : null);
  }
  async function remove(id) {
    if (!(await deleteSnapshot(slug, id))) return;
    play('pop');
    setList((l) => l.filter((x) => x.id !== id));
    setOpen(null);
  }
  if (list === null) return <p style={{ fontSize: 13, color: C.inkFaint, textAlign: 'center' }}>Abriendo el álbum…</p>;
  if (!list.length) return <p style={{ fontSize: 13, color: C.inkSoft, textAlign: 'center', lineHeight: 1.4 }}>{empty || 'Todavía no hay fotos.'}</p>;
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
        {list.map((s, i) => (
          <button key={s.id} onClick={() => openOne(s)} className="pg-focus" aria-label={s.caption || 'Foto'} style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', transform: `rotate(${((i % 3) - 1) * 1.5}deg)` }}>
            <img src={s.thumb} alt={s.caption || 'Foto'} style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 3, boxShadow: '0 2px 6px rgba(0,0,0,0.18)' }} />
          </button>
        ))}
      </div>
      {open && (
        <Modal onClose={() => setOpen(null)} maxWidth={340} z={90}>
          <div style={{ padding: '4px 6px 10px' }}><Polaroid src={open.image || open.thumb} alt="Foto del álbum" tilt={0} /></div>
          {open.loading ? <p style={{ fontSize: 12.5, color: C.inkFaint, margin: 0 }}>Cargando la foto…</p> : (
            <div style={{ display: 'flex', gap: 7, marginTop: 6 }}>
              <button onClick={() => { play('pop'); sharePhoto(open.image, petName); }} className="pg-btn pg-btn-rose pg-focus" style={{ flex: 1, padding: '9px 10px', fontSize: 13 }}>{canShareFiles() ? 'Compartir' : 'Descargar'}</button>
              {!readOnly && <button onClick={() => remove(open.id)} className="pg-btn pg-btn-ghost pg-focus" style={{ padding: '9px 12px', fontSize: 13 }}>Borrar</button>}
            </div>
          )}
          <button onClick={() => setOpen(null)} className="pg-focus" style={{ marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: FONT.display, fontSize: 12.5, fontWeight: 700, color: C.inkSoft, padding: 6 }}>Cerrar</button>
        </Modal>
      )}
    </>
  );
}

export function AlbumModal({ slug, petName, giverName, onClose }) {
  return (
    <Modal onClose={onClose} maxWidth={380} z={84}>
      <h2 style={{ fontFamily: FONT.display, fontSize: 19, fontWeight: 800, color: C.ink, margin: '0 0 2px' }}>Álbum de {petName}</h2>
      <p style={{ fontSize: 12.5, color: C.inkSoft, margin: '0 0 12px', lineHeight: 1.35 }}>Las fotos que le tomas con la cámara.{giverName ? ` ${giverName} también las ve.` : ''}</p>
      <div style={{ maxHeight: '58vh', overflowY: 'auto', padding: '4px 2px' }}>
        <AlbumGrid slug={slug} petName={petName} empty="Todavía no hay fotos. Toca la cámara de arriba para tomar la primera." />
      </div>
      <button onClick={onClose} className="pg-btn pg-btn-ghost pg-focus" style={{ marginTop: 12, padding: '9px 24px', fontSize: 13 }}>Cerrar</button>
    </Modal>
  );
}
