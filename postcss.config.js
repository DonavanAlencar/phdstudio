export default {
  plugins: {
    // Mantemos apenas o autoprefixer para evitar dependência
    // em bindings nativos do Tailwind v4 no ambiente de build atual.
    autoprefixer: {},
  },
};
