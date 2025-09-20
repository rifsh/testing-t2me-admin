/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'attendance-gradient': 'linear-gradient(135deg, #f20c32 0%, #8c0a1f 100%)',
      },
      textColor: {
        'attendance-gradient': 'transparent', // needed for gradient text
      },
      backgroundClip: {
        text: 'text', // for gradient text
      }
    },
  },
  plugins: [],
}