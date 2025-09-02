/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    'node_modules/daisyui/dist/**/*.js',
    'node_modules/react-daisyui/dist/**/*.js',
  ],
  theme: {
    screens: {
      xs: '200px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      //p-desktop-padding
      spacing: {
        'desktop-padding': '80px',
      },
      fontSize: {
        // mobile-font-size
        'prod-name-mobile': ['12px', { lineHeight: '21px' }],
        'prod-price-mobile': ['14px', { lineHeight: '18px' }],
        // desktop-font-size
        'prod-name-desktop': ['14px', { lineHeight: '19px' }],
        'prod-price-desktop': ['16px', { lineHeight: '18px' }],
      },

      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans], //primary
        sub: ['Roboto', 'sans-serif'], //secondary
      },
      colors: {
        primary: '#a92d30',
        'primary-lighter': '#fee2e2',
        secondary: '#009485',
        info: '#312e91',
        success: '#009485',
        warning: '#ff9900',
        error: '#e53e3e',
        //Lưu ý về màu sắc: do logo nhiều màu nên tone màu của web sẽ sẽ là bg-white và black
        white: ' #FFFFFF',
        black: '#333333',
        default: '#000000',
        'primary-white': '#FAFAFA',
        'btn-section-borderless': '#D6D6D6', //Với button section không viền, nền trắng dùng hex code: #D6D6D6
        'btn-section-border': '#F0F0F0', //Với button section có nền đen thì dùng hex code: #F0F0F0
        price: '#b91c1c ',
        del: '#D84315',
        'primary-hover': 'color-mix(oklab, oklch(var(--btn-color, var(--b2)) / var(--tw-bg-opacity, 1)) 90%, black)',
        'gray-50': '#ababab',
        'gray-100': '#969696',
        'gray-200': '#828282',
        'gray-300': '#6f6f6f',
      },
      boxShadow: {
        //shadow
        sideBar: '10px 0 30px -2px #D9D9D9',
        mainMenu: '0px 4px 12.100000381469727px 0px #00000040',
        tableItem: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
        headerMenu: 'rgba(0, 0, 0, 0.1) 0px 2px 1px 0px',
      },
      borderRadius: {
        //rounded
        modal: '16px',
      },
      animation: {
        //animate
        fadeIn: 'fadeIn 1.8s ease-in-out forwards',
        exfadeIn: 'exfadeIn 0.3s ease-in-out forwards',
        zoomBorderBtn: 'zoomBorderBtn 2s infinite ease-in-out',
      },
    },
  },
  corePlugins: {
    animation: true,
  },
  plugins: [require('daisyui'), require('tailwind-scrollbar'), require('tailwind-scrollbar-hide')],

  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#a92d30',
          secondary: '#009485',
          info: '#312e91',
          success: '#009485',
          warning: '#ff9900',
          error: '#e53e3e',
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
    prefix: '',
    logs: true,
    themeRoot: ':root',
  },
};
