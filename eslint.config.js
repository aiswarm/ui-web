import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'

export default [
  {
    ignores: ['node_modules/', 'dist/']
  },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  importPlugin.flatConfigs.recommended,
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module'
      }
    }
  },
  {
    files: ['**/*.{js,mjs,vue}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2024
      }
    },
    rules: {
      'multiline-comment-style': ['error', 'starred-block'],
      'no-lonely-if': 'error',
      curly: ['error', 'all'],
      'no-unused-vars': 'off',
      'no-console': 'off',
      'import/extensions': [
        'error',
        'ignorePackages',
        { js: 'always', mjs: 'always', vue: 'always' }
      ],
      'import/no-unresolved': 'off',
      'import/namespace': 'off',
      'import/order': ['warn', { 'newlines-between': 'never' }]
    }
  },
  prettierConfig
]
