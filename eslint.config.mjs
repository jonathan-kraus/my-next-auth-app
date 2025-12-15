// eslint.config.mjs
import { defineConfig } from "eslint/config";
import nextPlugin from "eslint-config-next";

export default defineConfig([
  // Next.js recommended rules
  ...nextPlugin,

  // Prettier integration
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules",
      "**/*.config.js"
    ],
    extends: ["prettier"], // ✅ just extend Prettier here
    plugins: ["prettier"], // optional, if you want prettier/prettier rule
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "prettier/prettier": "error" // enforce Prettier formatting
    }
  }
]);
