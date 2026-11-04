# Calculadora de precios · Tools for Pymes

Página: https://danielherrodri.github.io/calculadora-precios/

Para negocios que venden por catálogo. Cada negocio sube su lista de productos en Excel (o CSV) y arma pedidos buscando con abreviaturas o por voz; ve el total y lo copia o lo manda por WhatsApp. El catálogo y los pedidos se guardan solo en el navegador de quien la usa; no hay servidor.

## Archivos

- `index.html`: la página. Lee Excel con SheetJS (se carga desde cdnjs solo al subir o descargar un archivo).
- `buscador.js`: búsqueda por texto y por voz: compara por sonido en español, tolera faltas de ortografía y errores del dictado, entiende cantidades habladas y varios productos por frase. Usa la columna «Abreviaturas» de cada catálogo.

## Formato del Excel

Columnas (la plantilla de la página ya las trae): Producto*, Presentación (sabor, tamaño), Precio*, Categoría, Clave o SKU, Abreviaturas o apodos, Imagen (URL), Enlace (URL). Los títulos pueden variar («Nombre», «Descripción», «Código», «Precio de venta»…); la página los reconoce. Al subir una versión nueva, los productos cuyo precio cambió muestran «Precio modificado recientemente» durante 14 días.

## Estilos (Tailwind CSS)

Los estilos están hechos con Tailwind CSS 3 y los colores de Nexo como variables CSS. El código fuente está en `src/estilos.css` y la configuración en `tailwind.config.js`; la página usa el archivo ya compilado `estilos.css`, así que GitHub Pages no necesita ningún paso de compilación. Si cambias clases en `index.html` o en `src/estilos.css`, vuelve a compilar desde la raíz del repo:

```
npx tailwindcss@3.4.17 -c calculadora-precios/tailwind.config.js -i calculadora-precios/src/estilos.css -o calculadora-precios/estilos.css --minify
```
