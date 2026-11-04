# Calculadora de pedidos · Tools for Pymes

Página: https://danielherrodri.github.io/calculadora-pedidos/

Para negocios que venden por catálogo. Cada negocio sube su lista de productos en Excel (o CSV) y arma pedidos buscando con abreviaturas o por voz; ve el total y lo copia o lo manda por WhatsApp. El catálogo y los pedidos se guardan solo en el navegador de quien la usa; no hay servidor.

## Archivos

- `index.html`: la página. Lee Excel con SheetJS (se carga desde cdnjs solo al subir o descargar un archivo).
- `buscador.js`: búsqueda por texto y por voz: compara por sonido en español, tolera faltas de ortografía y errores del dictado, entiende cantidades habladas y varios productos por frase. Usa la columna «Abreviaturas» de cada catálogo.

## Formato del Excel

Columnas (la plantilla de la página ya las trae): Producto*, Presentación (sabor, tamaño), Precio*, Categoría, Clave o SKU, Abreviaturas o apodos, Imagen (URL), Enlace (URL). Los títulos pueden variar («Nombre», «Descripción», «Código», «Precio de venta»…); la página los reconoce. Al subir una versión nueva, los productos cuyo precio cambió muestran «Precio modificado recientemente» durante 14 días.
