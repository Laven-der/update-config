module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  globals: {
    __static: true,
    $: true
  },
  plugins: [
    'html'
  ],
  'rules': {
    'no-console': 0,
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-unused-vars': [
      'warn',
      {
        'vars': 'all',
        'args': 'none',
        'ignoreRestSiblings': true
      }
    ],
  }
}
