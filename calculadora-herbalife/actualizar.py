#!/usr/bin/env python3
"""Actualiza productos.json y las fotos de la calculadora con herbalife.com/es-mx.

Uso: python3 calculadora-herbalife/actualizar.py

- Lee el mapa de productos de herbalife.com/es-mx y el precio público (con IVA) de cada uno.
- Cambia el precio de los productos que ya existen y guarda el anterior en "a" con la fecha en "f".
- Agrega productos nuevos (con su foto) y quita los que ya no están en la tienda.
- Conserva los nombres, sabores, categorías y abreviaturas que ya están en productos.json.
- Solo escribe archivos si algo cambió. Imprime un resumen y termina con código 0.
  Si la consulta falla o devuelve muy pocos productos, no toca nada y termina con código 1.

Solo usa la biblioteca estándar de Python 3.
"""
import concurrent.futures
import datetime
import json
import os
import re
import sys
import urllib.request
from zoneinfo import ZoneInfo

AQUI = os.path.dirname(os.path.abspath(__file__))
ARCHIVO = os.path.join(AQUI, 'productos.json')
CARPETA_IMG = os.path.join(AQUI, 'img')
SITEMAP = 'https://www.herbalife.com/es-mx/products_sitemap.xml'
PREFIJO = 'https://www.herbalife.com/es-mx/u/products/'
IMG_URL = 'https://www.herbalife.com/dmassets{ruta}:tile-w405h566?fmt=webp-alpha'
UA = {'User-Agent': 'Mozilla/5.0 (calculadora-herbalife; +https://danielherrodri.github.io/calculadora-herbalife/)',
      'Accept-Language': 'es-MX'}
MINIMO_PRODUCTOS = 50
CATEGORIAS = {
    'batidos': 'Batidos', 'nutricion-diaria': 'Batidos', 'composicion-corporal': 'Proteína y snacks',
    'cuidado-personal': 'Cuidado personal', 'nutricion-especifica': 'Suplementos',
    'rendimiento-deportivo': 'Deporte', 'rendimiento-fisico': 'Proteína y snacks', 'tes-y-bebidas': 'Aloe y tés',
}
ORDEN = ['Batidos', 'Aloe y tés', 'Proteína y snacks', 'Deporte', 'Suplementos', 'Cuidado personal']


def descargar(url, binario=False):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        datos = r.read()
    return datos if binario else datos.decode('utf-8', 'replace')


def buscar_producto(nodo, encontrados, profundidad=0):
    if profundidad > 30:
        return
    if isinstance(nodo, dict):
        precio = nodo.get('price')
        if isinstance(precio, dict) and 'centAmount' in precio and nodo.get('sku') and nodo.get('name'):
            encontrados.append(nodo)
        for v in nodo.values():
            buscar_producto(v, encontrados, profundidad + 1)
    elif isinstance(nodo, list):
        for v in nodo:
            buscar_producto(v, encontrados, profundidad + 1)


def leer_pagina(url):
    html = descargar(url)
    m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.S)
    if not m:
        return None
    encontrados = []
    buscar_producto(json.loads(m.group(1)), encontrados)
    if not encontrados:
        return None
    p = encontrados[0]
    nombre = p['name'].get('es-MX') if isinstance(p['name'], dict) else p['name']
    sku = str(p['sku'])
    imgs = [x for x in dict.fromkeys(re.findall(r'/market-reusable-assets/[\w/\-.%]*?\.(?:png|jpg|jpeg|webp)', html, re.I))
            if sku.lower() in x.lower() and 'canister' in x.lower()]
    return {
        'sku': sku,
        'precio': p['price']['centAmount'],
        'moneda': p['price'].get('currencyCode'),
        'nombre': (nombre or '').replace(' | Herbalife México', '').strip(),
        'categoria': CATEGORIAS.get(p.get('category_name') or '', 'Suplementos'),
        'slug': url[len(PREFIJO):],
        'img': imgs[0] if imgs else None,
        'comprable': p.get('isPurchasable', True),
    }


