/* Tailwind de la Calculadora de precios.
 * Compilar (desde la raíz del repo):
 *   npx tailwindcss@3.4.17 -c calculadora-precios/tailwind.config.js -i calculadora-precios/src/estilos.css -o calculadora-precios/estilos.css --minify
 * Los colores son los tokens de Nexo como variables CSS (claro y oscuro en src/estilos.css).
 */
module.exports = {
  content: ['./calculadora-precios/index.html'],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', '"Segoe UI"', 'Arial', 'sans-serif'] },
      colors: {
        fondo: 'var(--bg)',
        superficie: 'var(--surface)',
        'superficie-alt': 'var(--surface-alt)',
        borde: 'var(--border)',
        campo: 'var(--field)',
        texto: 'var(--text)',
        suave: 'var(--muted)',
        acento: 'var(--acento)',
        'acento-hover': 'var(--acento-hover)',
        'acento-fondo': 'var(--acento-fondo)',
        'acento-fuerte': 'var(--acento-fuerte)',
        primario: 'var(--primario)',
        'primario-texto': 'var(--primario-texto)',
        'primario-hover': 'var(--primario-hover)',
        banda: 'var(--banda)',
        'banda-texto': 'var(--banda-texto)',
        'banda-suave': 'var(--banda-suave)',
        lima: 'var(--lima)',
        'lima-texto': 'var(--lima-texto)',
        foco: 'var(--foco)',
        'ok-fg': 'var(--ok-fg)', 'ok-bg': 'var(--ok-bg)',
        'dif-fg': 'var(--dif-fg)', 'dif-bg': 'var(--dif-bg)',
        'info-fg': 'var(--info-fg)', 'info-bg': 'var(--info-bg)',
        'err-fg': 'var(--err-fg)', 'err-bg': 'var(--err-bg)'
      },
      borderRadius: { tarjeta: '14px' },
      boxShadow: { nexo: 'var(--sombra)' },
      keyframes: {
        entra: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'none' } },
        pop: { '0%, 100%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.3)' } },
        bump: { '0%, 100%': { transform: 'scale(1)' }, '35%': { transform: 'scale(1.09)' } },
        latido: {
          '0%': { boxShadow: '0 0 0 0 rgba(213,248,138,.75)' },
          '70%': { boxShadow: '0 0 0 14px rgba(213,248,138,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(213,248,138,0)' }
        },
        abre: { from: { opacity: '0', transform: 'translateY(-6px)' }, to: { opacity: '1', transform: 'none' } },
        aparece: { from: { opacity: '0', transform: 'translateY(-4px)' }, to: { opacity: '1', transform: 'none' } },
        brillo: { '0%, 100%': { filter: 'none' }, '50%': { filter: 'brightness(1.08) saturate(1.2)' } }
      },
      animation: {
        entra: 'entra .38s cubic-bezier(.2,.8,.2,1) both',
        pop: 'pop .28s ease-out',
        bump: 'bump .4s cubic-bezier(.2,.8,.2,1)',
        latido: 'latido 1.3s ease-out infinite',
        abre: 'abre .28s cubic-bezier(.2,.8,.2,1)',
        aparece: 'aparece .3s ease-out',
        brillo: 'brillo 1.6s ease-in-out 2'
      }
    }
  },
  plugins: []
};
