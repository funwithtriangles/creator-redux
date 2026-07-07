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
    params,
    deltaFrame,
  }: {
    params: Record<string, number>;
    deltaFrame: number;
  }) {
    this.root.scale.setScalar(params.groupScale);
    this.time += deltaFrame * 0.01 * params.speed;
    const headTravelX = this.time;
    const wrapSpan = params.xWrapLimit * 2;

    for (const { mesh, index } of this.segments) {
      const t = index / Math.max(1, SEGMENT_COUNT - 1);
      const chainOffset = index * params.spacing;
      const squirmPhase = this.time * params.squirmFreq - index * 0.1;

      const xRaw = 1 - chainOffset + squirmPhase;
      const x =
        ((((xRaw + params.xWrapLimit) % wrapSpan) + wrapSpan) % wrapSpan) -
        params.xWrapLimit;
      const y = Math.cos(squirmPhase * 1.4) * params.squirmAmpY;
      const z = 0;

      mesh.position.set(x, y, z);

      const pulseWave = Math.sin(
        this.time * params.pulseFreq - index * params.pulseTravel,
      );
      const tailTaper = 1 - t * params.tailTaper;
      const headTaper = 1 - (1 - t) * params.headTaper;
      const radius = Math.max(
        0.05,
        params.baseScale *
          tailTaper *
          headTaper *
          (1 + pulseWave * params.pulseAmp),
      );

      mesh.scale.setScalar(radius);
    }
  }
}
