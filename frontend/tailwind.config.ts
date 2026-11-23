import type { Config } from 'tailwindcss';

// Paleta inspirada no site do ELLP (grupoellp.com.br): azul dominante, laranja de destaque.
// Se quiser casar 100% com o site oficial, troque os hex abaixo pelos valores do CSS deles.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#EEF4FF', 100: '#DCE8FF', 200: '#B9D1FF', 300: '#86B0FF', 400: '#4F86F5',
          500: '#2A63DB', 600: '#1B4BB8', 700: '#163B93', 800: '#132F73', 900: '#0E2255', 950: '#091538',
        },
        orange: {
          50: '#FFF6EC', 100: '#FFEBD3', 200: '#FFD3A1', 300: '#FFB868', 400: '#FFA03A',
          500: '#FF8A1F', 600: '#E86F0A', 700: '#B95508',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
