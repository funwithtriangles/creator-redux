import { Node, WebGPURenderer } from "three/webgpu";
import {
  color,
  luminance,
  mix,
  sample,
  screenUV,
  texture,
  uniform,
  vec2,
  step,
  float,
  clamp,
  type ShaderNodeObject,
} from "three/tsl";
import { convertParamsToUniforms, updateUniforms } from "../../uniformUtils";
import {
  bloomParamsConfig,
  gradientMapParamsConfig,
  HSLParamsConfig,
  logoParamsConfig,
  noiseParamsConfig,
  waterParamsConfig,
  borderParamsConfig,
  miniSceneParamsConfig,
} from "./config";
import { hsl } from "./effects/hsl";
import { noise } from "./effects/noise";
import { water } from "./effects/water";
import { Shoutout } from "./effects/shoutout";
import { gradientMap } from "./effects/gradientMap";
import { bloom } from "./effects/bloom";
import Logo from "./effects/logo";
import { Border } from "./effects/border";
import { MiniScene } from "./effects/miniScene";

const uniformsParamsConfig = [
  ...bloomParamsConfig,
  ...HSLParamsConfig,
  ...waterParamsConfig,
  ...gradientMapParamsConfig,
  ...logoParamsConfig,
  ...noiseParamsConfig,
  ...borderParamsConfig,
  ...miniSceneParamsConfig,
];

export default class Post {
  uniforms = convertParamsToUniforms(uniformsParamsConfig);
  water_waveTime = uniform(0);
  renderer: WebGPURenderer;

  logo = new Logo();
  border = new Border();
  miniScene = new MiniScene();
  miniScene_aspect = uniform(16 / 9);

  constructor({ renderer }: { renderer: WebGPURenderer }) {
    this.renderer = renderer;

    this.shoutout = new Shoutout();
    this.shoutoutTex = texture(this.shoutout.texture);
    this.borderTex = texture(this.border.texture);
    this.miniSceneTex = texture(this.miniScene.texture);
    // window._xray_mask = this.shoutoutTex.context({ getUV: () => screenUV }).r;
  }

  getWebGPUPass(prevPass: ShaderNodeObject<Node>): ShaderNodeObject<Node> {
    let p = prevPass;

    this.bloomPass = bloom(p);

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

    const logoTex = texture(this.logo.texture);

    p = p.add(
      p,
      water(
        this.shoutoutTex,
        this.uniforms.water_intensity,
        this.water_waveTime,
      ),
    );

    // Border overlay
    const borderSample = this.borderTex.context({ getUV: () => screenUV });
    p = mix(p, borderSample, borderSample.a);

    // Mini scene overlay in corner
    const msScale = this.uniforms.miniScene_scale;
    const msPosX = this.uniforms.miniScene_posX;
    const msPosY = this.uniforms.miniScene_posY;
    const msOpacity = this.uniforms.miniScene_opacity;
    // Remap UVs to sample the mini scene texture within its corner rect
    // Correct X by aspect ratio so the overlay is square
    // posX/posY are offsets from the bottom-right corner
    const msAspect = this.miniScene_aspect;
    const msScaleX = msScale.div(msAspect);
    const msCenterX = float(1).sub(msPosX).sub(msScaleX.mul(0.5));
    const msCenterY = float(1).sub(msPosY).sub(msScale.mul(0.5));
    const msUV = vec2(
      screenUV.x.sub(msCenterX).add(msScaleX.mul(0.5)).div(msScaleX),
      screenUV.y.sub(msCenterY).add(msScale.mul(0.5)).div(msScale),
    );
    // Mask: 1 inside the rect, 0 outside
    const inX = step(float(0), msUV.x).mul(step(msUV.x, float(1)));
    const inY = step(float(0), msUV.y).mul(step(msUV.y, float(1)));
    const msMask = inX.mul(inY).mul(msOpacity);
    const msSample = this.miniSceneTex.context({ getUV: () => msUV });
    p = mix(p, msSample, msMask.mul(msSample.a));

    p = mix(p, logoTex, logoTex.a.mul(this.uniforms.logo_opacity));

    p = p.add(this.bloomPass);

    p = noise(p, this.uniforms.noise_intensity, this.uniforms.noise_speed);

    return p;
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
        positionX1: params.shoutout_positionX1,
        positionY1: params.shoutout_positionY1,
        scale1: params.shoutout_scale1,
      },
    });

    this.logo.update({ scene, params: { scale: params.logo_scale } });

    this.border.update({
      params: {
        color: params.border_color,
        opacity: params.border_opacity,
        padding: params.border_padding,
        borderWidth: params.border_width,
      },
    });

    this.miniScene_aspect.value = scene.camera.aspect || 16 / 9;

    this.miniScene.update({
      renderer: this.renderer,
      deltaFrame,
      params: {
        spinSpeed: params.miniScene_spinSpeed,
        cubeColor: params.miniScene_cubeColor,
      },
    });

    updateUniforms(uniformsParamsConfig, this.uniforms, params);

    if (this.bloomPass) {
      this.bloomPass.threshold.value = params.bloom_threshold;
      this.bloomPass.strength.value = params.bloom_strength;
      this.bloomPass.radius.value = params.bloom_radius;
    }
  }
}
