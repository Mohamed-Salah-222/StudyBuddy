import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [js.configs.recommended, reactHooks.configs["recommended-latest"], reactRefresh.configs.vite],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      // Change 'error' to 'off' to completely disable the rule.
      // Or change to 'warn' if you want it to be a warning instead of an error.
      "no-unused-vars": "off",
      // If you still want to keep the option to ignore variables starting with
      // an uppercase letter or underscore, but just change the severity:
      // 'no-unused-vars': ['off', { varsIgnorePattern: '^[A-Z_]' }],
      // However, if you're turning it off completely, the pattern becomes moot.
    },
  },
]);
