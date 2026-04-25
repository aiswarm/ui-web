import js from '@eslint/js'
import { importX } from 'eslint-plugin-import-x'
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
  importX.flatConfigs.recommended,
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
      'import-x/extensions': [
        'error',
        'ignorePackages',
        { js: 'always', mjs: 'always', vue: 'always' }
      ],
      'import-x/no-unresolved': 'off',
      'import-x/namespace': 'off',
      'import-x/order': ['warn', { 'newlines-between': 'never' }]
    }
  },
  prettierConfig
]
