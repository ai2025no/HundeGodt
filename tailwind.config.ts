import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Finn Design System Palette
        'midnight-ink': '#161345',
        'cocoa-bean': '#321004',
        'ember-orange': '#ff7f00',
        'blush-petal': '#ffcfdb',
        'sky-powder': '#d7ecff',
        'mint-tide': '#60c4bf',
        'cloud-white': '#ffffff',
        'fog-gray': '#f9f9f9',
        'ash-border': '#ebebeb',
        'stone-mute': '#666666',
        'check-green': '#3aaf3a',

        // Semantic Brand Aliases
        brand: {
          navy: '#161345',
          cocoa: '#321004',
          orange: '#ff7f00',
          blush: '#ffcfdb',
          sky: '#d7ecff',
          mint: '#60c4bf',
          fog: '#f9f9f9',
          border: '#ebebeb',
          mute: '#666666',
        },

        // Admin Compatibility Palettes
        forest: {
          50: '#F4F7F4',
          100: '#E5EDE6',
          200: '#C7D8C9',
          300: '#9FBDA3',
          400: '#759F7B',
          500: '#53825A',
          600: '#3F6745',
          700: '#231e5c',
          800: '#1c194f',
          900: '#161345',
          950: '#0e0b30',
        },
        sand: {
          50: '#FDFBF7',
          100: '#FAF7F2',
          200: '#F3ECE1',
          300: '#E8DCCB',
          400: '#D5C3A8',
          500: '#BEA784',
          600: '#A48B67',
          700: '#846D50',
          800: '#6C5842',
          900: '#321004',
        },
        sage: {
          50: '#F5F7F6',
          100: '#E8EDE9',
          200: '#D1DDD4',
          300: '#AFC3B3',
          400: '#8AA590',
          500: '#6C8972',
          600: '#556E5A',
          700: '#445848',
          800: '#38473B',
          900: '#2F3B32',
        },
      },
      borderRadius: {
        card: '20px',
        pill: '60px',
        input: '60px',
        badge: '9999px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
        full: '9999px',
      },
      fontFamily: {
        sans: [
          'Larsseit',
          '"Plus Jakarta Sans"',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        display: [
          'Athletics',
          '"Space Grotesk"',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        serif: [
          'Athletics',
          'Georgia',
          'serif',
        ],
        mono: [
          'Monosten',
          '"JetBrains Mono"',
          'ui-monospace',
          'monospace',
        ],
      },
      boxShadow: {
        warm: '0 4px 20px -2px rgba(50, 16, 4, 0.08)',
        floating: '0 10px 30px -4px rgba(22, 19, 69, 0.12)',
        card: '0 2px 10px -2px rgba(22, 19, 69, 0.06)',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.02em',
        normal: '0em',
        wide: '0.02em',
        wider: '0.05em',
      },
    },
  },
  plugins: [],
};

export default config;
