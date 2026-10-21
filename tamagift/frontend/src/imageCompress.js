// ─────────────────────────────────────────────────────────────────
// Achicar fotos antes de guardarlas.
//
// Las fotos viajan y se guardan como data URL dentro de la fila de la
// mascota. Una foto de celular sin tocar pesa 3-5 MB (y un tercio más
// en base64): con unas cuantas, una sola mascota llenaba decenas de MB
// de la base y cada apertura del regalo los descargaba enteros.
//
// Aquí se reescalan al tamaño al que de verdad se ven y se recomprimen.
// Si la imagen tiene transparencia (un sticker PNG, por ejemplo) se
// queda en PNG para no rellenar el fondo de negro; si no, va a JPEG,
// que para fotos pesa una fracción.
// ─────────────────────────────────────────────────────────────────

// Fotos de pósters y rompecabezas: se ven a pantalla completa en un
// celular, ~400 px CSS x 3 de densidad.
export const PHOTO_MAX_SIDE = 1280;
// Íconos de comida: se ven pequeños dentro del juego.
export const FOOD_MAX_SIDE = 320;

const JPEG_QUALITY = 0.82;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('imagen-ilegible')); };
    img.src = url;
  });
}

function hasTransparency(ctx, w, h) {
  const data = ctx.getImageData(0, 0, w, h).data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve(ev.target.result);
    reader.onerror = () => reject(new Error('imagen-ilegible'));
    reader.readAsDataURL(file);
  });
}

// Devuelve un data URL listo para guardar, con el lado mayor <= maxSide.
// Si el navegador no logra decodificar la imagen (algún formato raro),
// cae al archivo tal cual: mejor una foto pesada que perderla.
export async function compressImageFile(file, maxSide = PHOTO_MAX_SIDE) {
  let img;
  try {
    img = await loadImage(file);
  } catch (e) {
    return readAsDataUrl(file);
  }

  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);

  // JPEG nunca tiene transparencia: no hace falta recorrer los píxeles.
  const mayHaveAlpha = file.type !== 'image/jpeg';
  if (mayHaveAlpha && hasTransparency(ctx, w, h)) {
    return canvas.toDataURL('image/png');
  }
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
}
