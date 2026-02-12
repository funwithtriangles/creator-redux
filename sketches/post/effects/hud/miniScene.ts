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
      console.log(gltf);

      gltf.scene.traverse((child) => {
        if (child instanceof Mesh && !child.isScene) {
          console.log(child);
          child.position.set(0, 0, 0);
          this.parts.push(child);
        }
      });

      this.parts.forEach((mesh) => {
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

    this.material.color.setRGB(p.cubeColor[0], p.cubeColor[1], p.cubeColor[2]);

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
