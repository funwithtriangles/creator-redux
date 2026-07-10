import {
  InstancedMesh,
  Group,
  MeshBasicMaterial,
  MeshMatcapMaterial,
  Object3D,
  SphereGeometry,
  TextureLoader,
} from "three/webgpu";

const SEGMENT_COUNT = 24;
const ROW_COUNT = 48;
const GRUBS_PER_ROW = 12;
const PARAM_SMOOTHING = 0.95;
const sphereDetail = 20;
const textureLoader = new TextureLoader();

const TAU = Math.PI * 2;

interface Segment {
  segmentIndex: number;
  rowIndex: number;
  grubIndex: number;
  direction: number;
  instanceIndex: number;
  isHead: boolean;
}

export default class Grubs {
  root = new Group();
  cylinder = new Group();
  segments: Segment[] = [];
  time = 0;
  pulseTime = 0;
  smoothedGrubSpacingX = Number.NaN;
  smoothedSegSpacing = Number.NaN;
  smoothedSquirmFreq = Number.NaN;
  lastMatCapUrl?: string;
  headMesh: InstancedMesh;
  bodyMat: MeshMatcapMaterial;
  bodyMesh: InstancedMesh;
  instanceHelper = new Object3D();

  smoothParam(currentValue: number, targetValue: number) {
    if (!Number.isFinite(currentValue)) {
      return targetValue;
    }

    const lerpAlpha = 1 - PARAM_SMOOTHING;
    return currentValue + (targetValue - currentValue) * lerpAlpha;
  }

  constructor() {
    const geometry = new SphereGeometry(1, sphereDetail, sphereDetail);
    const headMat = new MeshBasicMaterial();
    this.bodyMat = new MeshMatcapMaterial();
    const headCount = ROW_COUNT * GRUBS_PER_ROW;
    const bodyCount = ROW_COUNT * GRUBS_PER_ROW * (SEGMENT_COUNT - 1);

    this.headMesh = new InstancedMesh(geometry, headMat, headCount);
    this.bodyMesh = new InstancedMesh(geometry, this.bodyMat, bodyCount);

    this.cylinder.add(this.headMesh, this.bodyMesh);
    this.root.add(this.cylinder);

    let headInstanceIndex = 0;
    let bodyInstanceIndex = 0;

    for (let rowIndex = 0; rowIndex < ROW_COUNT; rowIndex++) {
      const direction = rowIndex % 2 === 0 ? 1 : -1;

      for (let grubIndex = 0; grubIndex < GRUBS_PER_ROW; grubIndex++) {
        for (
          let segmentIndex = 0;
          segmentIndex < SEGMENT_COUNT;
          segmentIndex++
        ) {
          const mat = segmentIndex === 0 ? headMat : this.bodyMat;
          const isHead = segmentIndex === 0;
          const instanceIndex = isHead
            ? headInstanceIndex++
            : bodyInstanceIndex++;

          this.segments.push({
            segmentIndex,
            rowIndex,
            grubIndex,
            direction,
            instanceIndex,
            isHead,
          });
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

    const targetSpacingX = Math.max(0.001, p.grubSpacingX);
    const targetSegSpacing = Math.max(0, p.segSpacing);
    const targetSquirmFreq = Math.max(0, p.squirmFreq);

    this.smoothedGrubSpacingX = this.smoothParam(
      this.smoothedGrubSpacingX,
      targetSpacingX,
    );
    this.smoothedSegSpacing = this.smoothParam(
      this.smoothedSegSpacing,
      targetSegSpacing,
    );
    this.smoothedSquirmFreq = this.smoothParam(
      this.smoothedSquirmFreq,
      targetSquirmFreq,
    );

    const wrapSpan = this.smoothedGrubSpacingX * GRUBS_PER_ROW;
    const wrapLimit = wrapSpan * 0.5;

    // Keep world-space travel speed stable as squirm frequency changes.
    const squirmDyDxAmp = this.smoothedSquirmFreq * p.squirmAmpY;
    const squirmDzDxAmp = this.smoothedSquirmFreq * p.squirmAmpZ;
    const avgPathStretch = Math.sqrt(
      1 + 0.5 * (squirmDyDxAmp * squirmDyDxAmp + squirmDzDxAmp * squirmDzDxAmp),
    );
    const travelDelta = delta / avgPathStretch;

    this.time += travelDelta;
    this.pulseTime += delta;
    this.time = this.time % this.smoothedGrubSpacingX;

    const rowArc = TAU / ROW_COUNT;

    for (const {
      segmentIndex,
      rowIndex,
      grubIndex,
      direction,
      instanceIndex,
      isHead,
    } of this.segments) {
      const t = segmentIndex / SEGMENT_COUNT;

      const rowCenterY = Math.sin(rowIndex * rowArc) * p.cylinderRadius;
      const rowCenterZ = Math.cos(rowIndex * rowArc) * p.cylinderRadius;

      const stagger =
        p.rowStagger * Math.sin(rowIndex * p.rowStaggerFreq) * direction;

      const grubOffsetX =
        (grubIndex - (GRUBS_PER_ROW - 1) * 0.5) * this.smoothedGrubSpacingX +
        stagger;
      const xRaw =
        this.time * direction -
        segmentIndex * this.smoothedSegSpacing * direction +
        grubOffsetX;

      const x =
        ((((xRaw + wrapLimit * 2) % wrapSpan) + wrapSpan) % wrapSpan) -
        wrapLimit;
      const y =
        rowCenterY + Math.cos(x * this.smoothedSquirmFreq) * p.squirmAmpY;
      const z =
        rowCenterZ + Math.sin(x * this.smoothedSquirmFreq) * p.squirmAmpZ;

      const pulsePhase =
        this.pulseTime -
        segmentIndex * this.smoothedSegSpacing * p.pulseFreq +
        rowIndex;

      const pulseWave = Math.sin(pulsePhase);
      const tailTaper = 1 - t * p.tailTaper;
      const headTaper = 1 - (1 - t) * p.headTaper;
      const radius = Math.max(
        0.05,
        p.segScale * tailTaper * headTaper * (1 + pulseWave * p.pulseAmp),
      );

      this.instanceHelper.position.set(x, y, z);
      this.instanceHelper.scale.setScalar(radius);
      this.instanceHelper.updateMatrix();

      const mesh = isHead ? this.headMesh : this.bodyMesh;
      mesh.setMatrixAt(instanceIndex, this.instanceHelper.matrix);
    }

    this.headMesh.instanceMatrix.needsUpdate = true;
    this.bodyMesh.instanceMatrix.needsUpdate = true;
    this.cylinder.rotation.x += p.cylinderRotSpeed * 0.01;
  }
}
