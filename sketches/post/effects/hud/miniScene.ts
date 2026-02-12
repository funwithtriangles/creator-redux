import { GLTFLoader } from "three-stdlib";
import {
  Scene,
  OrthographicCamera,
  Mesh,
  RenderTarget,
  WebGPURenderer,
  LinearFilter,
  MeshBasicNodeMaterial,
  Group,
  Box3,
  Vector3,
  Color,
} from "three/webgpu";
import { uniform } from "three/tsl";
import glbUrl from "../../../creator/creator.glb";
import {
  wireframeAlphaFloat,
  wireframeEmissiveColor,
  setupTriCenterAttributes,
} from "./wireframe";

const gltfLoader = new GLTFLoader();

export class MiniScene {
  scene: Scene;
  group: Group;
  camera: OrthographicCamera;
  renderTarget: RenderTarget;
  parts: Group[] = [];
  meshes: Mesh[] = [];
  time = 0;
  currentPartIndex = 0;

  wireframeFrontColor = uniform(new Color(0xffffff));
  wireframeBackColor = uniform(new Color(0x888888));
  wireframeThickness = uniform(1.5);

  material = new MeshBasicNodeMaterial({
    transparent: true,
    side: 2, // DoubleSide
    colorNode: wireframeEmissiveColor({
      wireframeFrontColor: this.wireframeFrontColor,
      wireframeBackColor: this.wireframeBackColor,
    }),
    opacityNode: wireframeAlphaFloat({
      thickness: this.wireframeThickness,
    }),
  });

  constructor() {
    this.scene = new Scene();
    this.group = new Group();
    this.scene.add(this.group);

    const frustum = 2;
    this.camera = new OrthographicCamera(
      -frustum,
      frustum,
      frustum,
      -frustum,
      0.1,
      100,
    );
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);

    gltfLoader.load(glbUrl, (gltf) => {
      gltf.scene.traverse((child) => {
        if (child instanceof Mesh && !child.isScene) {
          this.meshes.push(child);
        }
      });

      gltf.scene.children.forEach((child) => {
        if (child.name === "rest") return;
        this.parts.push(child);
      });

      this.parts.forEach((part) => {
        this.group.add(part);
        part.position.set(0, 0, 0);
        part.visible = false;
      });

      this.meshes.forEach((mesh) => {
        mesh.geometry = setupTriCenterAttributes(mesh.geometry);
        mesh.material = this.material;
      });

      // Compute bounding box volume for each group using Box3
      const box = new Box3();
      const size = new Vector3();
      const volumes: number[] = [];

      this.parts.forEach((part) => {
        box.setFromObject(part);
        box.getSize(size);
        volumes.push(Math.cbrt(size.x * size.y * size.z));
      });

      // Use the average cube-root volume as the reference size
      const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;

      this.parts.forEach((part, i) => {
        const scale = avgVolume / volumes[i];
        part.scale.setScalar(scale);

        // Center the group based on its scaled bounding box
        box.setFromObject(part);
        const center = new Vector3();
        box.getCenter(center);
        part.position.sub(center);
      });

      this.showPart(1);
    });

    this.renderTarget = new RenderTarget(512, 512, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
    });
  }

  get texture() {
    return this.renderTarget.texture;
  }

  showPart(index: number) {
    if (this.parts.length === 0) return;

    this.parts.forEach((part, i) => {
      part.visible = i === index;
    });

    this.currentPartIndex = index;
  }

  showRandomPart() {
    if (this.parts.length <= 1) return;

    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * this.parts.length);
    } while (randomIndex === this.currentPartIndex);
    this.showPart(randomIndex);
  }

  showNextPart() {
    if (this.parts.length === 0) return;

    const nextIndex = (this.currentPartIndex + 1) % this.parts.length;
    this.showPart(nextIndex);
  }

  update({
    renderer,
    deltaFrame,
    params: p,
  }: {
    renderer: WebGPURenderer;
    deltaFrame: number;
    params: {
      spinSpeed: number;
      cubeColor: [number, number, number];
      wireframeThickness: number;
    };
  }) {
    if (this.parts.length === 0) return;

    this.wireframeThickness.value = p.wireframeThickness;
    this.time += deltaFrame * p.spinSpeed * 0.02;
    this.group.rotation.y = this.time;
    // this.group.rotation.x = this.time * 0.5;

    // Render mini scene to render target
    const currentTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(this.renderTarget);
    renderer.setClearColor(0x000000, 0);
    renderer.clearAsync();
    renderer.renderAsync(this.scene, this.camera);
    renderer.setRenderTarget(currentTarget);
  }

  dispose() {
    this.renderTarget.dispose();
    this.material.dispose();
  }
}
