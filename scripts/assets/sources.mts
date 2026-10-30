// The CC0 sources behind every 3D asset on the site (runbook V1.5). Each entry
// is also listed in docs/v3/ASSETS.md. `npm run assets:fetch` downloads them
// into assets-src/3d/ (git-ignored); `npm run assets:build` compresses them
// into public/three/.

export type TextureSource = {
  id: string; // file stem under public/three/tex/
  site: "ambientCG";
  asset: string;
  url: string;
  // Which maps from the zip we ship, keyed by our map name.
  maps: Partial<Record<"color" | "normal" | "roughness" | "ao" | "metalness", string>>;
  size: 512 | 1024;
};

export type HdriSource = { id: string; site: "Poly Haven"; asset: string; url: string; md5: string };

const acg = (asset: string) => `https://ambientcg.com/get?file=${asset}_1K-JPG.zip`;

export const TEXTURES: TextureSource[] = [
  { id: "cardboard", site: "ambientCG", asset: "Cardboard004", url: acg("Cardboard004"), size: 512,
    maps: { color: "Color", normal: "NormalGL", roughness: "Roughness" } },
  { id: "aluminium", site: "ambientCG", asset: "Metal051A", url: acg("Metal051A"), size: 512,
    maps: { roughness: "Roughness" } }, // roughness only: the albedo read as dark speckle and the circular-brush normals as cracks at cover size
  { id: "wood", site: "ambientCG", asset: "Wood049", url: acg("Wood049"), size: 512,
    maps: { color: "Color", normal: "NormalGL", roughness: "Roughness" } },
  { id: "plastic", site: "ambientCG", asset: "Plastic010", url: acg("Plastic010"), size: 512,
    maps: { normal: "NormalGL", roughness: "Roughness" } },
  { id: "paper", site: "ambientCG", asset: "Paper003", url: acg("Paper003"), size: 512,
    maps: { color: "Color", normal: "NormalGL", roughness: "Roughness" } },
];

export const HDRI: HdriSource = {
  id: "studio",
  site: "Poly Haven",
  asset: "studio_small_09",
  url: "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr",
  md5: "d5d7eb9d26d341d6aa4d11c1a54fd97c",
};
