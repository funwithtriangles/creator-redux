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
  BufferAttribute,
  Vector3,
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

// Helper to set up barycentric coordinates for frosted edge effect
const setupTriCenterAttributes = (geometry) => {
  if (geometry.index) {
    geometry = geometry.toNonIndexed();
  }

  const vectors = [
    new Vector3(1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, 0, 1),
  ];

  const position = geometry.attributes.position;
  const centers = new Float32Array(position.count * 3);

  for (let i = 0, l = position.count; i < l; i++) {
    vectors[i % 3].toArray(centers, i * 3);
  }

  geometry.setAttribute("center", new BufferAttribute(centers, 3));
  return geometry;
};

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
          // Set up barycentric coordinates for frosted edge effect
          child.geometry = setupTriCenterAttributes(child.geometry);
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

    this.uniforms.stripeTime.value +=
      d * this.uniforms.stripeSpeed.value * 0.01;

    this.uniforms.warpNoiseTime.value +=
      d * this.uniforms.warpNoiseSpeed.value * 0.01;
  }
}
