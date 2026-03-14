import { GLTFLoader } from "three-stdlib";
import {
  TextureLoader,
  MeshMatcapMaterial,
  DirectionalLight,
  Group,
  Object3D,
  Mesh,
  MeshBasicNodeMaterial,
  Node,
  PassNode,
} from "three/webgpu";
import glbUrl from "./creator.glb";

import { sketchUniforms, uniformsParamsConfig } from "./config";
import { updateUniforms } from "../../uniformUtils";
// import { caustics } from "./caustics";
import {
  dot,
  float,
  mix,
  mrt,
  mx_noise_float,
  output,
  positionGeometry,
  positionLocal,
  ShaderNodeObject,
  smoothstep,
  uniform,
  vec3,
} from "three/tsl";
import { stripes } from "./stripes";
import {
  wireframeAlphaFloat,
  wireframeEmissiveColor,
  setupTriCenterAttributes,
} from "../hud/elements/wireframe";
import { retarget } from "three/examples/jsm/utils/SkeletonUtils.js";

const gltfLoader = new GLTFLoader();
const textureLoader = new TextureLoader();
const matcapMat = new MeshMatcapMaterial();

// Originally from https://github.com/boytchev/tsl-textures/blob/main/src/caustics.js

const light1 = new DirectionalLight(0xffffff, 1);
light1.position.set(0, 1, -1);
// light1.castShadow = true;

const light2 = new DirectionalLight(0xffffff, 1);
light2.position.set(1, -1, -1);
// light2.castShadow = true;

export default class Creator {
  root = new Group();
  group?: Object3D;
  pieces: Mesh[] = [];
  time = 0;

  uniforms = {
    ...sketchUniforms,
    marbleTime: uniform(0),
    stripeTime: uniform(0),
    warpNoiseTime: uniform(0),
    wireNoiseTime: uniform(0),
  };

  constructor() {
    const wavesNode = stripes({ ...this.uniforms })();
    const wireAlpha = wireframeAlphaFloat({
      thickness: this.uniforms.wireframeThickness,
    });
    const wireColor = wireframeEmissiveColor({
      wireframeFrontColor: this.uniforms.wireframeFrontColor,
      wireframeBackColor: this.uniforms.wireframeBackColor,
    });

    const wireNoiseCoord = dot(
      positionLocal,
      vec3(
        this.uniforms.wireNoiseDirX,
        this.uniforms.wireNoiseDirY,
        this.uniforms.wireNoiseDirZ,
      ),
    )
      .mul(this.uniforms.wireNoiseScale)
      .add(this.uniforms.wireNoiseTime);

    const wireNoiseRaw = mx_noise_float(wireNoiseCoord)
      .add(0.5)
      .add(this.uniforms.wireNoiseBias);

    const edge = this.uniforms.wireNoiseHardness;
    const wireNoise = smoothstep(
      float(0.5).sub(edge),
      float(0.5).add(edge),
      wireNoiseRaw,
    );

    const objectMaterial = new MeshBasicNodeMaterial({
      color: 0xffffff,
      side: 2, // DoubleSide
    });

    const wireframeCol = (objectMaterial.emissiveNode = mix(
      wavesNode,
      wireColor,
      wireAlpha.mul(wireNoise).mul(this.uniforms.wireframeOpacity),
    ));

    // Write to the MRT mask channel so post-processing can identify this geometry
    objectMaterial.mrtNode = mrt({ mask: float(1) });

    this.root.add(light1);

    gltfLoader.load(glbUrl, (obj) => {
      this.group = obj.scene;
      this.root.add(this.group);

      obj.scene.traverse((child) => {
        if (child instanceof Mesh) {
          child.geometry = setupTriCenterAttributes(child.geometry);
          child.material = objectMaterial;

          this.pieces.push(child);
        }
      });
    });
  }

  getWebGPUPass(
    prevPass: ShaderNodeObject<Node>,
    renderPassNode: ShaderNodeObject<PassNode>,
  ): ShaderNodeObject<Node> {
    renderPassNode.setMRT(
      mrt({
        output,
        mask: float(0),
      }),
    );

    return prevPass;
  }

  update({ params: p, deltaFrame: d }) {
    updateUniforms(uniformsParamsConfig, this.uniforms, p);

    this.uniforms.marbleTime.value +=
      d * this.uniforms.marbleSpeed.value * 0.01;

    this.uniforms.stripeTime.value +=
      d * this.uniforms.stripeSpeed.value * 0.01;

    this.uniforms.warpNoiseTime.value +=
      d * this.uniforms.warpNoiseSpeed.value * 0.01;

    this.uniforms.wireNoiseTime.value +=
      d * this.uniforms.wireNoiseSpeed.value * 0.01;

    // Modulate scale of each piece
    this.time += d * 0.05 * p.pieceScaleSpeed;
    for (let i = 0; i < this.pieces.length; i++) {
      const piece = this.pieces[i];
      const offset =
        piece.position.x * p.pieceWaveFreqX +
        piece.position.y * p.pieceWaveFreqY;
      const scale =
        p.pieceBaseScale + Math.sin(this.time + offset) * p.pieceScaleAmp;
      piece.scale.setScalar(scale);
    }
  }
}
