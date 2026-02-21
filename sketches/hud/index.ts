import { Node, PassNode, WebGPURenderer } from "three/webgpu";
import { type ShaderNodeObject } from "three/tsl";
import { convertParamsToUniforms, updateUniforms } from "../../uniformUtils";
import {
  borderParamsConfig,
  glyphParamsConfig,
  miniWaveformParamsConfig,
  miniSceneParamsConfig,
  trackerParamsConfig,
} from "./config";

import { Hud } from "./elements";

const uniformsParamsConfig = [
  ...borderParamsConfig,
  ...glyphParamsConfig,
  ...miniWaveformParamsConfig,
  ...miniSceneParamsConfig,
  ...trackerParamsConfig,
];

export default class Post {
  uniforms = convertParamsToUniforms(uniformsParamsConfig);
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
    this.hud.update({
      renderer: this.renderer,
      deltaFrame,
      params,
      camera: scene.camera,
    });

    updateUniforms(uniformsParamsConfig, this.uniforms, params);
  }
}
