import { Node } from "three/webgpu";
import { convertToTexture, uniform, type ShaderNodeObject } from "three/tsl";
import { convertParamsToUniforms, updateUniforms } from "../../uniformUtils";
import config from "./config";
import { water } from "./water";

export default class Post {
  uniforms = convertParamsToUniforms(config.params);
  waveTime = uniform(0);

  getWebGPUPass(prevPass: ShaderNodeObject<Node>): ShaderNodeObject<Node> {
    let p = prevPass;

    p = water(convertToTexture(p), this.uniforms.intensity, this.waveTime);

    return p;
  }

  update({ params, deltaFrame, scene }) {
    this.waveTime.value += params.speed * deltaFrame;
    updateUniforms(config.params, this.uniforms, params);
  }
}
