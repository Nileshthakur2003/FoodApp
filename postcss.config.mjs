/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Change 'tailwindcss' to this package:
    '@tailwindcss/postcss': {}, 
    autoprefixer: {},
  },
};

export default config;
