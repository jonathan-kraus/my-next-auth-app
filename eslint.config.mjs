// eslint.config.mjs
import { defineConfig } from "eslint/config";
import nextPlugin from "eslint-config-next";
import prettierPlugin from "eslint-plugin-prettier";

export default defineConfig([
  // Next.js recommended rules
  ...nextPlugin,

  // Your overrides + Prettier
  {
    ignores: [
      ".next/**",
      "out/**",
      "src/generated/**",
      "build/**",
      "next-env.d.ts",
      "node_modules",
      "**/*.config.js"
    ],
    plugins: {
      prettier: prettierPlugin, // ✅ import and assign
    },
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "prettier/prettier": "error", // enforce Prettier formatting
    },
  },
]);
