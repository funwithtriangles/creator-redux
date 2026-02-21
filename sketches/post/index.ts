import { Node, PassNode, WebGPURenderer } from "three/webgpu";
import { uniform, type ShaderNodeObject, convertToTexture } from "three/tsl";
import { convertParamsToUniforms, updateUniforms } from "../../uniformUtils";
import {
  noiseParamsConfig,
  waterParamsConfig,
  borderParamsConfig,
  glyphParamsConfig,
  miniWaveformParamsConfig,
  miniSceneParamsConfig,
  trackerParamsConfig,
} from "./config";
import { noise } from "./effects/noise";
import { water } from "./effects/water";
import { Hud } from "./effects/hud";

const uniformsParamsConfig = [
  ...waterParamsConfig,
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
