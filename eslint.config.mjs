// eslint.config.mjs
import { defineConfig } from "eslint/config";
import nextPlugin from "eslint-config-next";
import prettierPlugin from "eslint-config-prettier";

export default defineConfig([
  // ✅ Next.js recommended rules
  ...nextPlugin,

  // ✅ Prettier integration
  ...prettierPlugin,

  // ✅ Your overrides
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules",
      "**/*.config.js"
    ],
    rules: {
      "react-hooks/exhaustive-deps": "off",
      // Example: enforce semicolons via Prettier
      "prettier/prettier": ["error", { semi: true }]
    }
  }
]);
