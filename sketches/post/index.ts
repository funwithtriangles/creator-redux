import { Node, PassNode, WebGPURenderer } from "three/webgpu";
import { uniform, type ShaderNodeObject, convertToTexture } from "three/tsl";
import { convertParamsToUniforms, updateUniforms } from "../../uniformUtils";
import {
  gradientMapParamsConfig,
  HSLParamsConfig,
  noiseParamsConfig,
  waterParamsConfig,
  borderParamsConfig,
  glyphParamsConfig,
  miniWaveformParamsConfig,
  miniSceneParamsConfig,
  trackerParamsConfig,
} from "./config";
import { hsl } from "./effects/hsl";
import { noise } from "./effects/noise";
import { water } from "./effects/water";
import { gradientMap } from "./effects/gradientMap";
import { Hud } from "./effects/hud";

const uniformsParamsConfig = [
  ...HSLParamsConfig,
  ...waterParamsConfig,
  ...gradientMapParamsConfig,
  ...noiseParamsConfig,
  ...borderParamsConfig,
  ...glyphParamsConfig,
  ...miniWaveformParamsConfig,
  ...miniSceneParamsConfig,
  ...trackerParamsConfig,
];

export default class Post {
  uniforms = convertParamsToUniforms(uniformsParamsConfig);
  water_waveTime = uniform(0);
  renderer: WebGPURenderer;

  hud = new Hud();

  constructor({ renderer }: { renderer: WebGPURenderer }) {
    this.renderer = renderer;
    // window._xray_mask = this.shoutoutTex.context({ getUV: () => screenUV }).r;
  }

  getWebGPUPass(
    prevPass: ShaderNodeObject<Node>,
    renderPassNode: ShaderNodeObject<PassNode>,
  ): ShaderNodeObject<Node> {
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

    // HUD overlay (border + mini scene)
    p = this.hud.getNode(p, this.uniforms);

    p = water(
      convertToTexture(p),
      this.uniforms.water_intensity,
      this.water_waveTime,
    );

    p = noise(p, this.uniforms.noise_intensity, this.uniforms.noise_speed);

    return p;
  }

  nextPart() {
    this.hud.nextPart();
  }

  randomPart() {
    this.hud.randomPart();
  }

  newTrackerLine() {
    this.hud.newTrackerLine();
  }

  clearTrackerLines() {
    this.hud.clearTrackerLines();
  }

  newAlienGlyph() {
    this.hud.newAlienGlyph();
  }

  update({ params, deltaFrame, scene }) {
    this.water_waveTime.value += params.water_speed * deltaFrame;

    this.hud.update({
      renderer: this.renderer,
      deltaFrame,
      params,
      camera: scene.camera,
    });

    updateUniforms(uniformsParamsConfig, this.uniforms, params);
  }
}
