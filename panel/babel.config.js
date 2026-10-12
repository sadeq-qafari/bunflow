/* eslint-env node */
module.exports = {
  plugins: [
    '@babel/plugin-transform-optional-chaining',
    '@babel/plugin-transform-nullish-coalescing-operator'
  ],
  presets: [
    '@quasar/babel-preset-app'
  ]
}

