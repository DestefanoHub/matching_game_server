import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(['dist']),
  { 
    files: ["**/*.ts"],
    plugins: { js },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended
    ],
    languageOptions: { 
      globals: globals.node 
    },
    rules: {
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
