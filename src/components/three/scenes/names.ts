// Scene ids. Each has a poster at public/posters/<id>.webp and a component in scenes/index.tsx.
export const SCENES = ["hero-stream", "surplus-line", "label-lens"] as const;
export type SceneName = (typeof SCENES)[number];
