import {
  Group,
  LinearFilter,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  Texture,
} from "three";
import { Node, PassNode } from "three/webgpu";

import logoUrl from "./logo-tex.png";
import { mix, ShaderNodeObject, texture } from "three/tsl";
import { convertParamsToUniforms, updateUniforms } from "../../uniformUtils";
import config from "./config";

const textureLoader = new TextureLoader();

export default class Logo {
  root = new Group();
  maskScene = new Scene();
  texture: Texture;
  uniforms = convertParamsToUniforms(config.params);

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

  getWebGPUPass(
    prevPass: ShaderNodeObject<Node>,
    renderPassNode: ShaderNodeObject<PassNode>,
  ): ShaderNodeObject<Node> {
    const logoTex = texture(this.texture);
    return mix(prevPass, logoTex, logoTex.a.mul(this.uniforms.opacity));
  }

  update({ deltaFrame, params: p, scene }) {
    if (!this.texture.image) return;

    updateUniforms(config.params, this.uniforms, p);

    const scale = 1 / p.scale;

    const texAspect = this.texture.image.width / this.texture.image.height;
    const outputAspect = scene.camera.aspect;

    this.texture.repeat.set(1 * scale, (texAspect / outputAspect) * scale);
  }
}
