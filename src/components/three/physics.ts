import { Body, Box, ContactMaterial, Material, Plane, SAPBroadphase, Vec3, World } from "cannon-es";
import type { Object3D } from "three";

// cannon-es setup shared by the physics scenes (motion-system: fixed step,
// real gravity, contact materials, sleep on). Scenes own their world.

export const FIXED_STEP = 1 / 60;
export const MAX_SUBSTEPS = 3;

export type Materials = { ground: Material; item: Material; roller: Material; wood: Material };

export function makeWorld(): { world: World; mats: Materials } {
  const world = new World({ gravity: new Vec3(0, -9.82, 0), allowSleep: true });
  world.broadphase = new SAPBroadphase(world);
  (world.solver as unknown as { iterations: number }).iterations = 12;
  const mats: Materials = { ground: new Material("ground"), item: new Material("item"), roller: new Material("roller"), wood: new Material("wood") };
  // Cardboard and plastic on painted floor, aluminium rollers, rough pallet wood.
  world.addContactMaterial(new ContactMaterial(mats.item, mats.ground, { friction: 0.5, restitution: 0.18 }));
  // The conveyor bed is one static body standing in for free-turning rollers: almost no
  // sliding friction there (cannon-es 0.20 treated 0.03 like 0.3 in a test); the scene
  // applies the rollers' traction as a separate, grip-limited force.
  world.addContactMaterial(new ContactMaterial(mats.item, mats.roller, { friction: 0, restitution: 0.12 }));
  world.addContactMaterial(new ContactMaterial(mats.item, mats.wood, { friction: 0.65, restitution: 0.22 }));
  world.addContactMaterial(new ContactMaterial(mats.item, mats.item, { friction: 0.55, restitution: 0.15 }));
  return { world, mats };
}

export function staticBox(world: World, material: Material, half: [number, number, number], pos: [number, number, number], rotZ = 0) {
  const body = new Body({ mass: 0, material, shape: new Box(new Vec3(...half)), position: new Vec3(...pos) });
  if (rotZ) body.quaternion.setFromEuler(0, 0, rotZ);
  world.addBody(body);
  return body;
}

export function groundPlane(world: World, material: Material) {
  const body = new Body({ mass: 0, material, shape: new Plane() });
  body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(body);
  return body;
}

/** Copies a body's pose onto its mesh (cannon Vec3/Quaternion are copy-compatible with three). */
export function sync(obj: Object3D, body: Body) {
  obj.position.set(body.position.x, body.position.y, body.position.z);
  obj.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
}
