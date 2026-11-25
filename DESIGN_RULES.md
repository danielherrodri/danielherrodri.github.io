# Reglas de Diseño e Ingeniería · Portafolio `daniel.dev` (Sistema Herrodri)

Este documento define las reglas obligatorias de diseño visual, arquitectura de información, interacción, redacción y código para el portafolio de **Daniel Rodriguez Herrera** (`danielherrodri.github.io`). Cualquier IA o colaborador que edite, amplíe o cree nuevas páginas o casos de estudio debe cumplir estas especificaciones sin excepciones.

## 1. Principios rectores

1. **Estética técnica y editorial**: claridad antes que adorno. Cada bloque debe comunicar un problema real, una decisión técnica y un resultado verificable.

2. **Paleta intacta**: nunca reemplazar, suavizar ni introducir colores fuera de los tokens definidos en la Sección 2.

3. **Cero contenido redundante**: ningún proyecto o caso debe aparecer duplicado en dos secciones diferentes (por ejemplo, *Plumazo* vive una sola vez como destacado dentro de *Laboratorio*, no repetido en *Próximamente* y *Proyectos*).

4. **Cero tarjetas huérfanas**: si una grilla de 2 columnas tiene un número impar de casos (ej. 5), el caso principal debe ocupar todo el ancho (`grid-column: 1 / -1`) en formato horizontal destacado y el resto distribuirse en pares simétricos (`2 × N`).

5. **Privacidad y rigor**: nunca inventar métricas, clientes, fechas ni tecnologías. Todas las recreaciones de sistemas corporativos (BBVA, izzi) deben declarar explícitamente que usan datos ficticios.

## 2. Sistema de color (Inmutable)

### 2.1 Tokens de tema claro y oscuro

| Token CSS | Modo claro (`:root`) | Modo oscuro (`[data-theme="dark"]`) | Rol semántico obligatorio | 
| ----- | ----- | ----- | ----- | 
| `--bg` | `#f3f5f9` | `#0b0f15` | Fondo principal de la página | 
| `--surface` | `#ffffff` | `#131a23` | Superficie de tarjetas, barra superior y paneles | 
| `--surface-2` | `#f8fafd` | `#17202c` | Superficie secundaria (bloques destacados internos, botones sutiles) | 
| `--fg` | `#0f1520` | `#eaf0f6` | Texto principal y fondo del bloque invertido de Contacto | 
| `--muted` | `#566172` | `#9aa7b6` | Texto secundario, descripciones y metadatos | 
| `--line` | `#dbe0e8` | `#253040` | Bordes, divisores y contornos de tarjetas | 
| `--dot` | `#c4ccd7` | `#1f2935` | Patrón de grilla de puntos del fondo (`28px × 28px`) | 
| `--accent` | `#2457e6` | `#7ca4ff` | **Azul**: acciones primarias, enlaces, foco y estado activo | 
| `--accent-soft` | `#e2eafd` | `#18284a` | Fondo suave para hover de navegación, `code` y botones secundarios | 
| `--accent-2` | `#0f9d8a` | `#4fd6c2` | **Turquesa**: acentos gráficos, indicadores, barra superior de diagramas | 
| `--accent-2-text` | `#0b7a6b` | `#4fd6c2` | **Turquesa accesible para texto** (contraste ≥ 4.8:1 en modo claro) | 
| `--ok` | `#127a49` | `#5fd39a` | Confirmaciones y resultados positivos | 
| `--wip` | `#9a5600` | `#f0b35c` | **Ámbar**: exclusivo para estado `En desarrollo` | 
| `--err` | `#a3302a` | `#f09a92` | **Rojo**: exclusivo para etiquetas `Antes` (problema previo) o errores | 

### 2.2 Tokens de paneles oscuros Herrodri / Nexo (iguales en claro y oscuro)

Usar exclusivamente para bloques destacados de recreación interactiva, video o *spotlight* de producto (ej. *Plumazo* y paneles de *Asignación* / *Reconocimiento*):

