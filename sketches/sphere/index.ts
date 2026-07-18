import {
  Group,
  Mesh,
  MeshBasicNodeMaterial,
  SphereGeometry,
  Vector3,
  Euler,
} from "three/webgpu";
import { uniform } from "three/tsl";
import { stripes } from "../creator/stripes";
import { stripesUniforms, stripesParamsConfig } from "./config";
import { updateUniforms } from "../../uniformUtils";

const SPHERE_COUNT = 100;
const SPREAD = new Vector3(30, 30, 50);
const DEADZONE = new Vector3(6, 6, 6);
const SHRINK_DIST = 10;
const BASE_SCALE = 5;

function isInDeadzone(pos: Vector3): boolean {
  return (
    Math.abs(pos.x) < DEADZONE.x &&
    Math.abs(pos.y) < DEADZONE.y &&
    Math.abs(pos.z) < DEADZONE.z
  );
}

function randomizeOutsideDeadzone(pos: Vector3) {
  do {
    pos.set(
      (Math.random() - 0.5) * SPREAD.x,
      (Math.random() - 0.5) * SPREAD.y,
      (Math.random() - 0.5) * SPREAD.z,
    );
  } while (isInDeadzone(pos));
}

interface FlyingSphere {
  mesh: Mesh;
  velocity: Vector3;
}

export default class Sphere {
  root = new Group();
  spheres: FlyingSphere[] = [];
  stripesUniforms = {
    ...stripesUniforms,
    stripeTime: uniform(0),
    warpNoiseTime: uniform(0),
  } as any;

  constructor() {
    const geometry = new SphereGeometry(0.5, 32, 32);
    const wavesNode = stripes(this.stripesUniforms)();
    const material = new MeshBasicNodeMaterial({ color: 0xffffff });
    (material as any).emissiveNode = wavesNode;

    for (let i = 0; i < SPHERE_COUNT; i++) {
      const mesh = new Mesh(geometry, material);
      randomizeOutsideDeadzone(mesh.position);

      const velocity = new Vector3(0, 0, -1);

      this.spheres.push({ mesh, velocity });
      this.root.add(mesh);
    }
  }

  update({
    params: p,
    deltaFrame: d,
  }: {
    params: Record<string, any>;
    deltaFrame: number;
  }) {
    const speed = p.speed * d;
    const halfSpread = SPREAD.clone().multiplyScalar(0.5);

    updateUniforms(stripesParamsConfig as any, this.stripesUniforms, p);
    this.stripesUniforms.stripeTime.value +=
      d * this.stripesUniforms.stripeSpeed.value * 0.01;
    this.stripesUniforms.warpNoiseTime.value +=
      d * this.stripesUniforms.warpNoiseSpeed.value * 0.01;

    for (const { mesh, velocity } of this.spheres) {
      mesh.position.addScaledVector(velocity, speed);

      // Wrap around when leaving bounds
      for (const axis of ["x", "y", "z"] as const) {
        if (mesh.position[axis] > halfSpread[axis])
          mesh.position[axis] -= SPREAD[axis];
        if (mesh.position[axis] < -halfSpread[axis])
          mesh.position[axis] += SPREAD[axis];
      }

      const entryT = Math.min(
        (halfSpread.z - mesh.position.z) / SHRINK_DIST,
        1,
      );
      const exitT = Math.min((mesh.position.z + halfSpread.z) / SHRINK_DIST, 1);
      const t = Math.max(Math.min(entryT, exitT), 0);
      const smoothT = t * t * (3 - 2 * t);
      mesh.scale.setScalar(BASE_SCALE * smoothT);

      // Reposition if in deadzone
      if (isInDeadzone(mesh.position)) {
        randomizeOutsideDeadzone(mesh.position);
      }
    }

    // Rotate the group to face direction
    this.root.rotation.order = "YXZ";
    this.root.rotation.y = p.direction[0] * Math.PI * 0.5;
    this.root.rotation.x = -p.direction[1] * Math.PI * 0.5;
  }
}
