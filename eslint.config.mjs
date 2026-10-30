import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Skill bundles under .claude/ carry their own helper scripts; they are not site code.
    ".claude/**",
    // The Ask proxy's wrangler build output and local state (worker/ is its own package).
    "worker/dist/**",
    "worker/.wrangler/**",
    "worker/node_modules/**",
  ]),
]);

export default eslintConfig;
