// ─────────────────────────────────────────────────────────────────
// Recordatorio diario sin servidor de notificaciones: un evento que se
// repite todos los días, en un archivo .ics que el teléfono abre con su
// calendario ("Agregar al calendario"). Es lo único que funciona igual en
// iPhone y Android sin pedir permisos ni montar notificaciones push.
// ─────────────────────────────────────────────────────────────────

const pad = (n) => String(n).padStart(2, '0');
const localStamp = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const utcStamp = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
// RFC 5545: comas, punto y coma, barras y saltos de línea van escapados.
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
// …y ninguna línea pasa de 75 bytes (las largas siguen con un espacio;
// se cuentan bytes y no letras porque "í" ocupa dos).
function fold(line) {
  const enc = new TextEncoder();
  const out = [];
  let cur = '', bytes = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (bytes + n > 74) { out.push(cur); cur = ` ${ch}`; bytes = 1 + n; } else { cur += ch; bytes += n; }
  }
  out.push(cur);
  return out.join('\r\n');
}

// El texto del calendario: todos los días a `hour`:`minute`, empezando
// hoy si todavía no pasó la hora y si no, mañana.
export function reminderIcs({ petName, url, slug = 'mascota', hour = 20, minute = 0, now = new Date() }) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
  if (start <= now) start.setDate(start.getDate() + 1);
  const end = new Date(start.getTime() + 15 * 60000);
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tamagift//Recordatorio//ES', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:tamagift-${slug}-${hour}${pad(minute)}@tamagift`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART:${localStamp(start)}`,
    `DTEND:${localStamp(end)}`,
    'RRULE:FREQ=DAILY',
    `SUMMARY:${esc(`Visitar a ${petName}`)}`,
    `DESCRIPTION:${esc(`${petName} te está esperando: ${url}`)}`,
    `URL:${url}`,
    'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', `DESCRIPTION:${esc(`${petName} te está esperando`)}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}

// Descarga el .ics (el teléfono ofrece agregarlo a su calendario).
export function downloadReminder(opts) {
  const blob = new Blob([reminderIcs(opts)], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `recordatorio-${(opts.petName || 'mascota').toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, '-')}.ics`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
}
