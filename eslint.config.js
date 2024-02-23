import eslint from "@eslint/js";
import globals from "globals";

const rules = {
  ...eslint.configs.recommended.rules,
  "no-alert": "warn",
  "no-eval": "error",
  "require-await": "warn",
  "no-useless-escape": "warn"
}

export default [
  {
    files: ["electron/main/**/*.js", "build/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.nodeBuiltin }
    },
    rules
  },
  {
    files: ["electron/renderer/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { 
        ...globals.browser,
        ipcRenderer: "readonly"
      }
    },
    rules
  },
  {
    files: ["electron/renderer/preload.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: { ...globals.node }
    },
    rules
  }
];