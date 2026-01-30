import { GLTFLoader } from "three-stdlib";
import * as THREE from "three";
import hedronLogoUrl from "./creator.glb";
import matcapUrl from "./matcap.jpg";

const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const matcapMat = new THREE.MeshMatcapMaterial();

export default class Logo {
  root = new THREE.Group();
  group?: THREE.Object3D;

  constructor() {
    // Load logo model
    gltfLoader.load(hedronLogoUrl, (obj) => {
      this.group = obj.scene;
      this.root.add(this.group);

      obj.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = matcapMat;
        }
      });

      textureLoader.load(matcapUrl, (matcap) => {
        matcapMat.matcap = matcap;
        matcapMat.needsUpdate = true;
      });
    });
  }

  update({ params: p, deltaFrame: d }) {}
}
