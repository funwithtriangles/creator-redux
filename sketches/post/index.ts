import { Node, WebGPURenderer } from "three/webgpu";
import {
  mix,
  screenUV,
  texture,
  uniform,
  float,
  type ShaderNodeObject,
} from "three/tsl";
import { convertParamsToUniforms, updateUniforms } from "../../uniformUtils";
import {
  gradientMapParamsConfig,
  HSLParamsConfig,
  logoParamsConfig,
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
import { Shoutout } from "./effects/shoutout";
import { gradientMap } from "./effects/gradientMap";
import Logo from "./effects/logo";
import { Hud } from "./effects/hud";

const uniformsParamsConfig = [
  ...HSLParamsConfig,
  ...waterParamsConfig,
  ...gradientMapParamsConfig,
  ...logoParamsConfig,
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

  logo = new Logo();
  hud = new Hud();

  constructor({ renderer }: { renderer: WebGPURenderer }) {
    this.renderer = renderer;

    this.shoutout = new Shoutout();
    this.shoutoutTex = texture(this.shoutout.texture);

    // window._xray_mask = this.shoutoutTex.context({ getUV: () => screenUV }).r;
  }

  getWebGPUPass(prevPass: ShaderNodeObject<Node>): ShaderNodeObject<Node> {
    let p = prevPass;

    // console.log();
    p = water(
      p.getTextureNode(),
      this.uniforms.water_intensity,
      this.water_waveTime,
    );

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

    p = p.add(
      p,
      water(
        this.shoutoutTex,
        this.uniforms.water_intensity,
        this.water_waveTime,
      ),
    );

    // HUD overlay (border + mini scene)
    p = this.hud.getNode(p, this.uniforms);

    const logoTex = texture(this.logo.texture);
    p = mix(p, logoTex, logoTex.a.mul(this.uniforms.logo_opacity));

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

    this.shoutout.update({
      params: {
        message: params.shoutout_message,
        scrollSpeed: params.shoutout_scrollSpeed,
        color: params.shoutout_color,
        positionX: params.shoutout_positionX,
        positionY: params.shoutout_positionY,
        scale: params.shoutout_scale,
        rotation: params.shoutout_rotation,
        opacity: params.shoutout_opacity,
        message1: params.shoutout_message1,
        message2: params.shoutout_message2,
        positionX1: params.shoutout_positionX1,
        positionX2: params.shoutout_positionX2,
        positionY1: params.shoutout_positionY1,
        positionY2: params.shoutout_positionY2,
        scale1: params.shoutout_scale1,
        scale2: params.shoutout_scale2,
      },
    });

    this.logo.update({ scene, params: { scale: params.logo_scale } });

    this.hud.update({
      renderer: this.renderer,
      deltaFrame,
      params,
      camera: scene.camera,
    });

    updateUniforms(uniformsParamsConfig, this.uniforms, params);
  }
}
