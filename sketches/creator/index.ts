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
} from "three/webgpu";
import glbUrl from "./creator.glb";
import matcapUrl from "./matcap.jpg";

import { sketchUniforms, uniformsParamsConfig } from "./config";
import { updateUniforms } from "../../uniformUtils";
import { caustics } from "./caustics";
import { float, uniform } from "three/tsl";

const gltfLoader = new GLTFLoader();
const textureLoader = new TextureLoader();
const matcapMat = new MeshMatcapMaterial();

// Originally from https://github.com/boytchev/tsl-textures/blob/main/src/caustics.js

const light1 = new DirectionalLight(0xffffff, 0.7);
light1.position.set(0, 1, 1);
light1.castShadow = true;

const light2 = new DirectionalLight(0xffffff, 0.3);
light2.position.set(1, -1, -1);
light2.castShadow = true;

export default class Creator {
  root = new Group();
  group?: Object3D;

  uniforms = {
    ...sketchUniforms,
    marbleTime: uniform(0),
  };

  constructor() {
    const objectMaterial = new MeshPhysicalNodeMaterial({
      color: 0xcccccc,
      roughness: 0,
      metalness: 0.0,
    });

    const causticsNode = caustics({ ...this.uniforms })();

    objectMaterial.colorNode = causticsNode;
    objectMaterial.iridescenceNode = causticsNode
      // .oneMinus()
      .mul(this.uniforms.iridescence);

    objectMaterial.iridescenceIORNode = this.uniforms.iridescenceIOR;

    this.root.add(light1);
    this.root.add(light2);

    gltfLoader.load(glbUrl, (obj) => {
      this.group = obj.scene;
      this.root.add(this.group);

      obj.scene.traverse((child) => {
        if (child instanceof Mesh) {
          child.material = objectMaterial;
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
  }
}
