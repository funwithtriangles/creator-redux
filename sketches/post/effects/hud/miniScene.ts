import { GLTFLoader } from "three-stdlib";
import {
  Scene,
  OrthographicCamera,
  Mesh,
  RenderTarget,
  WebGPURenderer,
  LinearFilter,
  MeshBasicMaterial,
  Group,
  Box3,
  Vector3,
} from "three/webgpu";
import glbUrl from "../../../creator/creator.glb";

const gltfLoader = new GLTFLoader();

export class MiniScene {
  scene: Scene;
  group: Group;
  camera: OrthographicCamera;
  renderTarget: RenderTarget;
  parts: Mesh[] = [];
  time = 0;
  currentPartIndex = 0;

  material = new MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
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
          child.position.set(0, 0, 0);
          this.parts.push(child);
        }
      });

      // Compute bounding boxes and cube-root volumes
      const sizes: Vector3[] = [];
      const volumes: number[] = [];
      this.parts.forEach((mesh) => {
        mesh.geometry.computeBoundingBox();
        const size = new Vector3();
        mesh.geometry.boundingBox!.getSize(size);
        sizes.push(size);
        volumes.push(Math.cbrt(size.x * size.y * size.z));
      });

      // Use the average cube-root volume as the reference size
      const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;

      this.parts.forEach((mesh, i) => {
        const scale = avgVolume / volumes[i];
        mesh.scale.setScalar(scale);

        // Center the mesh based on its scaled bounding box
        const center = new Vector3();
        mesh.geometry.boundingBox!.getCenter(center);
        mesh.position.set(
          -center.x * scale,
          -center.y * scale,
          -center.z * scale,
        );

        this.group.add(mesh);
        mesh.material = this.material;
        mesh.visible = false;
      });

      this.showPart(0);
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
    if (this.parts.length === 0) return;

    const randomIndex = Math.floor(Math.random() * this.parts.length);
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
    };
  }) {
    if (this.parts.length === 0) return;

    this.time += deltaFrame * p.spinSpeed * 0.02;
    this.group.rotation.y = this.time;
    this.group.rotation.x = this.time * 0.5;

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
