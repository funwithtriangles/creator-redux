import {
  Fn,
  mix,
  mx_noise_float,
  positionLocal,
  ShaderNodeObject,
  sin,
  time,
  vec2,
  smoothstep,
  max,
} from "three/tsl";
import { UniformNode } from "three/webgpu";

interface WaveyUniforms {
  ringTime: ShaderNodeObject<UniformNode<number>>;
}

export const ringsTexture = ({ ringTime }: WaveyUniforms) => {
  return Fn(() => {
    const ringsMap = positionLocal.y
      .add(sin(positionLocal.x.mul(0.5).add(Math.PI * 0.5)))
      .add(ringTime);

    const rings = smoothstep(0.6, 0.8, sin(ringsMap));

    return rings;
  })();
};
