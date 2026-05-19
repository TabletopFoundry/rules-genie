// Override parent rules-genie postcss/tailwind config so Docusaurus
// doesn't pick it up while building this site.
module.exports = {
  plugins: {
    autoprefixer: {},
  },
};
