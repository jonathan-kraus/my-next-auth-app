// eslint.config.mjs
import { defineConfig } from "eslint/config";
import nextPlugin from "eslint-config-next";

const eslintConfig = defineConfig([
  // 1. Next.js Base Configuration
  // Spread in the Next.js recommended rules
  ...nextPlugin,

  // 2. Global Ignores and custom rules
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules",
      "**/*.config.js"
    ],
    extends: ["next/core-web-vitals"], // ✅ must be an array
    rules: {
      "react-hooks/exhaustive-deps": "off"
    }
  }
]);

export default eslintConfig;
