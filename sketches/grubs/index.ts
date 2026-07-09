import {
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshMatcapMaterial,
  SphereGeometry,
  TextureLoader,
} from "three/webgpu";

const SEGMENT_COUNT = 24;
const sphereDetail = 20;
const textureLoader = new TextureLoader();

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
  lastMatCapUrl?: string;
  bodyMat: MeshMatcapMaterial;

  constructor() {
    const geometry = new SphereGeometry(1, sphereDetail, sphereDetail);
    this.bodyMat = new MeshMatcapMaterial();
    const headMat = new MeshBasicMaterial();

    for (let i = 0; i < SEGMENT_COUNT; i++) {
      const mat = i === 0 ? headMat : this.bodyMat;
      const mesh = new Mesh(geometry, mat);
      this.segments.push({ mesh, index: i });
      this.root.add(mesh);
    }
  }

  update({
    params: p,
    deltaFrame,
  }: {
    params: Record<string, any>;
    deltaFrame: number;
  }) {
    // TODO: We wouldn't need to check every frame if we had some sketch api for reacting to param changes
    if (p.matcapFileName && p.matcapFileName !== this.lastMatCapUrl) {
      this.lastMatCapUrl = p.matcapFileName;
      console.log(p.matcapFileName);
      textureLoader.load(
        p.matcapFileName,
        (matcap) => {
          console.log(matcap);
          this.bodyMat.matcap = matcap;
          this.bodyMat.needsUpdate = true;
        },
        undefined,
        (err) => {
          console.error("Failed to load matcap texture:", err);
        },
      );
    }

    this.root.scale.setScalar(p.groupScale);
    const delta = deltaFrame * 0.01 * p.speed;
    this.time += delta;
    this.squirmTime += delta;
    this.pulseTime += delta;

    const wrapSpan = p.xWrapLimit * 2;

    for (const { mesh, index } of this.segments) {
      const t = index / Math.max(1, SEGMENT_COUNT - 1);
      const squirmPhase = this.squirmTime - index * p.spacing * p.squirmFreq;
      const pulsePhase = this.pulseTime - index * p.spacing * p.pulseFreq;
      const xRaw = this.time - index * p.spacing;

      const x =
        ((((xRaw + p.xWrapLimit) % wrapSpan) + wrapSpan) % wrapSpan) -
        p.xWrapLimit;
      const y = Math.cos(squirmPhase) * p.squirmAmpY;
      const z = 0;

      mesh.position.set(x, y, z);

      const pulseWave = Math.sin(pulsePhase);
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
