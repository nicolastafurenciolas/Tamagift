// ─────────────────────────────────────────────────────────────────
// Los estilos visuales de Tamagift.
//
// Un estilo no es solo una paleta: decide los colores y la letra de la
// interfaz, cómo se redibuja cada sprite (styles/spriteEngine.js), cómo
// se mueve la mascota (motion) y cómo suena todo (sound.js).
//
// Quien regala elige uno en el asistente; quien recibe lo puede cambiar
// desde el juego. Si no hay ninguno guardado, manda DEFAULT_STYLE.
//
// Los colores de `ui` llenan las mismas claves que `C` en theme.js, así
// que todo componente que ya usaba C.rose, C.ink, etc. cambia solo.
// ─────────────────────────────────────────────────────────────────

export const DEFAULT_STYLE = 'pixel';

// Claves de color que TODOS los estilos deben definir. theme.js genera
// una variable CSS por cada una (--pg-c-<clave>).
export const COLOR_KEYS = [
  'paper', 'paperDeep', 'surface', 'surfaceAlt',
  'ink', 'inkSoft', 'inkFaint',
  'rose', 'roseDeep', 'roseSoft',
  'sage', 'sageDeep', 'sageSoft',
  'amber', 'amberSoft',
  'sky', 'skySoft',
  'lavender', 'lavenderSoft',
  'peach',
  'line', 'lineSoft',
  // texto sobre un botón de color, fondo de los modales y superficies
  // semitransparentes que van encima de la escena
  'onAccent', 'overlay', 'glass', 'track',
  // fondos de escena (baño, tableros de minijuegos)
  'sky1', 'sky2', 'ground1', 'ground2', 'road1', 'road2',
  'water1', 'water2', 'board1', 'board2', 'grid',
];

