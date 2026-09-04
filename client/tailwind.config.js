/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emeraldPrimary: '#16866A',
        emeraldDark: '#0F5C4A',
        sageSoft: '#DCEFE8',
        mintPale: '#ECF8F4',
        warmBg: '#F7F8F5',
        cardWhite: '#FFFFFF',
        charcoal: '#1F2933',
        mutedGray: '#68736D',
        borderLight: '#E1E7E3',
        statusLive: '#22A06B',
        statusWarning: '#D99A24',
        statusError: '#D95C5C',
        upcomingGray: '#CBD5CF'
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px'
      },
      boxShadow: {
        'soft': '0 2px 12px -2px rgba(31, 41, 51, 0.06), 0 1px 4px -1px rgba(31, 41, 51, 0.04)',
        'soft-lg': '0 8px 24px -4px rgba(31, 41, 51, 0.08), 0 2px 8px -2px rgba(31, 41, 51, 0.04)',
      },
      animation: {
        'pulse-subtle': 'subtlePulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        subtlePulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.4)' },
        }
      }
    },
  },
  plugins: [],
}
