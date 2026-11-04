// Píxeles dibujados a mano para los tamaños chicos de la cara (donde un
// procedimiento deja formas feas): la mochi en el cuarto, en las
// miniaturas del diseñador. Los tamaños grandes los arma bigFace.js.
//
//   k tinta   w blanco   e color (iris / labios / pico)   E e aclarado
//   r boca por dentro   p lengua   t lágrima   . nada

// Ojos (el izquierdo; la luz viene de arriba a la izquierda). Clave: alto.
export const SMALL_EYES = {
  redondos: {
    2: 'kk kk',
    3: 'kk kk kk',
    4: '.k. kwk kkk .k.',
    5: '.kk. kwkk kwkk keek .kk.',
    6: '.kkk. kwwkk kwwkk kkkkk keeek .kkk.',
    7: '.kkkk. kwwkkk kwwkkk kkkkkk keeeek keeeek .kkkk.',
    8: '..kkk.. .kwwkk. kkwwkkk kkkkkkk keeeeek keeeewk .kEEEk. ..kkk..',
    9: '..kkkk.. .kkkkkk. kwwkkkkk kwwkkkkk kkkkkkkk kkeeeekk kkeeeewk .kEEEEk. ..kkkk..',
    10: '..kkkk.. .kkkkkk. kwwwkkkk kwwwkkkk kwwkkkkk kkkkkkkk kkeeeekk keeeeewk .kEEEEk. ..kkkk..',
    11: '..kkkkk.. .kkkkkkk. kwwwkkkkk kwwwkkkkk kwwkkkkkk kkkkkkkkk kkkkkkkkk kkeeeeekk kkeeeeewk .kkEEEkk. ..kkkkk..',
    12: '...kkkk... .kkkkkkkk. kkwwwkkkkk kwwwwkkkkk kwwwkkkkkk kkkkkkkkkk kkkkkkkkkk kkkkkkkkkk kkkeeeeekk kkeeeeeewk .kkEEEEkk. ...kkkk...',
  },
  puntitos: {
    2: 'kk kk',
    3: 'kk kk kk',
    4: '.kk. kwkk kkkk .kk.',
    5: '.kk. kwkk kkkk kkkk .kk.',
    6: '.kkk. kwkkk kkkkk kkkkk kkkkk .kkk.',
  },
  corazon: {
    4: 'k.k kek .k.',
    5: '.k.k. kekek keeek .kek. ..k..',
    6: '.kk.kk. kwekeek keeeeek .keeek. ..kek.. ...k...',
    7: '.kk.kk. kwekeek keeeeek keeeeek .keeek. ..kek.. ...k...',
    8: '.kkk.kkk. kweekeeek kweeeeeek keeeeeeek .keeeeek. ..keeek.. ...kek... ....k....',
    9: '.kkk.kkk. kweekeeek kweeeeeek keeeeeeek keeeeeeek .keeeeek. ..keeek.. ...kek... ....k....',
  },
  // ^ cerrado y feliz. Clave: ancho.
  feliz: {
    4: '.kk. k..k',
    5: '.kkk. k...k',
    6: '.kkkk. k....k',
    7: '..kkk.. .k...k. k.....k',
    8: '..kkkk.. .k....k. k......k',
    9: '..kkkkk.. .kk...kk. kk.....kk',
    10: '...kkkk... .kkkkkkkk. kk......kk k........k',
  },
  // ∪ dormido. Clave: ancho.
  dormido: {
    4: 'k..k .kk.',
    5: 'k...k .kkk.',
    6: 'k....k .kkkk.',
    7: 'k.....k .k...k. ..kkk..',
    8: 'k......k .k....k. ..kkkk..',
    9: 'kk.....kk .kk...kk. ..kkkkk..',
    10: 'k........k kk......kk .kkkkkkkk. ...kkkk...',
  },
  // ⊙ sorprendido (ojo blanco y pupila chiquita). Clave: alto.
  sorprendido: {
    3: '.k. kwk .k.',
    4: '.kk. kwwk kwwk .kk.',
    5: '.kkk. kwwwk kwkwk kwwwk .kkk.',
    6: '.kkk. kwwwk kwkwk kwkwk kwwwk .kkk.',
    7: '..kk.. .kwwk. kwwwwk kwkkwk kwkkwk .kwwk. ..kk..',
    8: '..kk.. .kwwk. kwwwwk kwkkwk kwkkwk kwwwwk .kwwk. ..kk..',
    9: '..kkkk.. .kwwwwk. kwwwwwwk kwwkkwwk kwwkkwwk kwwwwwwk kwwwwwwk .kwwwwk. ..kkkk..',
  },
};

