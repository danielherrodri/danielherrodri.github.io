/* Buscador de la Calculadora de pedidos: texto y voz.
 *
 * Tolera abreviaturas, faltas de ortografía y errores del dictado:
 * - Compara por sonido en español (v/b, c/s/z, ll/y, h muda, qu/k, g/j…).
 * - Acepta palabras con 1 o 2 letras distintas (según su largo).
 * - Usa las abreviaturas y apodos que cada negocio pone en su catálogo.
 * - Une palabras que el dictado separa («coca cola» → cocacola).
 * - En voz ignora muletillas y palabras de relleno, entiende cantidades
 *   («dos», «un par de», «media docena», «veintitrés», «x3») y varios productos por frase.
 * Funciona en el navegador (window.HLFBuscador) y en Node (module.exports) para pruebas.
 */
(function (raiz) {
  'use strict';

  /* ---------- texto ---------- */
  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
  }

  // Clave fonética para español (y marcas en inglés dichas en español).
  function fon(w) {
    w = norm(w).replace(/ /g, '');
    if (!w) return '';
    if (/^\d+$/.test(w)) return w;
    w = w.replace(/ph/g, 'f').replace(/sh/g, 'ch').replace(/ch/g, 'X').replace(/th/g, 't').replace(/ck/g, 'k')
      .replace(/qu/g, 'k').replace(/gu([ei])/g, 'G$1').replace(/g([ei])/g, 'j$1').replace(/G/g, 'g')
      .replace(/c([ei])/g, 's$1').replace(/c/g, 'k').replace(/z/g, 's').replace(/x/g, 'ks')
      .replace(/v/g, 'b').replace(/w/g, 'u').replace(/h/g, '').replace(/ll/g, 'y')
      .replace(/y(?![aeiou])/g, 'i').replace(/oo/g, 'u').replace(/ee/g, 'i')
      .replace(/([a-z])\1+/g, '$1').replace(/X/g, 'ch');
    return w;
  }

  function lev(a, b, max) {
    var la = a.length, lb = b.length;
    if (Math.abs(la - lb) > max) return max + 1;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= lb; j++) prev[j] = j;
    for (i = 1; i <= la; i++) {
      cur = [i]; var minFila = i;
      for (j = 1; j <= lb; j++) {
        var c = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + c);
        if (i > 1 && j > 1 && a.charCodeAt(i - 1) === b.charCodeAt(j - 2) && a.charCodeAt(i - 2) === b.charCodeAt(j - 1)) {
          cur[j] = Math.min(cur[j], prev[j - 2] + 1);
        }
        if (cur[j] < minFila) minFila = cur[j];
      }
      if (minFila > max) return max + 1;
      prev = cur;
    }
    return prev[lb];
  }

  function subseq(t, w) {
    if (t.charAt(0) !== w.charAt(0)) return false;
    var j = 0;
    for (var i = 0; i < w.length && j < t.length; i++) if (w.charAt(i) === t.charAt(j)) j++;
    return j === t.length;
  }

  /* ---------- números ---------- */
  var UNIDADES = { cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9,
    diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19,
    veinte: 20, veintiuno: 21, veintiun: 21, veintiuna: 21, veintidos: 22, veintitres: 23, veinticuatro: 24, veinticinco: 25,
    veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29, cien: 100 };
  var DECENAS = { treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90 };

  // Lee un número en toks[i]; devuelve {v, n} (valor y cuántas palabras usó) o null.
  function leerNumero(toks, i) {
    var t = toks[i];
    if (t == null) return null;
    if (/^\d{1,3}$/.test(t)) return { v: parseInt(t, 10), n: 1 };
    var m = /^x(\d{1,3})$/.exec(t);
    if (m) return { v: parseInt(m[1], 10), n: 1 };
    if (t === 'par' || (t === 'un' && toks[i + 1] === 'par')) return { v: 2, n: t === 'un' ? 2 : 1 };
    if (t === 'media' && toks[i + 1] === 'docena') return { v: 6, n: 2 };
    if (t === 'docena' || (t === 'una' && toks[i + 1] === 'docena')) return { v: 12, n: t === 'una' ? 2 : 1 };
    if (UNIDADES[t] != null) return { v: UNIDADES[t], n: 1 };
    if (DECENAS[t] != null) {
      if (toks[i + 1] === 'y' && UNIDADES[toks[i + 2]] != null && UNIDADES[toks[i + 2]] < 10) {
        return { v: DECENAS[t] + UNIDADES[toks[i + 2]], n: 3 };
      }
      return { v: DECENAS[t], n: 1 };
    }
    return null;
  }

  /* ---------- palabras que no buscan ---------- */
  var VACIAS = lista('de del la el los las con sabor y and a al en para por favor porfa porfavor lo le me mi of the');
  var RELLENO = lista('quiero quisiera queria dame deme damelo ponme pon poner agrega agregame agregar anade anademe anadir ' +
    'necesito ocupo seria serian tambien ademas otro otra otros otras mas este esta ese esa eh em mmm pues bueno ok okey ' +
    'oye ah buscar busca buscame dime cuanto cuesta cuestan precio vale valen tienes tienen hay ' +
    'bote botes frasco frascos pieza piezas caja cajas paquete paquetes unidad unidades producto productos lata latas ' +
    'bolsa bolsas pote potes tarro tarros envase envases cantidad');
  var UNIDAD = lista('bote botes frasco frascos pieza piezas caja cajas paquete paquetes unidad unidades lata latas bolsa bolsas pote potes');
  function lista(s) { var o = {}; s.split(' ').forEach(function (w) { o[w] = 1; }); return o; }

  /* ---------- cómo se dicen los productos ----------
   * Cada negocio pone sus abreviaturas y apodos en la columna «Abreviaturas» del catálogo.
   * Aquí solo quedan sinónimos generales de presentaciones. */
  var ALIAS_NOMBRE = [];
  var ALIAS_SABOR = [
    [/chico|chica|pequeno|pequena/, 'chico chica pequeno pequena mini'],
    [/grande/, 'grande jumbo familiar'],
    [/mediano|mediana/, 'mediano mediana regular'],
    [/litro/, 'litro lt l'],
    [/kilo|kg/, 'kilo kg'],
    [/pieza|pza/, 'pieza pza unidad']
  ];

  /* ---------- índice ---------- */
  function indexar(p) {
    var nombre = norm(p.n), detalle = norm(p.d);
    var aliasNombre = [], aliasSabor = [];
    ALIAS_NOMBRE.forEach(function (a) { if (a[0].test(nombre)) aliasNombre.push(a[1]); });
    ALIAS_SABOR.forEach(function (a) { if (a[0].test(detalle)) aliasSabor.push(a[1]); });
    var vistas = {}, voc = [];
    function agrega(texto, esNombre) {
      norm(texto).split(' ').forEach(function (w) {
        if (!w || vistas[w] || VACIAS[w]) return;
        vistas[w] = 1;
        voc.push({ w: w, f: fon(w), n: esNombre });
      });
    }
    // Lo que nombra al producto pesa un poco más que el sabor o el tamaño.
    agrega(nombre + ' ' + aliasNombre.join(' '), true);
    agrega(detalle + ' ' + aliasSabor.join(' ') + ' ' + (p.k || ''), false);
    // Nombres juntos: «herbal aloe» → «herbalaloe», «lift off» dicho como una palabra, etc.
    var pal = nombre.split(' ');
    for (var i = 0; i + 1 < pal.length; i++) {
      var j = pal[i] + pal[i + 1];
      if (!vistas[j]) { vistas[j] = 1; voc.push({ w: j, f: fon(j), n: true }); }
    }
    p._voc = voc;
    p._ini = nombre.split(' ').map(function (w) { return w.charAt(0); }).join('');
    p._sk = String(p.s).toLowerCase();
    p._largo = (nombre + ' ' + detalle).split(' ').length;
    var sabor = norm(String(p.d || '').split('·')[0]);
    p._sabor = sabor && !/^\d/.test(sabor) && String(p.d || '').indexOf('·') > 0 ? [sabor] : [];
    return p;
  }

  // Prueba también el singular: «aloes» → aloe, «nueces» → nuez, «batidos» → batido.
  function puntajePalabra(t, p) {
    var s = puntajeForma(t, p);
    if (s >= 3 || t.length < 4 || /^\d/.test(t)) return s;
    var formas = [];
    if (/ces$/.test(t)) formas.push(t.slice(0, -3) + 'z');
    if (/es$/.test(t)) formas.push(t.slice(0, -2));
    if (/s$/.test(t)) formas.push(t.slice(0, -1));
    for (var i = 0; i < formas.length; i++) s = Math.max(s, puntajeForma(formas[i], p) - 0.05);
    return s;
  }
  function puntajeForma(t, p) {
    if (!t) return 0;
    if (p._sk === t) return 6;
    var tf = fon(t), mejor = 0, num = /^\d+$/.test(t);
    for (var i = 0; i < p._voc.length; i++) {
      var v = p._voc[i], k = v.n ? 1.15 : 1, s = 0;
      if (v.w === t) s = 3;
      else if (num) continue;
      else if (tf && v.f === tf) s = 2.6;
      else if (t.length >= 2 && v.w.indexOf(t) === 0) s = t.length >= 3 ? 2.2 : 2;
      else if (tf.length >= 3 && v.f.indexOf(tf) === 0) s = 1.8;
      else {
        var max = tf.length >= 7 ? 2 : tf.length >= 4 ? 1 : 0;
        if (max && v.f.length >= 3) {
          var d = lev(tf, v.f, max);
          if (d <= max) s = 1.6 - 0.3 * d;
        }
        if (!s && t.length >= 2 && subseq(t, v.w)) s = 1;
      }
      if (s * k > mejor) mejor = s * k;
    }
    if (!num && t.length >= 2 && p._ini.indexOf(t) === 0) mejor = Math.max(mejor, 2);
    return mejor;
  }

  // Puntúa un producto contra las palabras de la consulta.
  // estricto: todas las palabras deben coincidir (texto). Si no, se toleran palabras sueltas (voz).
  function puntuar(toks, p, estricto) {
    var suma = 0, hechas = 0, fallas = 0, i = 0;
    while (i < toks.length) {
      var s1 = puntajePalabra(toks[i], p);
      if (i + 1 < toks.length) {
        var junto = puntajePalabra(toks[i] + toks[i + 1], p);
        var s2 = puntajePalabra(toks[i + 1], p);
        if (junto >= 2.6 && junto * 2 > s1 + s2 + 0.5) { suma += junto * 2; hechas += 2; i += 2; continue; }
      }
      if (s1 > 0) { suma += s1; hechas++; }
      else if (estricto) return null;
      else fallas++;
      i++;
    }
    if (!hechas) return null;
    if (!estricto) {
      if (hechas < Math.ceil(toks.length / 2)) return null;
      suma -= fallas * 0.7;
    }
    return suma - p._largo * 0.01;
  }

  function palabrasTexto(q) {
    return norm(q).split(' ').filter(function (t) { return t && !VACIAS[t]; }).map(function (t) {
      return UNIDADES[t] != null && UNIDADES[t] < 30 ? String(UNIDADES[t]) : t;
    });
  }

  function buscar(productos, q, cat) {
    var toks = palabrasTexto(q);
    if (!toks.length) return [];
    var out = [];
    productos.forEach(function (p) {
      if (cat && cat !== 'Todos' && p.c !== cat) return;
      var s = puntuar(toks, p, true);
      if (s != null) out.push({ p: p, score: s });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out;
  }

  /* ---------- voz ---------- */
  var SEPARA = lista('y mas tambien ademas luego despues aparte');

  function buscarVoz(productos, toks) {
    var limpias = toks.filter(function (t) { return !VACIAS[t] && !RELLENO[t]; }).map(function (t) {
      return UNIDADES[t] != null && UNIDADES[t] < 30 ? String(UNIDADES[t]) : t;
    });
    if (!limpias.length) return { toks: limpias, res: [] };
    var res = [];
    productos.forEach(function (p) {
      var s = puntuar(limpias, p, false);
      if (s != null) res.push({ p: p, score: s });
    });
    res.sort(function (a, b) { return b.score - a.score; });
    return { toks: limpias, res: res };
  }

  // Lee una parte de la frase: cantidad + producto.
  function leerParte(productos, toks) {
    toks = toks.filter(function (t) { return !RELLENO[t] || UNIDAD[t]; });
    var qty = null, n;
    // cantidad al inicio: «dos aloe», «un par de batidos», «x3 liftoff»
    n = leerNumero(toks, 0);
    if (n && toks.length > n.n) {
      var resto = toks.slice(n.n);
      // «uno» suelto antes de un nombre puede ser parte del nombre («fórmula uno»): solo cuenta si es el inicio
      qty = n.v; toks = resto;
    }
    // cantidad al final: «aloe mango por dos», «liftoff x3», «aloe tres piezas»
    if (qty == null && toks.length > 1) {
      var L = toks.length;
      if (UNIDAD[toks[L - 1]] && L >= 3) {
        n = leerNumero(toks, L - 2);
        if (n && n.n === 1) { qty = n.v; toks = toks.slice(0, L - 2); }
      }
      if (qty == null && (toks[L - 2] === 'por' || toks[L - 2] === 'x')) {
        n = leerNumero(toks, L - 1);
        if (n) { qty = n.v; toks = toks.slice(0, L - 2); }
      }
      if (qty == null && /^x\d{1,3}$/.test(toks[L - 1])) { qty = parseInt(toks[L - 1].slice(1), 10); toks = toks.slice(0, L - 1); }
    }
    toks = toks.filter(function (t) { return !UNIDAD[t]; });
    var b = buscarVoz(productos, toks);
    var top = b.res[0], seg = b.res[1];
    var parte = { texto: toks.join(' '), qty: qty == null ? 1 : Math.max(1, Math.min(999, qty)), res: b.res };
    if (!top) { parte.tipo = 'nada'; return parte; }
    var margen = seg ? top.score - seg.score : 99;
    if (top.score >= 2.4 && margen < 0.75) {
      // Empate entre presentaciones del mismo sabor (p. ej. 473 ml y 1.892 L, o Batido y Sport):
      // si nadie dijo la presentación, se elige la más común (la de menor precio) y se ofrecen las otras.
      var cerca = b.res.filter(function (r) { return r.score >= top.score - 0.75; });
      var sabor = top.p._sabor.join(' ');
      if (sabor && cerca.length <= 3 && cerca.every(function (r) { return r.p._sabor.join(' ') === sabor; })) {
        cerca.sort(function (x, y) { return x.p.p - y.p.p; });
        parte.tipo = 'seguro'; parte.p = cerca[0].p; parte.score = top.score;
        parte.otras = cerca.slice(1).map(function (r) { return r.p; });
        return parte;
      }
    }
    if (top.score >= 2.4 && margen >= 0.75) { parte.tipo = 'seguro'; parte.p = top.p; }
    else if (top.score >= 1.5) {
      parte.tipo = 'dudoso';
      parte.opciones = b.res.filter(function (r) { return r.score >= top.score - 1.2; }).slice(0, 6).map(function (r) { return r.p; });
    } else { parte.tipo = 'nada'; parte.opciones = b.res.slice(0, 3).map(function (r) { return r.p; }); }
    parte.score = top.score;
    return parte;
  }

  function valorParte(x) { return x.tipo === 'seguro' ? 3 + x.score : x.tipo === 'dudoso' ? 1 : -2; }

  // Interpreta una frase dictada. Devuelve [{tipo, p?, qty, opciones?, texto}].
  function interpretar(productos, frase) {
    var trozos = String(frase || '').split(/[,;.]+/).map(norm).filter(Boolean).map(function (tr) {
      // «treinta y dos» → 32 antes de separar por «y»
      return tr.replace(/\b(treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa) y (un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)\b/g,
        function (m, d, u) { return String(DECENAS[d] + UNIDADES[u]); });
    });
    var segmentos = [];
    trozos.forEach(function (tr) {
      var toks = tr.split(' '), act = [];
      for (var i = 0; i < toks.length; i++) {
        if (SEPARA[toks[i]] && act.length) { segmentos.push(act); act = []; continue; }
        if (SEPARA[toks[i]]) continue;
        act.push(toks[i]);
      }
      if (act.length) segmentos.push(act);
    });
    // Une partes que solo tienen sentido juntas («naranja y guaraná», «treinta y dos aloe»)
    var partes = [], i = 0;
    while (i < segmentos.length) {
      var a = leerParte(productos, segmentos[i]);
      // Si la parte siguiente empieza con cantidad («… y un aloe»), es otro producto: no se une.
      // (Salvo «treinta y dos», que es un solo número.)
      var sig = segmentos[i + 1];
      var empiezaConCantidad = sig && leerNumero(sig, 0) != null && !DECENAS[segmentos[i][segmentos[i].length - 1]];
      if (i + 1 < segmentos.length && !empiezaConCantidad) {
        var b = leerParte(productos, segmentos[i + 1]);
        var unido = leerParte(productos, segmentos[i].concat(['y'], segmentos[i + 1]));
        var mismo = a.tipo === 'seguro' && b.tipo === 'seguro' && a.p === b.p && leerNumero(segmentos[i + 1], 0) == null;
        // Solo se unen si la segunda parte aporta palabras que sí coinciden con el producto unido.
        var aporta = unido.score > Math.max(a.score || 0, b.score || 0) + 1;
        if (unido.tipo === 'seguro' && (mismo || (aporta && valorParte(unido) > valorParte(a) + valorParte(b) - 0.5 &&
            !(a.tipo === 'seguro' && b.tipo === 'seguro' && a.p !== b.p)))) {
          partes.push(unido); i += 2; continue;
        }
      }
      // «dos batidos de fresa y tres de vainilla»: si una parte no dice el producto, usa el de la parte anterior.
      var ant = partes[partes.length - 1];
      if (a.tipo !== 'seguro' && ant && ant.tipo === 'seguro') {
        var conContexto = leerParte(productos, segmentos[i].concat(norm(ant.p.n).split(' ')));
        if (conContexto.tipo === 'seguro' && conContexto.p !== ant.p) {
          conContexto.texto = a.texto; conContexto.qty = a.qty; a = conContexto;
        }
      }
      partes.push(a); i++;
    }
    return partes.filter(function (x) { return x.texto || x.tipo !== 'nada'; });
  }

  // Elige la mejor entre varias transcripciones del dictado.
  function interpretarMejor(productos, alternativas) {
    var mejor = null, mejorVal = -Infinity, mejorTexto = '';
    alternativas.forEach(function (alt, k) {
      var partes = interpretar(productos, alt);
      var val = partes.reduce(function (s, x) { return s + valorParte(x); }, 0) - k * 0.15;
      if (val > mejorVal) { mejorVal = val; mejor = partes; mejorTexto = alt; }
    });
    return { partes: mejor || [], texto: mejorTexto };
  }

  var api = { norm: norm, fon: fon, lev: lev, indexar: indexar, buscar: buscar, interpretar: interpretar, interpretarMejor: interpretarMejor, leerNumero: leerNumero };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else raiz.CPBuscador = api;
})(typeof window !== 'undefined' ? window : this);
