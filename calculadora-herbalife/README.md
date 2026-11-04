# Calculadora Herbalife

Página: https://danielherrodri.github.io/calculadora-herbalife/

Calculadora de pedido con los precios públicos (con IVA) de herbalife.com/es-mx. Busca con abreviaturas o por voz, elige cantidades con + y − y ve el total. Proyecto independiente, sin relación con Herbalife.

## Archivos

- `index.html`: la página (HTML, CSS y JavaScript sin dependencias). Lee `productos.json` al abrir.
- `buscador.js`: búsqueda por texto y por voz. Compara por sonido en español, tolera faltas de ortografía y errores del dictado, entiende cantidades habladas y varios productos por frase.
- `productos.json`: los productos. Cada uno tiene `s` (SKU), `n` (nombre), `d` (sabor y tamaño), `p` (precio), `c` (categoría), `u` (ruta en herbalife.com), `k` (abreviaturas para la búsqueda) e `img` (si hay foto). Cuando un precio cambia se guardan `a` (precio anterior) y `f` (fecha del cambio). La página muestra «Precio modificado recientemente» durante 14 días.
- `img/<sku>.webp`: fotos de producto.
- `actualizar.py`: revisa herbalife.com/es-mx y actualiza `productos.json` y las fotos. Solo escribe si algo cambió. Si la consulta falla o trae muy pocos productos, no toca nada.

## Actualizar a mano

```
python3 calculadora-herbalife/actualizar.py
```

Si hubo cambios, haz commit y push a `main`; GitHub Pages publica en uno o dos minutos. Una tarea programada lo hace cada mañana.
