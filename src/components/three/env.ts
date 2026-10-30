import { EquirectangularReflectionMapping, PMREMGenerator, type Texture, type WebGLRenderer } from "three";
import { GainMapLoader } from "@monogrid/gainmap-js";
import { withBasePath } from "@/lib/paths";
import { failStage } from "./stage-store";

// One CC0 studio HDRI (Poly Haven studio_small_09, 1k) shipped as a gain map:
// an sRGB JPEG, a gain-map JPEG and metadata, about 86 KB instead of 1.6 MB.
// Decoded on the GPU once per renderer, prefiltered once, shared by every View.
// Keyed by renderer: a GPU texture is meaningless on a new context. A failed load
// switches the page to posters (failStage) instead of leaving a scene that never draws.
const envByRenderer = new WeakMap<WebGLRenderer, Promise<Texture>>();

export function loadStudioEnv(gl: WebGLRenderer): Promise<Texture> {
  let envPromise = envByRenderer.get(gl);
  if (!envPromise) {
    const base = withBasePath("/three/env/studio");
    envPromise = new GainMapLoader(gl).loadAsync([`${base}-sdr.jpg`, `${base}-gain.jpg`, `${base}.json`]).then((result) => {
      const hdr = result.renderTarget.texture;
      hdr.mapping = EquirectangularReflectionMapping;
      const pmrem = new PMREMGenerator(gl);
      const env = pmrem.fromEquirectangular(hdr).texture;
      pmrem.dispose();
      result.dispose();
      return env;
    });
    envPromise.catch(failStage);
    envByRenderer.set(gl, envPromise);
  }
  return envPromise;
}