def foto(sku, ruta):
    destino = os.path.join(CARPETA_IMG, sku.lower() + '.webp')
    if os.path.exists(destino) or not ruta:
        return os.path.exists(destino)
    try:
        datos = descargar(IMG_URL.format(ruta=ruta), binario=True)
    except Exception as e:  # noqa: BLE001
        print(f'  sin foto para {sku}: {e}')
        return False
    if datos[:4] != b'RIFF':
        print(f'  la foto de {sku} no es WebP; no se guardó')
        return False
    os.makedirs(CARPETA_IMG, exist_ok=True)
    with open(destino, 'wb') as f:
        f.write(datos)
    return True


def main():
    hoy = datetime.datetime.now(ZoneInfo('America/Mexico_City')).date().isoformat()
    with open(ARCHIVO, encoding='utf-8') as f:
        actual = json.load(f)
    por_sku = {p['s']: p for p in actual['productos']}

    try:
        urls = re.findall(r'<loc>([^<]+)</loc>', descargar(SITEMAP))
    except Exception as e:  # noqa: BLE001
        print(f'No pude leer el mapa de productos: {e}')
        return 1
    urls = [u for u in urls if u.startswith(PREFIJO)]

    tienda, errores = {}, []
    with concurrent.futures.ThreadPoolExecutor(6) as ex:
        for url, res in zip(urls, ex.map(lambda u: _seguro(leer_pagina, u), urls)):
            if isinstance(res, Exception) or res is None:
                errores.append(url)
            elif res['moneda'] in (None, 'MXN') and res['comprable']:
                tienda[res['sku']] = res

    if len(tienda) < MINIMO_PRODUCTOS or len(errores) > len(urls) * 0.2:
        print(f'Consulta incompleta: {len(tienda)} productos leídos, {len(errores)} páginas con error. No cambio nada.')
        return 1

    cambios, nuevos, quitados = [], [], []
    for sku, t in tienda.items():
        p = por_sku.get(sku)
        if p is None:
            p = {'s': sku, 'n': t['nombre'], 'd': '', 'p': t['precio'], 'c': t['categoria'], 'u': t['slug'], 'k': ''}
            por_sku[sku] = p
            nuevos.append(f"{sku} {t['nombre']} ${t['precio']}")
        else:
            if p['p'] != t['precio']:
                cambios.append(f"{sku} {p['n']} {p['d']}: ${p['p']} → ${t['precio']}")
                p['a'], p['f'], p['p'] = p['p'], hoy, t['precio']
            if p['u'] != t['slug']:
                p['u'] = t['slug']
        p['img'] = foto(sku, t['img'])

    if len(errores) == 0:
        for sku in list(por_sku):
            if sku not in tienda:
                quitados.append(f"{sku} {por_sku[sku]['n']} {por_sku[sku]['d']}")
                del por_sku[sku]

    if not (cambios or nuevos or quitados):
        print(f'Sin cambios: {len(tienda)} productos revisados el {hoy}.')
        return 0

    productos = sorted(por_sku.values(), key=lambda p: (ORDEN.index(p['c']) if p['c'] in ORDEN else 99, p['n'], p['d']))
    salida = {'fecha': hoy, 'revisados': len(tienda), 'productos': productos}
    with open(ARCHIVO, 'w', encoding='utf-8') as f:
        json.dump(salida, f, ensure_ascii=False, indent=0, separators=(',', ':'))
        f.write('\n')

    print(f'Cambios del {hoy}:')
    for titulo, lista in (('Precios', cambios), ('Nuevos', nuevos), ('Ya no están', quitados)):
        if lista:
            print(f'{titulo} ({len(lista)}):')
            for x in lista:
                print('  ' + x)
    return 0


def _seguro(fn, *args):
    try:
        return fn(*args)
    except Exception as e:  # noqa: BLE001
        return e


if __name__ == '__main__':
    sys.exit(main())
