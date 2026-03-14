import { Node, WebGPURenderer } from "three/webgpu";
import { float, max, sign, type ShaderNodeObject } from "three/tsl";
import { convertParamsToUniforms, updateUniforms } from "../../uniformUtils";
import config from "./config";
import { pingPong } from "./pingPongNode";

export default class FeedbackTrails {
  uniforms = convertParamsToUniforms(config.params);
  renderer: WebGPURenderer;

  constructor({ renderer }) {
    this.renderer = renderer;
  }

  getWebGPUPass(prevPass: ShaderNodeObject<Node>): ShaderNodeObject<Node> {
    const damp = this.uniforms.intensity;

    const feedbackPass = pingPong(prevPass, (texelNew, texelOld) => {
      const threshold = float(0.1).toConst();
      const m = max(sign(texelOld.sub(threshold)), 0.0);
      texelOld.mulAssign(damp.mul(m));
      return max(texelNew, texelOld);
    });

    return feedbackPass.getTextureNode();
  }

  update({ params, deltaFrame, scene }) {
    updateUniforms(config.params, this.uniforms, params);
  }
}
