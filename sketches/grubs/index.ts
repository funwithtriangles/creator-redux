import { Group, Mesh, MeshNormalMaterial, SphereGeometry } from "three/webgpu";
import config from "./config";

const SEGMENT_COUNT = 24;
const sphereDetail = 20;

interface Segment {
  mesh: Mesh;
  index: number;
}

export default class Grubs {
  root = new Group();
  segments: Segment[] = [];
  time = 0;
  squirmTime = 0;
  pulseTime = 0;

  constructor() {
    const geometry = new SphereGeometry(1, sphereDetail, sphereDetail);
    const material = new MeshNormalMaterial();

    for (let i = 0; i < SEGMENT_COUNT; i++) {
      const mesh = new Mesh(geometry, material);
      this.segments.push({ mesh, index: i });
      this.root.add(mesh);
    }
  }

  update({
    params: p,
    deltaFrame,
  }: {
    params: Record<string, number>;
    deltaFrame: number;
  }) {
    this.root.scale.setScalar(p.groupScale);
    const delta = deltaFrame * 0.01 * p.speed;
    this.time += delta;
    this.squirmTime += delta;
    this.pulseTime += delta;

    const wrapSpan = p.xWrapLimit * 2;

    for (const { mesh, index } of this.segments) {
      const t = index / Math.max(1, SEGMENT_COUNT - 1);
      const squirmPhase = this.squirmTime - index * p.spacing * p.squirmFreq;
      const xRaw = this.time - index * p.spacing;

      const x =
        ((((xRaw + p.xWrapLimit) % wrapSpan) + wrapSpan) % wrapSpan) -
        p.xWrapLimit;
      const y = Math.cos(squirmPhase) * p.squirmAmpY;
      const z = 0;

      mesh.position.set(x, y, z);

      const pulseWave = Math.sin(this.pulseTime - index * p.pulseTravel);
      const tailTaper = 1 - t * p.tailTaper;
      const headTaper = 1 - (1 - t) * p.headTaper;
      const radius = Math.max(
        0.05,
        p.baseScale * tailTaper * headTaper * (1 + pulseWave * p.pulseAmp),
      );

      mesh.scale.setScalar(radius);
    }
  }
}
