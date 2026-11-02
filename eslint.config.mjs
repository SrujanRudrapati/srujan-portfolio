import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // 3D scenes keep their simulation state (positions, bodies, timers) in plain
  // objects that the frame loop mutates outside React on purpose; React never
  // renders from them. The React Compiler immutability check does not apply there.
  {
    files: ["src/components/three/scenes/**"],
    rules: { "react-hooks/immutability": "off" },
  },
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
    // Vendored decoders copied from three (scripts/assets/build.mts), not our code.
    "public/three/**",
  ]),
]);

export default eslintConfig;
