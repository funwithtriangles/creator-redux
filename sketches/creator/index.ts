import { GLTFLoader } from "three-stdlib";
import {
  TextureLoader,
  MeshMatcapMaterial,
  DirectionalLight,
  Group,
  Object3D,
  MeshStandardNodeMaterial,
  Mesh,
  MeshPhysicalNodeMaterial,
  Uniform,
  UniformNode,
  MeshBasicMaterial,
  MeshBasicNodeMaterial,
  MeshPhongNodeMaterial,
  DoubleSide,
  PointLight,
  MeshNormalMaterial,
} from "three/webgpu";
import glbUrl from "./creator.glb";
import matcapUrl from "./matcap.jpg";

import { sketchUniforms, uniformsParamsConfig } from "./config";
import { updateUniforms } from "../../uniformUtils";
import { caustics } from "./caustics";
import { float, uniform } from "three/tsl";
import { stripes } from "./stripes";

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
  };

  constructor() {
    const wavesNode = stripes({ ...this.uniforms })();
    const objectMaterial = new MeshBasicMaterial({
      color: 0x000000,
      // flatShading: true,
      // specular: 0xffffff,
      // map: matcapMat.matcap,
    });

    // const objectMaterial = new MeshStandardNodeMaterial({
    //   roughness: 0,
    //   metalness: 1,
    //   // transparent: true,
    //   // side: DoubleSide,
    // });

    // const objectMaterial = new MeshNormalMaterial();

    // objectMaterial.opacityNode = wavesNode;

    objectMaterial.emissiveNode = wavesNode;
    // const causticsNode = caustics({ ...this.uniforms })();

    // objectMaterial.colorNode = causticsNode;
    // objectMaterial.iridescenceNode = causticsNode
    //   // .oneMinus()
    //   .mul(this.uniforms.iridescence);

    // objectMaterial.iridescenceIORNode = this.uniforms.iridescenceIOR;

    // this.root.add(light1);
    // this.root.add(light2);

    gltfLoader.load(glbUrl, (obj) => {
      this.group = obj.scene;
      this.root.add(this.group);

      obj.scene.traverse((child) => {
        if (child instanceof Mesh) {
          child.material = objectMaterial;

          this.pieces.push(child);
        }
      });

      textureLoader.load(matcapUrl, (matcap) => {
        matcapMat.matcap = matcap;
        matcapMat.needsUpdate = true;
      });
    });
  }

  update({ params: p, deltaFrame: d }) {
    updateUniforms(uniformsParamsConfig, this.uniforms, p);

    this.uniforms.marbleTime.value +=
      d * this.uniforms.marbleSpeed.value * 0.01;

    this.uniforms.stripeTime.value +=
      d * this.uniforms.stripeSpeed.value * 0.01;

    this.uniforms.warpNoiseTime.value +=
      d * this.uniforms.warpNoiseSpeed.value * 0.01;

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