// Bocas. Claves: ancho (o ancho×alto).
export const SMALL_MOUTHS = {
  // ∪ (la de ceño es la misma dada vuelta)
  smile: {
    3: 'k.k .k.',
    4: 'k..k .kk.',
    5: 'k...k .kkk.',
    6: 'k....k .kkkk.',
    7: 'k.....k .kkkkk.',
    8: 'k......k .kkkkkk.',
    9: 'k.......k .kk...kk. ...kkk...',
    10: 'k........k .kk....kk. ...kkkk...',
    11: 'k.........k .kk.....kk. ...kkkkk...',
    12: 'k..........k .kk......kk. ...kkkkkk...',
  },
  // sonrisa con dos colmillitos (blancos, con su borde de tinta)
  fangs: {
    5: 'k...k .kkk. kw.wk .k.k.',
    6: 'k....k .kkkk. kw..wk .k..k.',
    7: 'k.....k .kkkkk. .kw.wk. ..k.k..',
    8: 'k......k .kkkkkk. .kw..wk. ..k..k..',
    9: 'k.......k .kk...kk. ..kkkkk.. ..kw.wk.. ...k.k...',
    10: 'k........k .kk....kk. ...kkkk... ..kw..wk.. ...k..k...',
    11: 'k.........k .kk.....kk. ...kkkkk... ..kww.wwk.. ...kk.kk... ....k.k....',
  },
  // sonrisa con un dientito al medio
  tooth: {
    5: 'k...k .kkk. .kwk. ..k..',
    6: 'k....k .kkkk. .kwwk. ..kk..',
    7: 'k.....k .kkkkk. ..kwk.. ...k...',
    8: 'k......k .kkkkkk. ..kwwk.. ...kk...',
    9: 'k.......k .kk...kk. ..kkkkk.. ...kwk... ...kwk... ....k....',
    10: 'k........k .kk....kk. ...kkkk... ...kwwk... ...kwwk... ....kk....',
    11: 'k.........k .kk.....kk. ...kkkkk... ....kwk.... ....kwk.... .....k.....',
  },
  // boca abierta de feliz: arriba la línea, adentro rojo y la lengua
  open: {
    '4x2': 'kkkk .kk.',
    '4x3': 'kkkk kppk .kk.',
    '5x3': 'kkkkk krprk .kkk.',
    '6x3': 'kkkkkk krpprk .kkkk.',
    '7x3': 'kkkkkkk krrprrk .kkkkk.',
    '7x4': 'kkkkkkk krrrrrk .kpppk. ..kkk..',
    '8x4': 'kkkkkkkk krrrrrrk .kppppk. ..kkkk..',
    '9x4': 'kkkkkkkkk krrrrrrrk .kpppppk. ..kkkkk..',
    '10x4': 'kkkkkkkkkk krrrrrrrrk .krpppprk. ..kkkkkk..',
    '10x5': 'kkkkkkkkkk krrrrrrrrk krpppppprk .kppppppk. ..kkkkkk..',
  },
  // o chiquita (sorpresa)
  o: {
    '3x3': '.k. krk .k.',
    '3x4': '.k. krk krk .k.',
    '4x4': '.kk. krrk krrk .kk.',
    '4x5': '.kk. krrk krrk kppk .kk.',
    '5x5': '.kkk. krrrk krrrk kpppk .kkk.',
    '5x6': '.kkk. krrrk krrrk krrrk kpppk .kkk.',
  },
  smirk: {
    4: '...k kkk.',
    5: '....k kkkk.',
    6: '.....k kkkkk.',
    7: '......k .....k. kkkkk..',
    8: '.......k ......k. kkkkkk..',
  },
  lips: {
    5: '.e.e. errre .eee.',
    6: '.e..e. errrre .eeee.',
    7: '.ee.ee. errrrre .eEeee.',
    8: '.ee..ee. eeeeeeee errrrrre .eEeeee.',
    9: '.eee.eee. eeeeeeeee errrrrrre .eEeeeee. ..eeeee..',
  },
  shout: {
    5: '.kkk. kwwwk krrrk kkkkk',
    6: '.kkkk. kwwwwk krrrrk kkkkkk',
    7: '.kkkkk. kwwwwwk krrrrrk krrrrrk .kkkkk.',
    8: '.kkkkkk. kwwwwwwk krrrrrrk krrrrrrk .kkkkkk.',
  },
  tri: {
    4: 'kkkk krrk .kk.',
    5: 'kkkkk krrrk .kpk. ..k..',
    6: 'kkkkkk krrrrk .kppk. ..kk..',
    7: 'kkkkkkk krrrrrk .kpppk. ..kkk..',
    8: 'kkkkkkkk krrrrrrk .krpprk. ..kppk.. ...kk...',
  },
  kiss: {
    3: 'kk. ..k .k. ..k kk.',
    4: 'kk. ..k .k. ..k kk.',
    5: 'kkk. ...k ..k. ...k kkk.',
    6: 'kkk. ...k ...k ..k. ...k ...k kkk.',
  },
  pout: {
    3: '.e. ere .e.',
    4: '.ee. erre .ee.',
    5: '.eee. errre .eee.',
    6: '.eeee. eerree eeeeee .eeee.',
  },
  // pico de pollito: la parte de arriba más clara y grande, la de abajo
  // asoma en punta (contorno café: data-ink)
  beak: {
    5: 'kkkkk kEEEk .kek. ..k..',
    7: '..kkk.. .kEEEk. kEEEEEk .kkkkk. ..kek.. ...k...',
    9: '..kkkkk.. .kEEEEEk. kEEEEEEEk .kkkkkkk. ..keeek.. ...kkk...',
    11: '...kkkkk... .kkEEEEEkk. kEEEEEEEEEk .kkkkkkkkk. ..kkeeekk.. ....kkk....',
  },
  beakOpen: {
    5: '.kkk. kEEEk krrrk .kek. ..k..',
    7: '..kkk.. .kEEEk. kEEEEEk .krrrk. .keeek. ..kkk..',
    9: '..kkkkk.. .kEEEEEk. kEEEEEEEk .krrrrrk. .krrrrrk. ..keeek.. ...kkk...',
    11: '...kkkkk... .kkEEEEEkk. kEEEEEEEEEk .krrrrrrrk. .krrrrrrrk. ..kkeeekk.. ....kkk....',
  },
};
