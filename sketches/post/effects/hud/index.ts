import { Node, WebGPURenderer } from "three/webgpu";
import {
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

    // Border overlay
    const borderSample = this.borderTex.context({ getUV: () => screenUV });
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
    const msSample = this.miniSceneTex.context({ getUV: () => msUV });
    p = mix(p, msSample, msMask.mul(msSample.a));

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
        borderWidth: params.border_width,
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
