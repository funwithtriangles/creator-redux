import {
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshMatcapMaterial,
  SphereGeometry,
  TextureLoader,
} from "three/webgpu";

const SEGMENT_COUNT = 24;
const ROW_COUNT = 6;
const GRUBS_PER_ROW = 3;
const sphereDetail = 20;
const textureLoader = new TextureLoader();

interface Segment {
  mesh: Mesh;
  segmentIndex: number;
  rowIndex: number;
  grubIndex: number;
  direction: number;
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

    for (let rowIndex = 0; rowIndex < ROW_COUNT; rowIndex++) {
      const direction = rowIndex % 2 === 0 ? 1 : -1;

      for (let grubIndex = 0; grubIndex < GRUBS_PER_ROW; grubIndex++) {
        for (
          let segmentIndex = 0;
          segmentIndex < SEGMENT_COUNT;
          segmentIndex++
        ) {
          const mat = segmentIndex === 0 ? headMat : this.bodyMat;
          const mesh = new Mesh(geometry, mat);

          this.segments.push({
            mesh,
            segmentIndex,
            rowIndex,
            grubIndex,
            direction,
          });

          this.root.add(mesh);
        }
      }
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
      textureLoader.load(
        p.matcapFileName,
        (matcap) => {
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

    const wrapSpan = p.grubSpacingX * GRUBS_PER_ROW;
    const wrapLimit = wrapSpan * 0.5;

    for (const { mesh, segmentIndex, rowIndex, grubIndex, direction } of this
      .segments) {
      const t = segmentIndex / SEGMENT_COUNT;
      const pulsePhase =
        this.pulseTime -
        segmentIndex * p.spacing * p.pulseFreq +
        rowIndex +
        grubIndex;

      const rowCenterY = (rowIndex - (ROW_COUNT - 1) * 0.5) * p.rowSpacing;
      const grubOffsetX =
        (grubIndex - (GRUBS_PER_ROW - 1) * 0.5) * p.grubSpacingX;
      const xRaw =
        this.time * direction -
        segmentIndex * p.spacing * direction +
        grubOffsetX;

      const x =
        ((((xRaw + wrapLimit * 2) % wrapSpan) + wrapSpan) % wrapSpan) -
        wrapLimit;
      const y = rowCenterY + Math.cos(x * p.squirmFreq) * p.squirmAmpY;
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
