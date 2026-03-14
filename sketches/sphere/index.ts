import {
  Group,
  Mesh,
  MeshNormalMaterial,
  SphereGeometry,
  Vector3,
} from "three/webgpu";

const SPHERE_COUNT = 20;
const SPREAD = 20;

interface FlyingSphere {
  mesh: Mesh;
  velocity: Vector3;
}

export default class Sphere {
  root = new Group();
  spheres: FlyingSphere[] = [];

  constructor() {
    const geometry = new SphereGeometry(0.5, 32, 32);
    const material = new MeshNormalMaterial();

    for (let i = 0; i < SPHERE_COUNT; i++) {
      const mesh = new Mesh(geometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * SPREAD,
        (Math.random() - 0.5) * SPREAD,
        (Math.random() - 0.5) * SPREAD,
      );
      const scale = 3;
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
    const halfSpread = SPREAD / 2;

    for (const { mesh, velocity } of this.spheres) {
      mesh.position.addScaledVector(velocity, speed);

      // Wrap around when leaving bounds
      for (const axis of ["x", "y", "z"] as const) {
        if (mesh.position[axis] > halfSpread) mesh.position[axis] -= SPREAD;
        if (mesh.position[axis] < -halfSpread) mesh.position[axis] += SPREAD;
      }
    }
  }
}
