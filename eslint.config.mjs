// eslint.config.mjs

import { defineConfig } from "eslint/config";
import nextPlugin from "eslint-config-next"; // 🎯 Now imports the main, exposed config object

// You no longer need to import the subpaths (.js files),
// as the primary package export handles the setup for you.

const eslintConfig = defineConfig([
  // 1. Next.js Base Configuration
  // This array spread includes the core rules, React rules, TypeScript rules,
  // and best practices recommended by Vercel for the Next.js App Router.
  ...nextPlugin, 
  
  // 2. Global Ignores (Keep for stability)
  // These are the standard directories and files to skip during linting.
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules",
      "**/*.config.js" // Optional: ignore configuration files at root level
    ],
      "extends": "next/core-web-vitals",
      "rules": {
      "react-hooks/exhaustive-deps": "off"
      }
    }
  ],
]);
export default eslintConfig;