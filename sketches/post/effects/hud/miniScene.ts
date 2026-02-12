import {
  Scene,
  OrthographicCamera,
  Mesh,
  BoxGeometry,
  RenderTarget,
  MeshBasicNodeMaterial,
  WebGPURenderer,
  LinearFilter,
  MeshStandardMaterial,
  MeshBasicMaterial,
} from "three/webgpu";

export class MiniScene {
  scene: Scene;
  camera: OrthographicCamera;
  cube: Mesh;
  renderTarget: RenderTarget;
  time = 0;

  constructor() {
    // Mini scene
    this.scene = new Scene();

    // Orthographic camera
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

    // Spinning cube
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });
    this.cube = new Mesh(geometry, material);
    this.scene.add(this.cube);

    // Render target (transparent background)
    this.renderTarget = new RenderTarget(512, 512, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
    });
  }

  get texture() {
    return this.renderTarget.texture;
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
    this.time += deltaFrame * p.spinSpeed * 0.02;
    this.cube.rotation.x = this.time;
    this.cube.rotation.y = this.time * 0.7;

    this.cube.material.color.setRGB(
      p.cubeColor[0],
      p.cubeColor[1],
      p.cubeColor[2],
    );

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
    this.cube.geometry.dispose();
  }
}
