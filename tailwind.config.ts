import type { Config } from 'tailwindcss';
import {nextui} from "@nextui-org/react";

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },fontFamily: {
                sans: ['Montserrat', 'ui-sans-serif', 'system-ui'],
            },
      colors: {
        pirncipalGreen: '#17A948', // Votre couleur principale
        secGreen: '#ECFFE4', // Votre couleur grise #0A4D20
        darkGreen:'#0A4D20' //la couleur fonce
      },
      fontSize: {
        '2xl': '1.5rem', // Taille de police pour les titres de niveau 1
        'xl': '1.25rem', // Taille de police pour les titres de niveau 2
        'lg': '1.125rem', // Taille de police pour les titres de niveau 3
        'base': '1rem', // Taille de police pour les titres de niveau 4
        'sm': '0.875rem', // Taille de police pour les titres de niveau 5
        'xs': '0.75rem', // Taille de police pour les titres de niveau 6
      },
      fontWeight: {
        'bold': '600', // Poids de police bold
      },
    },
    keyframes: {
      shimmer: {
        '100%': {
          transform: 'translateX(100%)',
        },
      },
    },
  }, 
  darkMode: "class",
  
  plugins: [require('@tailwindcss/forms'), nextui()]
};
export default config;
