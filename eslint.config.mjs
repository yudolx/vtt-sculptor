// @ts-check
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import eslintPluginPrettier from "eslint-plugin-prettier";
import importPlugin from "eslint-plugin-import";

const config = defineConfig(
  tseslint.configs.strict,
  reactHooks.configs.flat.recommended,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    plugins: {
      prettier: eslintPluginPrettier,
      import: importPlugin,
    },
    ignores: ["./compiled", "./plugins"],
    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/no-non-null-assertion": "off",
      "import/no-cycle": "error",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^__",
          argsIgnorePattern: "^__",
        },
      ],
    },
  },
);

export default config;

// {
//   "env": {
//     "node": true
//   },
//   "parser": "@typescript-eslint/parser",
//   "plugins": [
//     "@typescript-eslint",
//     "import",
//     "prettier"
//   ],
//   "extends": [
//     "eslint:recommended",
//     "plugin:@typescript-eslint/recommended",
//     "plugin:@typescript-eslint/strict",
//     "plugin:react-hooks/recommended"
//   ],
//   "ignorePatterns": [
//     "compiled"
//   ],
//   "rules": {
//     "prettier/prettier": "error",
//     "@typescript-eslint/no-non-null-assertion": "off",
//     "import/no-cycle": "error",
//     "@typescript-eslint/ban-ts-comment": "off",
//     "@typescript-eslint/no-explicit-any": "off",
//     "@typescript-eslint/ban-types": "off",
//     "@typescript-eslint/no-unused-vars": ["warn", {
//       "varsIgnorePattern": "^__",
//       "argsIgnorePattern": "^__"
//     }]
//   }
// }