const STYLES = [
  {
    id: 'pixel',
    name: 'Pixel art',
    tagline: 'Como un juego de bolsillo de 16 bits',
    fonts: { display: "'Pixelify Sans', 'Courier New', monospace", body: "'Pixelify Sans', 'Courier New', monospace", hand: "'Pixelify Sans', monospace" },
    dark: false,
    ui: {
      paper: '#F4E9D4', paperDeep: '#E6D2AE', surface: '#FFF8EA', surfaceAlt: '#FBEBCF',
      ink: '#2B1D2E', inkSoft: '#665062', inkFaint: '#A6909C',
      rose: '#EF5A80', roseDeep: '#A8345A', roseSoft: '#FFD3DE',
      sage: '#38B184', sageDeep: '#21765A', sageSoft: '#C8F1DD',
      amber: '#F3A428', amberSoft: '#FFE6AE',
      sky: '#4A9FEA', skySoft: '#CFE7FF',
      lavender: '#8E6FE0', lavenderSoft: '#E4D9FF',
      peach: '#FF925E',
      line: '#CDB38C', lineSoft: '#E3CFAD',
      onAccent: '#FFFFFF', overlay: 'rgba(43,29,46,0.62)', glass: 'rgba(255,248,234,0.9)', track: '#E2CBA3',
      sky1: '#8FD3FF', sky2: '#D4F0FF', ground1: '#7CC46A', ground2: '#5DA556', road1: '#5A5266', road2: '#4A4356',
      water1: '#9FDBFF', water2: '#D8F2FF', board1: '#E9DCC1', board2: '#F6EDDA', grid: 'rgba(43,29,46,0.08)',
    },
    shadow: {
      soft: '3px 3px 0 rgba(43,29,46,0.22)',
      lifted: '5px 5px 0 rgba(43,29,46,0.28)',
      pressed: 'inset 2px 2px 0 rgba(43,29,46,0.18)',
      glowRose: '4px 4px 0 #A8345A',
      glowSage: '4px 4px 0 #21765A',
    },
    // Lado del "píxel" de arte en px de pantalla. Todo el arte del juego
    // se redibuja sobre esta misma rejilla para que ningún sprite tenga
    // píxeles de distinto tamaño que su vecino.
    // 2 px de pantalla por píxel de arte: más resolución (la mochi del
    // cuarto tiene ~100 px de ancho) sin dejar de verse pixel art.
    art: { kind: 'pixel', pixel: 2 },
    motion: 'pixel',
    sound: 'chip',
  },
  {
    id: 'lofi',
    name: 'Lo-fi noche acogedora',
    tagline: 'Luz de lámpara, cielo de noche y calma',
    fonts: { display: "'Quicksand', system-ui, sans-serif", body: "'Nunito Sans', system-ui, sans-serif", hand: "'Caveat', cursive" },
    dark: true,
    ui: {
      paper: '#1E1930', paperDeep: '#161223', surface: '#2A2340', surfaceAlt: '#332A4C',
      ink: '#F3EAFB', inkSoft: '#BDB0D3', inkFaint: '#7F7499',
      rose: '#F29BB4', roseDeep: '#C46887', roseSoft: '#47324F',
      sage: '#8FCBAF', sageDeep: '#5C977D', sageSoft: '#2B403C',
      amber: '#FFC77E', amberSoft: '#4A3A30',
      sky: '#90B6F4', skySoft: '#2A3454',
      lavender: '#BFA2F4', lavenderSoft: '#382F57',
      peach: '#F6AE8C',
      line: '#463B63', lineSoft: '#382F52',
      onAccent: '#24182E', overlay: 'rgba(8,6,16,0.72)', glass: 'rgba(42,35,64,0.88)', track: '#3B3157',
      sky1: '#1C2448', sky2: '#3A3466', ground1: '#3D4A5E', ground2: '#323C4E', road1: '#2A2638', road2: '#221F2F',
      water1: '#2C3A66', water2: '#3E4A7A', board1: '#2A2340', board2: '#322A4B', grid: 'rgba(243,234,251,0.06)',
    },
    shadow: {
      soft: '0 6px 18px rgba(0,0,0,0.35)',
      lifted: '0 12px 30px rgba(0,0,0,0.45)',
      pressed: 'inset 0 2px 6px rgba(0,0,0,0.35)',
      glowRose: '0 0 22px rgba(242,155,180,0.35)',
      glowSage: '0 0 22px rgba(143,203,175,0.3)',
    },
    art: { kind: 'lofi' },
    motion: 'calm',
    sound: 'lofi',
  },
  {
    id: 'retro',
    name: 'Retro setentero',
    tagline: 'Mostaza, naranja y caricatura de los 70',
    fonts: { display: "'Righteous', system-ui, sans-serif", body: "'Nunito Sans', system-ui, sans-serif", hand: "'Righteous', cursive" },
    dark: false,
    ui: {
      paper: '#F3E1BB', paperDeep: '#E7CB95', surface: '#FCF2DC', surfaceAlt: '#F8E7C3',
      ink: '#4A2A1A', inkSoft: '#7A5236', inkFaint: '#B08E6B',
      rose: '#D9622A', roseDeep: '#9E4216', roseSoft: '#F6D2B4',
      sage: '#8C8F35', sageDeep: '#5E6119', sageSoft: '#E3E3B7',
      amber: '#E7AE30', amberSoft: '#F8E2A2',
      sky: '#3C8C86', skySoft: '#C7E1DA',
      lavender: '#B25476', lavenderSoft: '#EFCFD8',
      peach: '#E9945E',
      line: '#D6B783', lineSoft: '#E8D1A3',
      onAccent: '#FFF6E2', overlay: 'rgba(74,42,26,0.6)', glass: 'rgba(252,242,220,0.9)', track: '#E5C891',
      sky1: '#9ED1C9', sky2: '#F6DFAE', ground1: '#A4A447', ground2: '#868A2F', road1: '#6B4A35', road2: '#5A3D2B',
      water1: '#8CC6BE', water2: '#CFE6DD', board1: '#F1D9A5', board2: '#F8E8C4', grid: 'rgba(74,42,26,0.09)',
    },
    shadow: {
      soft: '4px 4px 0 rgba(74,42,26,0.85)',
      lifted: '6px 6px 0 rgba(74,42,26,0.9)',
      pressed: 'inset 2px 2px 0 rgba(74,42,26,0.4)',
      glowRose: '4px 4px 0 #9E4216',
      glowSage: '4px 4px 0 #5E6119',
    },
    art: { kind: 'retro' },
    motion: 'bouncy',
    sound: 'funk',
  },
  {
    id: 'papel',
    name: 'Papel recortado',
    tagline: 'Hecho con tijeras, pegamento y cartulina',
    fonts: { display: "'Patrick Hand', 'Comic Sans MS', cursive", body: "'Nunito Sans', system-ui, sans-serif", hand: "'Patrick Hand', cursive" },
    dark: false,
    ui: {
      paper: '#E7DAC0', paperDeep: '#D8C6A3', surface: '#FFFBF1', surfaceAlt: '#F7EEDC',
      ink: '#3D3229', inkSoft: '#75665A', inkFaint: '#A99A8B',
      rose: '#DD727C', roseDeep: '#A94F5B', roseSoft: '#F6D6D2',
      sage: '#68A595', sageDeep: '#47786B', sageSoft: '#D2E7DF',
      amber: '#E1AC48', amberSoft: '#F5E1B2',
      sky: '#6A9CC7', skySoft: '#D3E2EE',
      lavender: '#9A85C6', lavenderSoft: '#E1D9EF',
      peach: '#EC9A74',
      line: '#D3C3A6', lineSoft: '#E5D9C2',
      onAccent: '#FFFBF1', overlay: 'rgba(61,50,41,0.55)', glass: 'rgba(255,251,241,0.92)', track: '#DDCFB3',
      sky1: '#B9D6EA', sky2: '#E8F1F5', ground1: '#9CC48A', ground2: '#83B072', road1: '#77706A', road2: '#68625D',
      water1: '#AFD3EA', water2: '#DDEDF6', board1: '#EFE4CE', board2: '#F8F1E2', grid: 'rgba(61,50,41,0.07)',
    },
    shadow: {
      soft: '2px 3px 0 rgba(61,50,41,0.22), 0 6px 12px rgba(61,50,41,0.12)',
      lifted: '3px 5px 0 rgba(61,50,41,0.25), 0 12px 22px rgba(61,50,41,0.16)',
      pressed: 'inset 1px 2px 0 rgba(61,50,41,0.2)',
      glowRose: '2px 3px 0 #A94F5B',
      glowSage: '2px 3px 0 #47786B',
    },
    art: { kind: 'papel' },
    motion: 'stopmotion',
    sound: 'paper',
  },
  {
    id: 'neon',
    name: 'Neón nocturno',
    tagline: 'Luces que brillan en la oscuridad',
    fonts: { display: "'Orbitron', system-ui, sans-serif", body: "'Nunito Sans', system-ui, sans-serif", hand: "'Orbitron', sans-serif" },
    dark: true,
    ui: {
      paper: '#0B0718', paperDeep: '#06040E', surface: '#150E2B', surfaceAlt: '#1D1439',
      ink: '#F6EEFF', inkSoft: '#B9A8E0', inkFaint: '#6E5E99',
      rose: '#FF4FD8', roseDeep: '#C21FA3', roseSoft: '#3A1340',
      sage: '#3DFF9A', sageDeep: '#18B866', sageSoft: '#0E3325',
      amber: '#FFE84D', amberSoft: '#36310E',
      sky: '#4DE1FF', skySoft: '#0D2D3C',
      lavender: '#B57CFF', lavenderSoft: '#2A1A4D',
      peach: '#FF8A5C',
      line: '#3A2A66', lineSoft: '#2A1F4A',
      onAccent: '#0B0718', overlay: 'rgba(4,2,10,0.78)', glass: 'rgba(21,14,43,0.86)', track: '#2A1F4A',
      sky1: '#0D0826', sky2: '#24104A', ground1: '#13213A', ground2: '#0F1A2E', road1: '#120C24', road2: '#0C0819',
      water1: '#0E1E46', water2: '#1A2F66', board1: '#130C28', board2: '#1A1134', grid: 'rgba(181,124,255,0.14)',
    },
    shadow: {
      soft: '0 0 12px rgba(181,124,255,0.28)',
      lifted: '0 0 22px rgba(255,79,216,0.35)',
      pressed: 'inset 0 0 10px rgba(77,225,255,0.3)',
      glowRose: '0 0 18px rgba(255,79,216,0.7)',
      glowSage: '0 0 18px rgba(61,255,154,0.6)',
    },
    art: { kind: 'neon' },
    motion: 'neon',
    sound: 'synth',
  },
  {
    id: 'sticker',
    name: 'Sticker kawaii',
    tagline: 'Pegatinas tiernas con borde blanco',
    fonts: { display: "'Baloo 2', system-ui, sans-serif", body: "'Nunito Sans', system-ui, sans-serif", hand: "'Caveat', cursive" },
    dark: false,
    ui: {
      paper: '#E3F3EA', paperDeep: '#CFE9DA', surface: '#FFFFFF', surfaceAlt: '#F5FBF7',
      ink: '#5B3A47', inkSoft: '#8F6F7B', inkFaint: '#BCA4AE',
      rose: '#FF7AA6', roseDeep: '#DE4F85', roseSoft: '#FFE0EB',
      sage: '#56C496', sageDeep: '#35996F', sageSoft: '#D4F3E4',
      amber: '#FFBE45', amberSoft: '#FFEFC6',
      sky: '#62BDF0', skySoft: '#DBF0FD',
      lavender: '#B08DF2', lavenderSoft: '#EDE3FD',
      peach: '#FFA373',
      line: '#E6D5DC', lineSoft: '#F2E8EC',
      onAccent: '#FFFFFF', overlay: 'rgba(91,58,71,0.5)', glass: 'rgba(255,255,255,0.9)', track: '#F0E4E9',
      sky1: '#BDE6FB', sky2: '#EAF7FE', ground1: '#A9E2B6', ground2: '#8FD3A1', road1: '#8C8496', road2: '#7A7385',
      water1: '#C2E8FA', water2: '#E9F7FE', board1: '#F3FAF6', board2: '#FFFFFF', grid: 'rgba(91,58,71,0.06)',
    },
    shadow: {
      soft: '0 3px 0 #EBDCE2, 0 8px 18px rgba(91,58,71,0.12)',
      lifted: '0 5px 0 #E6D5DC, 0 14px 26px rgba(91,58,71,0.16)',
      pressed: 'inset 0 2px 5px rgba(91,58,71,0.14)',
      glowRose: '0 6px 20px rgba(255,122,166,0.4)',
      glowSage: '0 6px 20px rgba(86,196,150,0.38)',
    },
    art: { kind: 'sticker' },
    motion: 'jelly',
    sound: 'bubbly',
  },
];

export const STYLE_LIST = STYLES;
export const STYLE_IDS = STYLES.map((s) => s.id);

export function getStyle(id) {
  return STYLES.find((s) => s.id === id) || STYLES.find((s) => s.id === DEFAULT_STYLE);
}

export function isStyleId(id) {
  return STYLE_IDS.includes(id);
}
