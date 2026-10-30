import { RepeatWrapping, SRGBColorSpace, type Texture, type WebGLRenderer } from "three";
import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { withBasePath } from "@/lib/paths";
import { failStage } from "./stage-store";

// KTX2 textures from scripts/assets/build.mts. The Basis transcoder is
// self-hosted under /three/basis/ (never a CDN). One loader, one worker pool.
// Loader and texture cache are per renderer (GPU textures do not survive a new context).
type Cache = { loader: KTX2Loader; textures: Map<string, Promise<Texture>> };
const caches = new WeakMap<WebGLRenderer, Cache>();

function cacheFor(gl: WebGLRenderer): Cache {
  let c = caches.get(gl);
  if (!c) {
    c = { loader: new KTX2Loader().setTranscoderPath(withBasePath("/three/basis/")).setWorkerLimit(2).detectSupport(gl), textures: new Map() };
    caches.set(gl, c);
  }
  return c;
}

export type MaterialMaps = { map?: Texture; normalMap?: Texture; roughnessMap?: Texture };
type MapName = "color" | "normal" | "orm";

function load(gl: WebGLRenderer, file: string, srgb: boolean, repeat: number) {
  const key = `${file}@${repeat}`;
  const { loader, textures } = cacheFor(gl);
  let p = textures.get(key);
  if (!p) {
    p = loader
      .loadAsync(withBasePath(`/three/tex/${file}.ktx2`))
      .then((t) => {
        t.colorSpace = srgb ? SRGBColorSpace : "";
        t.wrapS = t.wrapT = RepeatWrapping;
        t.repeat.set(repeat, repeat);
        t.anisotropy = 4;
        return t;
      });
    p.catch(failStage); // a missing texture means posters, not a scene that never draws
    textures.set(key, p);
  }
  return p;
}

/** Loads a material's maps; `orm` carries roughness in G (three's roughnessMap channel). */
export async function loadMaps(gl: WebGLRenderer, id: string, maps: MapName[], repeat = 1): Promise<MaterialMaps> {
  const out: MaterialMaps = {};
  await Promise.all(
    maps.map(async (m) => {
      const t = await load(gl, `${id}-${m}`, m === "color", repeat);
      if (m === "color") out.map = t;
      else if (m === "normal") out.normalMap = t;
      else out.roughnessMap = t;
    }),
  );
  return out;
}
