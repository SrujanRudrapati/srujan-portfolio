// Root-relative URLs that are not next/link (the resume PDF, graph.json,
// search-index.json) must carry the GitHub Pages basePath by hand: Next only
// rewrites its own links. NEXT_PUBLIC_BASE_PATH is set on the CI build step
// (/srujan-portfolio) and empty locally. See .claude/skills/static-export-check.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(path: string): string {
  if (!path.startsWith("/")) throw new Error(`withBasePath expects a root-relative path, got "${path}"`);
  return `${basePath}${path}`;
}
