import {
  ShaderNodeObject,
  time,
  mx_worley_noise_float,
  screenUV,
  vec2,
  Fn,
} from "three/tsl";
import { Node, TextureNode } from "three/webgpu";

export const water = (
  passTex: TextureNode,
  intensity: Node,
  time: Node
): ShaderNodeObject<Node> =>
  Fn(() => {
    const waterLayer0 = mx_worley_noise_float(screenUV.mul(4).add(time));
    const waterLayer1 = mx_worley_noise_float(screenUV.mul(2).add(time));

    const waterIntensity = waterLayer0.mul(waterLayer1);

    const refractionUV = screenUV.add(vec2(0, waterIntensity.mul(intensity)));

    return passTex.sample(refractionUV);
  })();
