// ─────────────────────────────────────────────────────────────────
// Estilos / modas.
//
// Regalar una mascota a tu pareja no es solo "hacer algo cute". Hay
// gente gótica, rockera, metalera, deportista, hippie, de princesa…
// Cada estilo de aquí es un punto de partida de un toque: aplica una
// paleta coherente y un conjunto de piezas que van juntas. Después
// todo se sigue pudiendo cambiar pieza por pieza.
//
// `likes` no filtra ni esconde nada: solo hace que las piezas que
// pegan con el estilo elegido salgan primero en cada lista.
// ─────────────────────────────────────────────────────────────────

export const PET_STYLES = [
  {
    id: 'kawaii',
    label: 'Kawaii',
    hint: 'Pastel, dulce y redondito',
    swatch: ['#FFD3E0', '#D8697F', '#FFF1E4'],
    recipe: {
      body: 'redondo', ears: 'gato', eyes: 'grandes', mouth: 'w', cheeks: 'redondos',
      pattern: 'ninguno', tail: 'gato', headAcc: 'mono', neckAcc: 'ninguno', extraAcc: 'ninguno',
      bodyColor: '#FFD3E0', innerColor: '#FFF1E4', accentColor: '#D8697F', accentAlt: '#FFFFFF', eyeColor: '#5B3E5C',
    },
    likes: {
      ears: ['gato', 'conejo', 'oso', 'raton'], eyes: ['grandes', 'redondos', 'corazon'],
      mouth: ['w', 'sonrisa'], cheeks: ['redondos', 'corazon'], pattern: ['corazones', 'lunares'],
      headAcc: ['mono', 'diadema', 'gorro'], neckAcc: ['collar', 'pajarita'], extraAcc: ['pecas', 'curita'],
      tail: ['gato', 'lazo', 'corta'],
    },
  },
  {
    id: 'gotico',
    label: 'Gótico',
    hint: 'Oscuro, elegante y con encaje',
    swatch: ['#463F52', '#2A2530', '#9B6BD6'],
    recipe: {
      body: 'redondo', ears: 'murcielago', eyes: 'delineados', mouth: 'ladeada', cheeks: 'sombras',
      pattern: 'ninguno', tail: 'demonio', headAcc: 'monoCalavera', neckAcc: 'choker', extraAcc: 'lagrima',
      bodyColor: '#463F52', innerColor: '#B9A9C9', accentColor: '#2A2530', accentAlt: '#9B6BD6', eyeColor: '#B14AED',
    },
    likes: {
      ears: ['murcielago', 'gato', 'lobo'], eyes: ['delineados', 'pestanudos', 'rebelde'],
      mouth: ['ladeada', 'colmillos', 'labios'], cheeks: ['sombras', 'ninguno'],
      pattern: ['calaveras', 'ninguno'], headAcc: ['monoCalavera', 'bruja', 'cuernos', 'flequillo'],
      neckAcc: ['choker', 'capa', 'medallon'], extraAcc: ['lagrima', 'lunar', 'piercings'],
      tail: ['demonio', 'gato'],
    },
  },
  {
    id: 'rockero',
    label: 'Rockero',
    hint: 'Cuero, bandana y actitud',
    swatch: ['#5A5560', '#B0453F', '#231F2B'],
    recipe: {
      body: 'gordito', ears: 'lobo', eyes: 'rebelde', mouth: 'ladeada', cheeks: 'ninguno',
      pattern: 'ninguno', tail: 'puas', headAcc: 'bandana', neckAcc: 'pinchos', extraAcc: 'piercings',
      bodyColor: '#5A5560', innerColor: '#D8CFC7', accentColor: '#B0453F', accentAlt: '#231F2B', eyeColor: '#2E2422',
    },
    likes: {
      ears: ['lobo', 'gato', 'murcielago'], eyes: ['rebelde', 'delineados', 'cruzados'],
      mouth: ['ladeada', 'colmillos', 'grito'], cheeks: ['ninguno', 'sombras'],
      pattern: ['rayos', 'calaveras', 'cuadros'], headAcc: ['bandana', 'cresta', 'flequillo', 'audifonos'],
      neckAcc: ['pinchos', 'cadena', 'choker'], extraAcc: ['piercings', 'gafasol', 'parche'],
      tail: ['puas', 'demonio'],
    },
  },
  {
    id: 'metalero',
    label: 'Metalero',
    hint: 'Negro total, púas y corpse paint',
    swatch: ['#D8CFC7', '#151217', '#8E1F2C'],
    recipe: {
      body: 'gordito', ears: 'dragon', eyes: 'cruzados', mouth: 'grito', cheeks: 'ninguno',
      pattern: 'ninguno', tail: 'puas', headAcc: 'cuernos', neckAcc: 'pinchos', extraAcc: 'corpse',
      // El corpse paint es negro sobre cara pálida: con el cuerpo negro
      // no se vería nada, así que este preset va con base hueso.
      bodyColor: '#D8CFC7', innerColor: '#B0A39A', accentColor: '#151217', accentAlt: '#A7A9AC', eyeColor: '#8E1F2C',
    },
    likes: {
      ears: ['dragon', 'murcielago', 'lobo'], eyes: ['cruzados', 'rebelde', 'delineados'],
      mouth: ['grito', 'colmillos', 'ladeada'], cheeks: ['ninguno', 'sombras'],
      pattern: ['calaveras', 'rayos'], headAcc: ['cuernos', 'cresta', 'cachos', 'flequillo'],
      neckAcc: ['pinchos', 'cadena'], extraAcc: ['corpse', 'piercings', 'parche'],
      tail: ['puas', 'demonio'],
    },
  },
  {
    id: 'punk',
    label: 'Punk',
    hint: 'Cresta, neón y cuadros',
    swatch: ['#3D3A44', '#C6FF3D', '#FF3E6C'],
    recipe: {
      body: 'ovalado', ears: 'gato', eyes: 'cruzados', mouth: 'colmillos', cheeks: 'ninguno',
      pattern: 'cuadros', tail: 'puas', headAcc: 'cresta', neckAcc: 'pinchos', extraAcc: 'ninguno',
      bodyColor: '#3D3A44', innerColor: '#C6FF3D', accentColor: '#C6FF3D', accentAlt: '#231F2B', eyeColor: '#FF3E6C',
    },
    likes: {
      ears: ['gato', 'lobo', 'murcielago'], eyes: ['cruzados', 'rebelde'],
      mouth: ['colmillos', 'grito', 'ladeada'], cheeks: ['ninguno', 'rayitas'],
      pattern: ['cuadros', 'rayos', 'calaveras'], headAcc: ['cresta', 'bandana', 'audifonos'],
      neckAcc: ['pinchos', 'cadena', 'choker'], extraAcc: ['piercings', 'curita', 'gafasol'],
      tail: ['puas', 'corta'],
    },
  },
  {
    id: 'princesa',
    label: 'Princesa',
    hint: 'Tiara, capa y pestañas largas',
    swatch: ['#FFD3E0', '#C3A7EA', '#C9A227'],
    recipe: {
      body: 'ovalado', ears: 'conejo', eyes: 'pestanudos', mouth: 'labios', cheeks: 'redondos',
      pattern: 'ninguno', tail: 'lazo', headAcc: 'tiara', neckAcc: 'capa', extraAcc: 'ninguno',
      bodyColor: '#FFD3E0', innerColor: '#FFFFFF', accentColor: '#C3A7EA', accentAlt: '#C9A227', eyeColor: '#3E6B8C',
    },
    likes: {
      ears: ['conejo', 'gato', 'oveja'], eyes: ['pestanudos', 'grandes', 'corazon'],
      mouth: ['labios', 'sonrisa', 'w'], cheeks: ['brillos', 'redondos'],
      pattern: ['corazones', 'estrellas', 'flores'], headAcc: ['tiara', 'corona', 'diadema', 'flores'],
      neckAcc: ['capa', 'medallon', 'collar'], extraAcc: ['brillos', 'lunar', 'pecas'],
      tail: ['lazo', 'esponjosa'],
    },
  },
  {
    id: 'rustico',
    label: 'Rústico',
    hint: 'Campo, cuadros y tonos tierra',
    swatch: ['#D9A05B', '#7E8C61', '#8B5E3C'],
    recipe: {
      body: 'pera', ears: 'oveja', eyes: 'redondos', mouth: 'hocico', cheeks: 'alargados',
      pattern: 'ninguno', tail: 'esponjosa', headAcc: 'vaquero', neckAcc: 'panuelo', extraAcc: 'pecas',
      bodyColor: '#D9A05B', innerColor: '#F6EFE6', accentColor: '#7E8C61', accentAlt: '#8B5E3C', eyeColor: '#5E8873',
    },
    likes: {
      ears: ['oveja', 'perro', 'cerdito', 'oso'], eyes: ['redondos', 'somnolientos', 'puntitos'],
      mouth: ['hocico', 'sonrisa', 'w'], cheeks: ['alargados', 'redondos'],
      pattern: ['cuadros', 'flores', 'manchas'], headAcc: ['vaquero', 'flores', 'gorro'],
      neckAcc: ['panuelo', 'collar', 'lei'], extraAcc: ['pecas', 'curita'],
      tail: ['esponjosa', 'corta', 'rizada'],
    },
  },
  {
    id: 'hippie',
    label: 'Hippie',
    hint: 'Tie-dye, flores y paz',
    swatch: ['#8FDCB3', '#FF9E1F', '#B14AED'],
    recipe: {
      body: 'nube', ears: 'gato', eyes: 'somnolientos', mouth: 'sonrisa', cheeks: 'redondos',
      pattern: 'tiedye', tail: 'rizada', headAcc: 'bandana', neckAcc: 'lei', extraAcc: 'lentes',
      bodyColor: '#8FDCB3', innerColor: '#FFF6DC', accentColor: '#FF9E1F', accentAlt: '#B14AED', eyeColor: '#5E8873',
    },
    likes: {
      ears: ['gato', 'conejo', 'oveja'], eyes: ['somnolientos', 'redondos', 'estrella'],
      mouth: ['sonrisa', 'w', 'lengua'], cheeks: ['redondos', 'rayitas'],
      pattern: ['tiedye', 'flores', 'estrellas'], headAcc: ['flores', 'bandana', 'diadema'],
      neckAcc: ['lei', 'medallon', 'panuelo'], extraAcc: ['lentes', 'pecas', 'brillos'],
      tail: ['rizada', 'esponjosa'],
    },
  },
  {
    id: 'deportista',
    label: 'Deportista',
    hint: 'Gorra, medalla y camuflaje',
    swatch: ['#9DCEEF', '#3D5AFE', '#FF3E6C'],
    recipe: {
      body: 'gordito', ears: 'perro', eyes: 'redondos', mouth: 'colmillos', cheeks: 'ninguno',
      pattern: 'ninguno', tail: 'corta', headAcc: 'gorra', neckAcc: 'medalla', extraAcc: 'eyeblack',
      bodyColor: '#9DCEEF', innerColor: '#FFFFFF', accentColor: '#3D5AFE', accentAlt: '#FF3E6C', eyeColor: '#3E6B8C',
    },
    likes: {
      ears: ['perro', 'lobo', 'zorro'], eyes: ['redondos', 'rebelde', 'grandes'],
      mouth: ['colmillos', 'sonrisa', 'grito'], cheeks: ['rayitas', 'ninguno'],
      pattern: ['camuflaje', 'rayas', 'rayos'], headAcc: ['gorra', 'bandana', 'audifonos'],
      neckAcc: ['medalla', 'cadena', 'collar'], extraAcc: ['eyeblack', 'curita', 'gafasol'],
      tail: ['corta', 'puas'],
    },
  },
  {
    id: 'aesthetic',
    label: 'Aesthetic',
    hint: 'Suave, brillitos y boina',
    swatch: ['#E3D6FA', '#F582A7', '#FFFFFF'],
    recipe: {
      body: 'nube', ears: 'gato', eyes: 'delineados', mouth: 'sonrisa', cheeks: 'alargados',
      pattern: 'ninguno', tail: 'rizada', headAcc: 'boina', neckAcc: 'medallon', extraAcc: 'brillos',
      bodyColor: '#E3D6FA', innerColor: '#FFF1E4', accentColor: '#F582A7', accentAlt: '#FFFFFF', eyeColor: '#7A4A8C',
    },
    likes: {
      ears: ['gato', 'koala', 'conejo', 'alas'], eyes: ['delineados', 'pestanudos', 'estrella'],
      mouth: ['sonrisa', 'labios', 'w'], cheeks: ['brillos', 'alargados'],
      pattern: ['estrellas', 'corazones', 'flores'], headAcc: ['boina', 'diadema', 'flores', 'aureola'],
      neckAcc: ['medallon', 'panuelo', 'choker'], extraAcc: ['brillos', 'lunar', 'pecas'],
      tail: ['rizada', 'lazo'],
    },
  },
  {
    id: 'y2k',
    label: 'Y2K',
    hint: 'Neón, cadenas y audífonos',
    swatch: ['#FF6FD8', '#B14AED', '#C6FF3D'],
    recipe: {
      body: 'bombon', ears: 'alas', eyes: 'estrella', mouth: 'ladeada', cheeks: 'brillos',
      pattern: 'ninguno', tail: 'lazo', headAcc: 'audifonos', neckAcc: 'cadena', extraAcc: 'gafasol',
      bodyColor: '#FF6FD8', innerColor: '#F0E6FB', accentColor: '#B14AED', accentAlt: '#C6FF3D', eyeColor: '#2BE8E8',
    },
    likes: {
      ears: ['alas', 'gato', 'unicornio'], eyes: ['estrella', 'corazon', 'delineados'],
      mouth: ['ladeada', 'labios', 'w'], cheeks: ['brillos', 'corazon'],
      pattern: ['lunares', 'estrellas', 'rayos'], headAcc: ['audifonos', 'diadema', 'tiara'],
      neckAcc: ['cadena', 'choker', 'collar'], extraAcc: ['gafasol', 'brillos', 'piercings'],
      tail: ['lazo', 'rizada'],
    },
  },
  {
    id: 'extravagante',
    label: 'Extravagante',
    hint: 'Glam total: plumas, capa y corona',
    swatch: ['#B14AED', '#FF3E6C', '#C9A227'],
    recipe: {
      body: 'bombon', ears: 'unicornio', eyes: 'pestanudos', mouth: 'labios', cheeks: 'brillos',
      pattern: 'ninguno', tail: 'esponjosa', headAcc: 'corona', neckAcc: 'capa', extraAcc: 'ninguno',
      bodyColor: '#B14AED', innerColor: '#FFE8EE', accentColor: '#FF3E6C', accentAlt: '#C9A227', eyeColor: '#FF3E6C',
    },
    likes: {
      ears: ['unicornio', 'alas', 'dragon'], eyes: ['pestanudos', 'estrella', 'corazon'],
      mouth: ['labios', 'grito', 'ladeada'], cheeks: ['brillos', 'corazon'],
      pattern: ['estrellas', 'leopardo', 'tiedye'], headAcc: ['corona', 'tiara', 'flores', 'aureola'],
      neckAcc: ['capa', 'lei', 'medallon'], extraAcc: ['brillos', 'antifaz', 'lunar'],
      tail: ['esponjosa', 'lazo'],
    },
  },
  {
    id: 'elegante',
    label: 'Elegante',
    hint: 'Biblioteca vieja, corbata y lentes',
    swatch: ['#8B5E3C', '#4A1F2B', '#C9A227'],
    recipe: {
      body: 'ovalado', ears: 'perro', eyes: 'redondos', mouth: 'sonrisa', cheeks: 'ninguno',
      pattern: 'ninguno', tail: 'gato', headAcc: 'sombrero', neckAcc: 'corbata', extraAcc: 'lentes',
      bodyColor: '#8B5E3C', innerColor: '#EADFCB', accentColor: '#4A1F2B', accentAlt: '#C9A227', eyeColor: '#8B5E3C',
    },
    likes: {
      ears: ['perro', 'gato', 'zorro'], eyes: ['redondos', 'somnolientos', 'delineados'],
      mouth: ['sonrisa', 'ladeada', 'hocico'], cheeks: ['ninguno', 'alargados'],
      pattern: ['cuadros', 'ninguno', 'rayas'], headAcc: ['sombrero', 'boina', 'vaquero'],
      neckAcc: ['corbata', 'pajarita', 'medallon'], extraAcc: ['lentes', 'lunar', 'pecas'],
      tail: ['gato', 'rizada'],
    },
  },
  {
    id: 'angelical',
    label: 'Angelical',
    hint: 'Blanco, aureola y alitas',
    swatch: ['#FFFFFF', '#FFE270', '#CFE8FA'],
    recipe: {
      body: 'nube', ears: 'alas', eyes: 'grandes', mouth: 'w', cheeks: 'redondos',
      pattern: 'ninguno', tail: 'esponjosa', headAcc: 'aureola', neckAcc: 'medallon', extraAcc: 'brillos',
      bodyColor: '#FFFFFF', innerColor: '#FFF6DC', accentColor: '#FFE270', accentAlt: '#8FC7EE', eyeColor: '#3E6B8C',
    },
    likes: {
      ears: ['alas', 'conejo', 'oveja'], eyes: ['grandes', 'corazon', 'estrella'],
      mouth: ['w', 'sonrisa'], cheeks: ['redondos', 'brillos'],
      pattern: ['estrellas', 'ninguno'], headAcc: ['aureola', 'flores', 'corona'],
      neckAcc: ['medallon', 'capa', 'collar'], extraAcc: ['brillos', 'pecas'],
      tail: ['esponjosa', 'lazo'],
    },
  },
];

export function findStyle(id) {
  return PET_STYLES.find((s) => s.id === id) || null;
}

// Aplica el estilo sobre la receta actual. Reemplaza todo lo visual
// para que el resultado se vea coherente de una vez.
export function applyStyle(recipe, styleId) {
  const s = findStyle(styleId);
  if (!s) return recipe;
  return { ...recipe, ...s.recipe };
}

// Ordena las opciones de una lista poniendo primero las que pegan con
// el estilo activo. No esconde nada: todo lo demás sigue detrás.
export function orderForStyle(options, field, styleId) {
  const s = findStyle(styleId);
  const liked = s && s.likes && s.likes[field];
  if (!liked || !liked.length) return options;
  const rank = (id) => {
    const i = liked.indexOf(id);
    return i === -1 ? liked.length + 1 : i;
  };
  return [...options].sort((a, b) => rank(a.id) - rank(b.id));
}
