module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'linebreak-style': 0,
    'class-methods-use-this': 0,
    'comma-dangle': 0,
    'import/no-cycle': 0
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
