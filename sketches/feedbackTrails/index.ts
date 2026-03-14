import { Node, WebGPURenderer } from "three/webgpu";
import {
  float,
  mix,
  rotateUV,
  screenUV,
  type ShaderNodeObject,
} from "three/tsl";
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
    const { rotAngle, scale, mixAmp, direction } = this.uniforms;

    const feedbackPass = pingPong(prevPass, (textureNew, textureOld) => {
      // Rotate, scale, and offset UVs for the old (feedback) texture
      const rotated = rotateUV(screenUV, rotAngle.mul(0.1)).toVar();
      rotated.subAssign(0.5);
      rotated.divAssign(float(1).add(scale.mul(0.5)));
      rotated.addAssign(0.5);
      rotated.addAssign(direction.sub(0.5));

      const texelNew = textureNew.sample(screenUV).toVar();
      const texelOld = textureOld.sample(rotated).toVar();

      return mix(texelNew, texelOld, mixAmp);
    });

    return feedbackPass.getTextureNode();
  }

  update({ params, deltaFrame, scene }) {
    updateUniforms(config.params, this.uniforms, params);
  }
}
