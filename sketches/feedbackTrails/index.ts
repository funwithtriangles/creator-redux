import {
  Node,
  RenderTarget,
  Texture,
  TextureNode,
  WebGPURenderer,
} from "three/webgpu";
import {
  convertToTexture,
  screenUV,
  uniform,
  type ShaderNodeObject,
} from "three/tsl";
import { convertParamsToUniforms, updateUniforms } from "../../uniformUtils";
import config from "./config";
import { afterImage } from "./afterImage";

export default class FeedbackTrails {
  uniforms = convertParamsToUniforms(config.params);
  renderTarget = new RenderTarget(1920, 1080);
  renderer: WebGPURenderer;

  constructor({ renderer }) {
    this.renderer = renderer;
  }

  getWebGPUPass(prevPass: ShaderNodeObject<Node>): ShaderNodeObject<Node> {
    let p = prevPass;

    const afterImagePass = afterImage(p, 0.8);

    return afterImagePass.getTextureNode();
  }

  update({ params, deltaFrame, scene }) {
    updateUniforms(config.params, this.uniforms, params);
  }
}
