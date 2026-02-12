import * as THREE from "three";

interface CameraConstructorParams {
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
}

interface UpdateParams {
  params: Record<string, any>;
  deltaFrame: number;
}

const TAU = Math.PI * 2;

const { lerp } = THREE.MathUtils;

const easeOutCubic = (x: number): number => {
  return 1 - Math.pow(1 - x, 3);
};

const easeOutSine = (x: number): number => {
  return Math.sin((x * Math.PI) / 2);
};

export default class Camera {
  root: THREE.Group;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  lookAtPos: THREE.Vector3;
  orbitDelta = 0;
  latchDelta = 0;
  lerpDelta = 0;
  head: THREE.Object3D | null = null;
  currentMode: "orbit" | "closeUp" = "orbit";
  isFirstFrame = true;

  constructor({ camera, scene }: CameraConstructorParams) {
    this.root = new THREE.Group();
    this.scene = scene;
    this.scene.add(camera);

    this.camera = camera;
    this.camera.near = 0.0001;
    this.lookAtPos = new THREE.Vector3();

    // Hack to position cameras on JBoys head
    setTimeout(() => {
      const item = scene.getObjectByName("mixamorigHead");
      if (item) {
        this.head = item;
      }
    }, 3000);
  }

  closeUp() {
    if (this.head) {
      this.head.add(this.camera);
      this.currentMode = "closeUp";
    }
  }

  orbitCam() {
    this.scene.add(this.camera);
    this.currentMode = "orbit";
  }

  update({ params: p, deltaFrame: f }: UpdateParams) {
    if (this.isFirstFrame) {
      this.orbitDelta = p.orbitRot;
      this.latchDelta = this.orbitDelta;
      this.lerpDelta = 1;
    }

    if (this.currentMode != p.mode) {
      if (p.mode === "closeUp") {
        this.closeUp();
      } else {
        this.orbitCam();
      }
    }

    this.camera.fov = p.fov;
    this.camera.zoom = p.zoom;
    this.camera.filmOffset = p.filmOffset;
    this.camera.updateProjectionMatrix();

    if (this.currentMode === "orbit") {
      let rot;
      if (p.isRotating && !this.isFirstFrame) {
        this.orbitDelta = (this.orbitDelta + f * p.rotSpeed) % TAU;
        this.lerpDelta = 0;
        this.latchDelta = this.orbitDelta;
      } else {
        let diff = p.orbitRot - this.orbitDelta;
        if (diff < 0) {
          diff += TAU;
        }

        const step = p.rotSpeed / TAU;
        const target = this.orbitDelta + diff;

        if (this.lerpDelta < 1) {
          this.lerpDelta += step;
          this.orbitDelta = lerp(
            this.latchDelta,
            target,
            easeOutCubic(this.lerpDelta),
          );
        } else {
          this.orbitDelta = target % TAU;
        }
      }

      rot = this.orbitDelta;

      const x = Math.sin(rot) * p.orbitRad * p.bigZoom;
      const z = Math.cos(rot) * p.orbitRad * p.bigZoom;
      this.lookAtPos.set(0, p.lookAtPosY, 0);
      this.camera.position.set(x, p.camY, z);
      this.camera.lookAt(this.lookAtPos);
    } else {
      this.camera.rotation.set(0, 0, 0);
      this.camera.position.set(0, 0, p.headCamDistance * 80);
    }

    this.isFirstFrame = false;
  }
}
