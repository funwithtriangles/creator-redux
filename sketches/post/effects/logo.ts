import {
  Group,
  LinearFilter,
  RepeatWrapping,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  Texture,
} from "three";

import logoUrl from "./logo-tex.png";
import { min, pass, screenUV, step, texture, mix, Fn } from "three/tsl";

const textureLoader = new TextureLoader();

export default class Logo {
  root = new Group();
  maskScene = new Scene();
  texture: Texture;

  constructor() {
    this.texture = textureLoader.load(logoUrl, (tex) => {
      this.texture.center.set(0.5, 0.5);
    });

    // this.texture1.wrapS = RepeatWrapping;
    // this.texture1.wrapT = RepeatWrapping;

    this.texture.colorSpace = SRGBColorSpace;
    this.texture.minFilter = LinearFilter;
    this.texture.generateMipmaps = false;
    this.texture.flipY = false;
  }

  update({ deltaFrame, params: p, scene }) {
    if (!this.texture.image) return;

    const scale = 1 / p.scale;

    const texAspect = this.texture.image.width / this.texture.image.height;
    const outputAspect = scene.camera.aspect;

    this.texture.repeat.set(1 * scale, (texAspect / outputAspect) * scale);
  }
}
