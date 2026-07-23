import { GLTFLoader } from "three-stdlib";
import {
  InstancedMesh,
  Group,
  MeshMatcapMaterial,
  MeshMatcapNodeMaterial,
  Mesh,
  Object3D,
  SphereGeometry,
  TextureLoader,
  Vector3,
  BackSide,
} from "three/webgpu";
import {
  bumpMap,
  dot,
  float,
  mx_noise_float,
  normalLocal,
  positionGeometry,
  positionLocal,
  positionWorld,
  sin,
  uniform,
  vec3,
} from "three/tsl";

const SEGMENT_COUNT = 24;
const ROW_COUNT = 48;
const GRUBS_PER_ROW = 12;
const PARAM_SMOOTHING = 0.95;
const sphereDetail = 20;
const giantHeadDetail = 96;
const textureLoader = new TextureLoader();
const gltfLoader = new GLTFLoader();

import grubGlbUrl from "./grub.glb";
import { sketchUniforms, uniformsParamsConfig } from "./config";
import { updateUniforms } from "../../uniformUtils";

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
  baseCylinderRadius = Number.NaN;
  lastMatCapUrl?: string;
  headMesh: InstancedMesh;
  giantHead?: Mesh;
  headMat: MeshMatcapMaterial;
  giantHeadMat: MeshMatcapNodeMaterial;
  bodyMat: MeshMatcapMaterial;
  bodyMesh: InstancedMesh;
  giantHeadTime = uniform(0);
  instanceHelper = new Object3D();
  headForwardAxis = new Vector3(0, 0, 1);
  headTangent = new Vector3();
  cylinderRotation = 0;

  uniforms = {
    ...sketchUniforms,
  };

  loadHeadMesh(headCount: number) {
    gltfLoader.load(grubGlbUrl, (gltf) => {
      const sourceMesh = gltf.scene.getObjectByProperty("isMesh", true) as
        | Mesh
        | undefined;

      if (!sourceMesh) return;

      const oldHeadMesh = this.headMesh;
      const oldGiantHead = this.giantHead;
      const giantHeadGeometry = new SphereGeometry(
        1,
        giantHeadDetail,
        giantHeadDetail,
      );

      this.headMesh = new InstancedMesh(
        sourceMesh.geometry,
        this.headMat,
        headCount,
      );
      this.giantHead = new Mesh(giantHeadGeometry, this.giantHeadMat);

      this.cylinder.add(this.headMesh);
      this.cylinder.remove(oldHeadMesh);
      if (oldGiantHead) {
        this.root.remove(oldGiantHead);
      }
      this.root.add(this.giantHead);
    });
  }

  smoothParam(currentValue: number, targetValue: number) {
    if (!Number.isFinite(currentValue)) {
      return targetValue;
    }

    const lerpAlpha = 1 - PARAM_SMOOTHING;
    return currentValue + (targetValue - currentValue) * lerpAlpha;
  }

  constructor() {
    const geometry = new SphereGeometry(1, sphereDetail, sphereDetail);
    this.headMat = new MeshMatcapMaterial();
    this.giantHeadMat = new MeshMatcapNodeMaterial({ side: BackSide });
    this.bodyMat = new MeshMatcapMaterial();
    this.headMat.colorNode = vec3(2, 2, 2);
    this.giantHeadMat.colorNode = this.uniforms.bgColor;

    this.giantHeadMat.positionNode = positionLocal.add(
      normalLocal
        .normalize()
        .mul(
          sin(positionLocal.mul(this.uniforms.bgFreq)).mul(this.uniforms.bgAmp),
        ),
    );

    const headCount = ROW_COUNT * GRUBS_PER_ROW;
    const bodyCount = ROW_COUNT * GRUBS_PER_ROW * (SEGMENT_COUNT - 1);

    this.headMesh = new InstancedMesh(geometry, this.headMat, headCount);
    this.bodyMesh = new InstancedMesh(geometry, this.bodyMat, bodyCount);

    this.cylinder.add(this.headMesh, this.bodyMesh);
    this.root.add(this.cylinder);
    this.loadHeadMesh(headCount);

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
    deltaTime: d,
  }: {
    params: Record<string, any>;
    deltaTime: number;
  }) {
    updateUniforms(uniformsParamsConfig, this.uniforms, p);

    // TODO: We wouldn't need to check every frame if we had some sketch api for reacting to param changes
    if (p.matcapFileName && p.matcapFileName !== this.lastMatCapUrl) {
      this.lastMatCapUrl = p.matcapFileName;
      textureLoader.load(
        p.matcapFileName,
        (matcap) => {
          this.headMat.matcap = matcap;
          this.headMat.needsUpdate = true;
          this.giantHeadMat.matcap = matcap;
          this.giantHeadMat.needsUpdate = true;
          this.bodyMat.matcap = matcap;
          this.bodyMat.needsUpdate = true;
        },
        undefined,
        (err) => {
          console.error("Failed to load matcap texture:", err);
        },
      );
    }

    const delta = d * 0.1 * p.speed;
    this.giantHeadTime.value = this.pulseTime * 0.35;

    this.cylinderRotation += p.cylinderRotSpeed * 0.1;
    this.cylinder.rotation.y = p.cylinderAngle;

    const safeCylinderRadius = Math.max(0.001, p.cylinderRadius);
    if (!Number.isFinite(this.baseCylinderRadius)) {
      this.baseCylinderRadius = safeCylinderRadius;
    }
    const radiusCompensationScale =
      this.baseCylinderRadius / safeCylinderRadius;
    this.cylinder.scale.setScalar(p.groupScale * radiusCompensationScale);

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

      const rowCenterY =
        Math.sin(rowIndex * rowArc + this.cylinderRotation) *
        safeCylinderRadius;
      const rowCenterZ =
        Math.cos(rowIndex * rowArc + this.cylinderRotation) *
        safeCylinderRadius;

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
        0,
        p.segScale * tailTaper * headTaper * (1 + pulseWave * p.pulseAmp),
      );

      this.instanceHelper.position.set(x, y, z);
      if (isHead) {
        const waveArg = x * this.smoothedSquirmFreq;
        const tangentY =
          -Math.sin(waveArg) * this.smoothedSquirmFreq * p.squirmAmpY;
        const tangentZ =
          Math.cos(waveArg) * this.smoothedSquirmFreq * p.squirmAmpZ;

        this.headTangent
          .set(direction, tangentY * direction, tangentZ * direction)
          .normalize();

        this.instanceHelper.quaternion.setFromUnitVectors(
          this.headForwardAxis,
          this.headTangent,
        );
      } else {
        this.instanceHelper.quaternion.identity();
      }
      this.instanceHelper.scale.setScalar(radius);
      this.instanceHelper.updateMatrix();

      const mesh = isHead ? this.headMesh : this.bodyMesh;
      mesh.setMatrixAt(instanceIndex, this.instanceHelper.matrix);
    }

    this.headMesh.instanceMatrix.needsUpdate = true;
    this.bodyMesh.instanceMatrix.needsUpdate = true;

    if (this.giantHead) {
      this.giantHead.scale.setScalar(p.bgScale);
      this.giantHead.rotation.x += 0.5 * p.bgRotSpeed * d;
      this.giantHead.rotation.y += 0.3 * p.bgRotSpeed * d;
    }
  }
}