| Token CSS | Valor | Uso | 
| ----- | ----- | ----- | 
| `--nx-verde` | `#0f1520` | Fondo del contenedor oscuro | 
| `--nx-texto` | `#eaf0f6` | Títulos y texto principal dentro del panel oscuro | 
| `--nx-suave` | `#9aa7b6` | Párrafos descriptivos y avisos | 
| `--nx-linea` | `#253040` | Bordes y separadores internos | 
| `--nx-lima` | `#4fd6c2` | Acento turquesa para etiquetas `.k-pill`, números de capa y enlaces | 
| `--nx-papel` | `#f3f5f9` | Fondo de la ventana interna clara en recreaciones de UI | 

### 2.3 Reglas estrictas de uso de color y contraste

* **Roles exclusivos**: azul (`--accent`) solo para interactividad y enlaces; turquesa (`--accent-2` / `--accent-2-text`) solo para *eyebrows*, acentos y `En producción`; ámbar (`--wip`) solo para `En desarrollo`.

* **Contraste WCAG AA (≥ 4.5:1)**:

  * En modo claro, nunca usar `#4fd6c2` ni `--accent-2` directo sobre blanco o `#f3f5f9` para texto; usar siempre `--accent-2-text` (`#0b7a6b`).

  * En modo oscuro, los botones `.btn.primary` y pills activos con fondo `--accent` (`#7ca4ff`) deben llevar texto oscuro `#0b0f15` (nunca blanco).

* **Fondo atmosférico**: combinar la grilla de puntos (`radial-gradient(var(--dot) 1px, transparent 1.3px)` cada `28px`) con dos halos radiales muy sutiles (`8%` de opacidad en `--accent` y `--accent-2`) en la parte superior. No usar gradientes estridentes ni neones.

## 3. Tipografía y jerarquía

Cargar desde Google Fonts únicamente estas tres familias:

| Rol | Familia | Pesos | Reglas de uso | 
| ----- | ----- | ----- | ----- | 
| **Display** (`--f-display`) | `Bricolage Grotesque` | `400, 600, 700, 800` | `h1`, `h2`, `h3`, logo, cifras de impacto. Aplicar `letter-spacing` negativo (`-0.02em` a `-0.045em`) y `text-wrap: balance`. | 
| **Cuerpo** (`--f-body`) | `Source Sans 3` | `400, 500, 600, 700` | Párrafos (`17px`, `line-height: 1.62`), botones, navegación y descripciones. Limitar párrafos a `max-width: 52ch–68ch`. | 
| **Técnico** (`--f-mono`) | `JetBrains Mono` | `400, 500, 600` | *Eyebrows* en mayúsculas (`letter-spacing: .12em`), badges de estado, fechas, tags, `code`, avisos y contadores. | 

* Usar `font-variant-numeric: tabular-nums` en todas las cifras clave, temporizadores y saldos.

* Los *eyebrows* de sección llevan una línea corta turquesa (`18px × 2px`, `--accent-2`) a la izquierda.

## 4. Arquitectura de información y orden de secciones

Toda versión del portafolio principal debe respetar esta secuencia lógica:

1. **Encabezado sticky (`.top`)**: fondo translúcido con `backdrop-filter: blur(14px)`, marca `d. daniel.dev`, 5 enlaces (`Casos`, `Experiencia`, `Laboratorio`, `Stack`, `Contacto`), botón `Ver CV` y botón animado de cambio de tema (sol/luna). Debe caber siempre en una sola línea en escritorio y colapsar a un menú a pantalla completa (`.sheet`) en `≤ 780px`.

2. **Hero asimétrico + Franja de cifras Bento**:

   * **Izquierda**: retrato con efecto pixelado interactivo (`108px × 108px`, radio `24px`), badge de rol + ubicación, `h1` con nombre completo, propuesta de valor con subrayado suave turquesa, párrafo introductorio y hasta 3 CTAs (`Explorar casos`, `Ver CV interactivo`, `LinkedIn`).

   * **Derecha**: tarjeta viva del caso destacado (*Notificaciones · BBVA*) con barra superior degradada (`--accent` → `--accent-2`), pasos `01`–`04` clicables, paquete animado que simula reintento en `429 · 5xx`, botón `Pausar/Reanudar` y acceso directo al caso completo.

   * **Base del Hero**: franja de 4 métricas clave (`.stats`) con bordes internos limpios.

