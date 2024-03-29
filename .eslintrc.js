module.exports = {
  root: true,

  env: {
    node: true
  },

  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/standard',
    '@vue/typescript'
  ],

  parserOptions: {
    parser: '@typescript-eslint/parser'
  },

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'newline-per-chained-call': 'error', // does not work, why
    'vue/no-v-html': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error'
  },
  overrides: [
    {
      files: [
        'tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
