import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import pluginChaiFriendly from 'eslint-plugin-chai-friendly';

export default defineConfig([
  globalIgnores(['dist', 'logs']),
  { 
    files: ["**/*.ts"],
    plugins: { 
      js,
      'chai-friendly': pluginChaiFriendly
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended
    ],
    languageOptions: { 
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-unused-expressions': 'off', // disable original rule
      '@typescript-eslint/no-unused-expressions': 'off', // disable TypeScript ESLint version
      'chai-friendly/no-unused-expressions': 'error',
      'array-callback-return': 'error',
      'no-constructor-return': 'error',
      'no-duplicate-imports': 'error',
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'block-scoped-var': 'error',
      'default-case': 'error',
      'eqeqeq': 'error',
      'no-bitwise': 'error',
      'no-empty-function': 'error',
      'no-eval': 'error',
      'no-param-reassign': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'require-await': 'error'
    }
  }
]);
