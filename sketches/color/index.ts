import { Node } from "three/webgpu";
import { type ShaderNodeObject } from "three/tsl";
import { convertParamsToUniforms, updateUniforms } from "../../uniformUtils";
import { gradientMapParamsConfig, HSLParamsConfig } from "./config";
import { hsl } from "./effects/hsl";
import { gradientMap } from "./effects/gradientMap";

const uniformsParamsConfig = [...HSLParamsConfig, ...gradientMapParamsConfig];

export default class Post {
  uniforms = convertParamsToUniforms(uniformsParamsConfig);

  getWebGPUPass(prevPass: ShaderNodeObject<Node>): ShaderNodeObject<Node> {
    let p = prevPass;

    p = gradientMap(
      p,
      this.uniforms.gradientMap_intensity,
      this.uniforms.gradientMap_color0,
      this.uniforms.gradientMap_pos0,
      this.uniforms.gradientMap_color1,
      this.uniforms.gradientMap_pos1,
      this.uniforms.gradientMap_color2,
      this.uniforms.gradientMap_pos2,
    );

    p = hsl(
      p,
      this.uniforms.hsl_hue,
      this.uniforms.hsl_saturation,
      this.uniforms.hsl_luminance,
    );

    return p;
  }

  update({ params, deltaFrame, scene }) {
    updateUniforms(uniformsParamsConfig, this.uniforms, params);
  }
}
