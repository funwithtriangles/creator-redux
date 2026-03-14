import {
  Group,
  Mesh,
  MeshBasicNodeMaterial,
  SphereGeometry,
  Vector3,
} from "three/webgpu";
import { uniform } from "three/tsl";
import { stripes } from "../creator/stripes";
import { stripesUniforms, stripesParamsConfig } from "./config";
import { updateUniforms } from "../../uniformUtils";

const SPHERE_COUNT = 100;
const SPREAD = new Vector3(20, 20, 100);
const DEADZONE = new Vector3(6, 6, 6);

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
      const scale = 5;
      mesh.scale.setScalar(scale);

      const velocity = new Vector3(0, 0, -1);

      this.spheres.push({ mesh, velocity });
      this.root.add(mesh);
    }
  }

  update({
    params,
    deltaFrame,
  }: {
    params: Record<string, number>;
    deltaFrame: number;
  }) {
    const speed = params.speed * deltaFrame;
    const halfSpread = SPREAD.clone().multiplyScalar(0.5);

    updateUniforms(stripesParamsConfig as any, this.stripesUniforms, params);
    this.stripesUniforms.stripeTime.value +=
      deltaFrame * this.stripesUniforms.stripeSpeed.value * 0.01;
    this.stripesUniforms.warpNoiseTime.value +=
      deltaFrame * this.stripesUniforms.warpNoiseSpeed.value * 0.01;

    for (const { mesh, velocity } of this.spheres) {
      mesh.position.addScaledVector(velocity, speed);

      // Wrap around when leaving bounds
      for (const axis of ["x", "y", "z"] as const) {
        if (mesh.position[axis] > halfSpread[axis])
          mesh.position[axis] -= SPREAD[axis];
        if (mesh.position[axis] < -halfSpread[axis])
          mesh.position[axis] += SPREAD[axis];
      }

      // Push out of deadzone
      if (isInDeadzone(mesh.position)) {
        randomizeOutsideDeadzone(mesh.position);
      }
    }
  }
}
