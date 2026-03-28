const { heroui } = require('@heroui/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            c0: 'transparent',
            c1: '#FFFFFF',
            c2: '#F6F6F6',
            c3: '#EDEDED',
            c4: '#525252',
            c5: '#303030',
            c6: '#0D0D0D',
            action: '#6B53BA',
            action2: '#B4A4E5',
            selected: '#FFFFFF',
            datavisOrange: '#c2410c',
            datavisBlue: '#0284c7',
            datavisGreen: '#84cc16',
            datavisYellow: '#eab308',
          },
        },
        dark: {
          colors: {
            c0: 'transparent',
            c1: '#070614',
            c2: '#12111F',
            c3: '#1F1E2D',
            c4: '#CBCBCB',
            c5: '#CECECE',
            c6: '#FFFFFF',
            action: '#6B53BA',
            action2: '#B4A4E5',
            selected: '#FFFFFF',
            datavisOrange: '#c2410c',
            datavisBlue: '#0284c7',
            datavisGreen: '#84cc16',
            datavisYellow: '#eab308',
          },
        },
      },
    }),
  ],
}