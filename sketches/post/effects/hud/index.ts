import { Node, WebGPURenderer } from "three/webgpu";
import {
  floor,
  mix,
  screenUV,
  texture,
  uniform,
  vec2,
  step,
  float,
  type ShaderNodeObject,
} from "three/tsl";
import { Border } from "./border";
import { MiniScene } from "./miniScene";

export class Hud {
  border = new Border();
  miniScene = new MiniScene();

  borderTex;
  miniSceneTex;
  aspect = uniform(16 / 9);

  constructor() {
    this.borderTex = texture(this.border.texture);
    this.miniSceneTex = texture(this.miniScene.texture);
  }

  getNode(
    input: ShaderNodeObject<Node>,
    uniforms: Record<string, any>,
  ): ShaderNodeObject<Node> {
    let p = input;

    // Pixelate HUD UVs
    // const hudPixelation = uniforms.miniScene_pixelation;
    // const pixelatedScreenUV = floor(screenUV.mul(hudPixelation)).div(
    //   hudPixelation,
    // );

    // Border overlay
    const borderSample = this.borderTex.context({
      getUV: () => screenUV,
    });
    p = mix(p, borderSample, borderSample.a);

    // Mini scene overlay in corner
    const msScale = uniforms.miniScene_scale;
    const msPosX = uniforms.miniScene_posX;
    const msPosY = uniforms.miniScene_posY;
    const msOpacity = uniforms.miniScene_opacity;
    // Remap UVs to sample the mini scene texture within its corner rect
    // Correct X by aspect ratio so the overlay is square
    // posX/posY are offsets from the bottom-right corner
    const msAspect = this.aspect;
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
    // Slitscan wipe: clamp Y so rows above the frontier sample from the frontier
    const msWipe = uniforms.miniScene_wipe;
    const wipeY = msUV.y.min(msWipe);
    const msWipedUV = vec2(msUV.x, wipeY);
    // Pixelate the mini scene UVs
    const msPixelation = uniforms.miniScene_pixelation;
    const msPixelatedUV = floor(msWipedUV.mul(msPixelation)).div(msPixelation);
    const msSample = this.miniSceneTex.context({ getUV: () => msPixelatedUV });
    const wipeMask = step(float(0.001), msWipe);
    p = mix(p, msSample, msMask.mul(msSample.a).mul(wipeMask));

    // Tint entire HUD with color
    const hudColor = uniforms.hud_color;
    p = mix(input, p.mul(hudColor), step(float(0.001), p.sub(input).length()));

    return p;
  }

  update({
    renderer,
    deltaFrame,
    params,
    camera,
  }: {
    renderer: WebGPURenderer;
    deltaFrame: number;
    params: Record<string, any>;
    camera: { aspect?: number };
  }) {
    this.border.update({
      params: {
        color: params.border_color,
        opacity: params.border_opacity,
        padding: params.border_padding,
        topOffset: params.border_topOffset,
        rightOffset: params.border_rightOffset,
        bottomOffset: params.border_bottomOffset,
        leftOffset: params.border_leftOffset,
        borderWidth: params.border_width,
        bevelTopLeft: params.border_bevelTopLeft,
        bevelTopRight: params.border_bevelTopRight,
        bevelBottomRight: params.border_bevelBottomRight,
        bevelBottomLeft: params.border_bevelBottomLeft,
        text: params.border_text,
        canvasWidth: renderer.domElement.width,
        canvasHeight: renderer.domElement.height,
      },
    });

    this.aspect.value = camera.aspect || 16 / 9;

    this.miniScene.update({
      renderer,
      deltaFrame,
      params: {
        spinSpeed: params.miniScene_spinSpeed,
        cubeColor: params.miniScene_cubeColor,
        wireframeThickness: params.miniScene_wireframeThickness,
      },
    });
  }

  randomPart() {
    this.miniScene.showRandomPart();
  }

  nextPart() {
    this.miniScene.showNextPart();
  }
}
