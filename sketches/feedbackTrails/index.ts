import { Node, PassNode, WebGPURenderer } from "three/webgpu";
import {
  float,
  mix,
  mrt,
  output,
  rotateUV,
  screenUV,
  vec4,
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

  getWebGPUPass(
    prevPass: ShaderNodeObject<Node>,
    renderPassNode: ShaderNodeObject<PassNode>,
  ): ShaderNodeObject<Node> {
    const { rotAngle, scale, mixAmp, direction } = this.uniforms;

    const maskTexture = renderPassNode.getTextureNode("mask");

    const feedbackPass = pingPong(prevPass, (textureNew, textureOld) => {
      // Rotate, scale, and offset UVs for the old (feedback) texture
      const rotated = rotateUV(screenUV, rotAngle.mul(0.1)).toVar();
      rotated.subAssign(0.5);
      rotated.divAssign(float(1).add(scale.mul(0.5)));
      rotated.addAssign(0.5);
      rotated.addAssign(direction.sub(0.5));

      const texelNew = textureNew.sample(screenUV).toVar();
      const texelOld = textureOld.sample(rotated).toVar();
      const mask = maskTexture.sample(screenUV).r;

      // Only write masked geometry pixels into the feedback buffer
      const maskedNew = mix(vec4(0), texelNew, mask);

      // Blend feedback trail behind the geometry (where mask is 0),
      // show the original scene on top (where mask is 1)
      const trail = mix(maskedNew, texelOld, mixAmp);
      return mix(trail, texelNew, mask);
    });

    return feedbackPass.getTextureNode();
  }

  update({ params, deltaFrame, scene }) {
    updateUniforms(config.params, this.uniforms, params);
  }
}
