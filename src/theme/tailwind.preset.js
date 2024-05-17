const { nextui } = require('@nextui-org/react');
const jsonData = require('./palettte.app.json');

function getPaletteSwatches(paletteName) {
  const palette = jsonData.find((p) => p.paletteName === paletteName);

  if (!palette) {
    throw new Error(`Palette with name "${paletteName}" not found`);
  }

  const swatchesObject = palette.swatches.reduce((acc, swatch) => {
    acc[swatch.name] = `#${swatch.color}`;
    return acc;
  }, {});

  return swatchesObject;
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  presets: [],
  darkMode: 'class',
  prefix: '',
  important: false,
  theme: {
    screens: {
      xs: '375px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    supports: {},
    colors: ({ colors }) => ({
      inherit: colors.inherit,
      current: colors.current,
      transparent: colors.transparent,
      dark: getPaletteSwatches('dark'),
      light: getPaletteSwatches('light'),
    }),
    spacing: {
      5: '5px',
      10: '10px',
      25: '25px',
      50: '50px',
      75: '75px',
    },
    borderColor: ({ theme }) => ({
      ...theme('colors'),
      DEFAULT: theme('colors.gray.200', 'currentColor'),
    }),
    borderOpacity: ({ theme }) => theme('opacity'),
    borderRadius: {
      8: '8px',
      12: '12px',
      14: '14px',
      18: '18px',
      xl: '99999px',
    },
    borderSpacing: ({ theme }) => ({
      ...theme('spacing'),
    }),
    borderWidth: {
      0: '0px',
      2: '2px',
      4: '4px',
      8: '8px',
    },
    cursor: {
      default: 'default',
      pointer: 'pointer',
      none: 'none',
      grab: 'grab',
    },
    fill: ({ theme }) => ({
      none: 'none',
      ...theme('colors'),
    }),
    flex: {
      1: '1 1 0%',
      auto: '1 1 auto',
      initial: '0 1 auto',
      none: 'none',
    },
    flexBasis: ({ theme }) => ({
      auto: 'auto',
      ...theme('spacing'),
      full: '100%',
    }),
    fontFamily: {
      sans: [
        'Inter',
      ],
      serif: ['ui-serif', 'serif'],
    },
    fontSize: {
      32: ['32px', { lineHeight: '100%' }],
      24: ['24px', { lineHeight: '20px' }],
      16: ['16px', { lineHeight: '120%' }],
      14: ['14px', { lineHeight: '120%' }],
    },
    fontWeight: {
      thin: '200',
      regular: '400',
      semibold: '500',
      bold: '700',
    },
    gap: ({ theme }) => theme('spacing'),
    height: ({ theme }) => ({
      auto: 'auto',
      ...theme('spacing'),
      full: '100%',
      screen: '100vh',
      min: 'min-content',
      max: 'max-content',
      fit: 'fit-content',
    }),
    lineHeight: {
      32: '32',
      24: '24',
      16: '16',
      14: '14',
    },
    margin: ({ theme }) => ({
      auto: 'auto',
      ...theme('spacing'),
    }),
    maxHeight: ({ theme }) => ({
      ...theme('spacing'),
      full: '100%',
      screen: '100vh',
      min: 'min-content',
      max: 'max-content',
      fit: 'fit-content',
    }),
    maxWidth: ({ theme, breakpoints }) => ({
      xs: '20rem',
      ...breakpoints(theme('screens')),
    }),
    minHeight: {
      0: '0px',
      full: '100%',
      screen: '100vh',
      min: 'min-content',
      max: 'max-content',
      fit: 'fit-content',
    },
    minWidth: {
      0: '0px',
      full: '100%',
      min: 'min-content',
      max: 'max-content',
      fit: 'fit-content',
    },
    opacity: {
      0: '0',
      5: '0.05',
      10: '0.1',
      20: '0.2',
      25: '0.25',
      30: '0.3',
      40: '0.4',
      50: '0.5',
      60: '0.6',
      70: '0.7',
      75: '0.75',
      80: '0.8',
      90: '0.9',
      95: '0.95',
      100: '1',
    },
    order: {
      first: '-9999',
      last: '9999',
      none: '0',
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5',
      6: '6',
      7: '7',
      8: '8',
      9: '9',
      10: '10',
      11: '11',
      12: '12',
    },
    padding: ({ theme }) => theme('spacing'),
    outlineColor: ({ theme }) => theme('colors'),
    rotate: {
      45: '45deg',
      90: '90deg',
      180: '180deg',
    },
    space: ({ theme }) => ({
      ...theme('spacing'),
    }),
    stroke: ({ theme }) => ({
      none: 'none',
      ...theme('colors'),
    }),
    strokeWidth: {
      0: '0',
      1: '1',
      2: '2',
    },
    textColor: ({ theme }) => theme('colors'),
    transitionDuration: {
      DEFAULT: '150ms',
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms',
    },
    transitionProperty: {
      none: 'none',
      all: 'all',
      DEFAULT:
        'color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter',
      colors: 'color, background-color, border-color, text-decoration-color, fill, stroke',
      opacity: 'opacity',
      shadow: 'box-shadow',
      transform: 'transform',
    },
    backgroundColor: ({ theme }) => theme('colors'),
    transitionTimingFunction: {
      DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    translate: ({ theme }) => ({
      ...theme('spacing'),
      full: '100%',
    }),
    width: ({ theme }) => ({
      auto: 'auto',
      ...theme('spacing'),
      full: '100%',
      screen: '100vw',
      min: 'min-content',
      max: 'max-content',
      fit: 'fit-content',
    }),
    willChange: {
      auto: 'auto',
      scroll: 'scroll-position',
      transform: 'transform',
    },
    zIndex: {
      auto: 'auto',
      0: '0',
      10: '10',
      20: '20',
      30: '30',
      40: '40',
      50: '50',
    },
  },
  variantOrder: [
    'first',
    'last',
    'odd',
    'even',
    'checked',
    'hover',
    'focus',
    'active',
  ],


  plugins: [
    nextui({
      layout: {
      },
      themes: {
        light: {
          colors: {
            default: {
              ...getPaletteSwatches('light'),
              100: '#fafafa',
              200: '#e4e4e7',
              300: '#d4d4d8',
              400: '#71717a',
              500: '#52525b',
              600: '#7828c8'
            },
          },
        },
        dark: {
          colors: {
            default: {
              ...getPaletteSwatches('dark'),
              100: '#18181b',
              200: '#27272a',
              300: '#3f3f46',
              400: '#a1a1aa',
              500: '#d4d4d8',
              600: '#7828c8'
            },
          },
        },
      },
    }),
  ],
};