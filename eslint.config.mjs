// eslint.config.mjs

import { defineConfig, globalIgnores } from "eslint/config";
// 🎯 FIX: Access the default property from the imported modules
import * as nextVitalsModule from "eslint-config-next/core-web-vitals.js";
import * as nextTsModule from "eslint-config-next/typescript.js";

const eslintConfig = defineConfig([
  // 🎯 FIX: Spread the 'default' array property from the imported modules
  ...(nextVitalsModule.default || []),
  ...(nextTsModule.default || []),
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