3. **Casos de ingeniería (`#casos`)**:

   * Barra de filtros por industria/área (`Todos`, `BBVA · Banca`, `izzi · Telecom`, `Arquitectura & QA`) con contadores.

   * Grilla Bento: 1 tarjeta destacada horizontal (`featured`) + tarjetas en grilla de 2 columnas.

   * Cada tarjeta incluye: imagen/diagrama con etiqueta contextual, organización + estado, título, bloque `Problema / Decisión / Resultado` (`<dl class="pdr">`), tags técnicos y acción para abrir el caso completo.

4. **Experiencia y formación (`#experiencia`)**:

   * Diseño en 2 columnas (`1.45fr` / `0.75fr`): línea de tiempo vertical con riel degradado a la izquierda (BBVA e izzi, con enlaces directos a los casos relacionados) y columna lateral fija (`sticky`) a la derecha con **Formación académica (UTEZ)**, **Cursos** y acceso rápido al **CV**.

5. **Laboratorio y herramientas (`#laboratorio`)**:

   * Unifica productos propios en desarrollo y *Tools for Pymes* bajo filtros (`Todo el laboratorio`, `En desarrollo`, `Tools for Pymes`).

   * *Spotlight* oscuro Herrodri para el producto principal (*Plumazo* con sus 4 capas del motor conversacional), seguido de grilla de 2 columnas para *Nexo*, *Shalom*, *Calculadora de precios* y *Limpiador de metadatos* (preservando sus banners SVG).

6. **Stack de todos los días (`#stack`)**:

   * Grilla de 5 categorías equilibradas: `QA & Ops`, `Backend`, `Datos`, `Nube y CI` y `Frontend`.

7. **Contacto (`.final`) y Footer**:

   * Bloque invertido de alto contraste (`background: var(--fg); color: var(--bg)`), CTAs a LinkedIn, GitHub y CV, y correo `daniel199907@gmail.com` dentro de una píldora con botón `Copiar correo` + notificación *toast*.

## 5. Reglas de componentes y casos detallados

### 5.1 Estados permitidos (solo tres)

| Clase | Texto típico | Color | Estilo de borde | 
| ----- | ----- | ----- | ----- | 
| `.state.prod` | `En producción` | `--accent-2-text` | Sólido + fondo turquesa al 10% | 
| `.state.dev` | `En desarrollo` | `--wip` | Sólido + fondo ámbar al 10% | 
| `.state.exp` | `Exploración` | `--muted` | Discontinuo (`dashed`) + punto hueco | 

No crear cuartos ni quintos estilos de estado. Los metadatos adicionales (empresa, duración, alcance) van como chips neutros (`.m-chip`).

### 5.2 Estructura obligatoria de cada caso de estudio completo

Ya sea en vista modal o en página dedicada (`/caso-*/index.html`), todo caso debe seguir esta anatomía:

1. **Encabezado**: *eyebrow* con empresa/área, título con palabra clave resaltada (`.hl`), resumen ejecutivo y chips de estado/contexto.

2. **Bloque visual o recreación interactiva** (`.nexo-box` o `.m-figure`): diagrama, infografía o panel interactivo con datos ficticios y aviso visible.

3. **Franja de 4 cifras/atributos** (`.m-stats`).

4. **Capítulos numerados** (`01`, `02`, `03`) con el número en display grande (`--line`):

   * `01` La necesidad

   * `02` El problema (incluyendo tarjetas comparativas `Antes` en `--err` vs. `Ahora` en `--accent-2-text`)

   * `03` Cómo lo solucioné (lista numerada `.m-steps` con badges `01`, `02`, etc.)

5. **Cierre**: aviso de autoría/confidencialidad y enlace a la publicación correspondiente en LinkedIn (cuando exista).

### 5.3 Formato del CV interactivo

* Mantener siempre accesible desde la barra superior, el Hero, la columna de Experiencia y Contacto.

