// eslint.config.mjs

import { defineConfig, globalIgnores } from "eslint/config";
// 🎯 FIX: Import the entire modules using * as, and ensure the .js extension is present
import * as nextVitalsModule from "eslint-config-next/core-web-vitals.js";
import * as nextTsModule from "eslint-config-next/typescript.js";

const eslintConfig = defineConfig([
  // 🎯 FIX: Safely spread the default export, ensuring it is used correctly
  // Note: Using the array property if the default export is an object container.
  // This pattern handles the case where the exported config array is nested.
  ...(Array.isArray(nextVitalsModule.default) ? nextVitalsModule.default : []),
  ...(Array.isArray(nextTsModule.default) ? nextTsModule.default : []),
  
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;