* Incluir botón `Imprimir / PDF` que invoque `window.print()` con hoja de estilos `@media print` que oculte la navegación y deje únicamente el documento limpio en formato carta.

## 6. Espaciado, superficies y diseño responsivo

* **Contenedor principal**: `max-width: 1160px`, padding horizontal mínimo `20px`.

* **Ritmo vertical**: separación de `92px` entre secciones principales en escritorio y `68px` en móvil (`≤ 780px`).

* **Radios de borde**: `24px–28px` en bloques grandes (Hero flow, Spotlight, Contacto, Modal), `18px–22px` en tarjetas, `10px–12px` en botones/controles y `999px` en pills/estados.

* **Elevación**: sombras difusas y sutiles (`--shadow-sm`, `--shadow-md`), elevación máxima de `-2px` a `-3px` en `:hover` con borde iluminado en `--accent` (o `--accent-2` en *Tools for Pymes*).

* **Breakpoints obligatorios**:

  * `≤ 1020px`: Hero a 1 columna, métricas `2 × 2`, caso destacado a 1 columna, Experiencia a 1 columna y Stack a 3 columnas.

  * `≤ 780px`: colapsa navegación a menú móvil, casos y laboratorio a 1 columna, Stack a 2 columnas.

  * `≤ 520px`: métricas y Stack a 1 columna, CTAs al 100% de ancho, `P/D/R` apilado.

## 7. Interacción, accesibilidad y estándares técnicos

* **Sin dependencias pesadas**: HTML semántico, CSS moderno con custom properties y JavaScript vanilla limpio.

* **Accesibilidad obligatoria**:

  * Respetar `@media (prefers-reduced-motion: reduce)` desactivando animaciones del retrato y del diagrama.

  * Mantener `:focus-visible` visible (`2px solid var(--accent)`), atributos `aria-pressed`, `aria-selected`, `aria-expanded`, `aria-modal` y cierre de modales con `Escape` o clic fuera.

  * Áreas táctiles mínimas de `38px–46px`.

* **Seguridad y resiliencia en navegador**:

  * Envolver cualquier lectura/escritura de `localStorage` en `try { ... } catch {}`.

  * Nunca usar `alert()`, `confirm()` ni `prompt()`; usar notificaciones *toast* o modales dentro de la página.

  * Incluir respaldo con `document.execCommand('copy')` al copiar el correo.

  * Todos los enlaces externos llevan `target="_blank" rel="noopener noreferrer"`.

## 8. Tono y estilo editorial

* **Idioma**: español claro, directo y natural de México.

* **Voz**: primera persona en decisiones técnicas («Diseñé…», «Construí…», «Optimicé…»).

* **Prohibido**: jerga vacía o exageraciones de marketing («revolucionario», «disruptivo», «sinérgico», «100% perfecto», «holístico»).

* **Regla de oro**: si una afirmación no se puede respaldar con un hecho concreto del proyecto, se omite o se redacta de forma cualitativa y verificable.

## 9. Checklist rápido para cualquier IA antes de entregar cambios

* \[ \] ¿Se conservaron exactamente todos los colores de `:root`, `[data-theme="dark"]` y `--nx-*`?

* \[ \] ¿Se mantuvieron `Bricolage Grotesque`, `Source Sans 3` y `JetBrains Mono` en sus roles?

* \[ \] ¿El contraste de texto cumple ≥ 4.5:1 tanto en modo claro como en modo oscuro?

* \[ \] ¿Todos los filtros, modales, botones, enlaces y el cambio de tema funcionan sin errores de consola?

* \[ \] ¿No hay secciones duplicadas ni tarjetas huérfanas en escritorio?

* \[ \] ¿Se conserva el aviso de «recreación ilustrativa con datos ficticios» en todos los casos corporativos?

* \[ \] ¿El layout se adapta sin scroll horizontal en `1280px`, `780px` y `375px`?

* \[ \] ¿Se respeta `prefers-reduced-motion` y no se usan `alert()`/`confirm()` ni `localStorage` sin `try/catch`?