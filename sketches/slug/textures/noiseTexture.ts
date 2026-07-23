import {
  color,
  Fn,
  mix,
  mx_noise_float,
  positionLocal,
  screenUV,
  ShaderNodeObject,
  step,
  time,
  vec3,
} from "three/tsl";
import { Color, UniformNode } from "three/webgpu";

interface WaveyUniforms {
  bigNoiseAmp: ShaderNodeObject<UniformNode<number>>;
  noiseTime: ShaderNodeObject<UniformNode<number>>;
  smallNoiseAmp: ShaderNodeObject<UniformNode<number>>;
}

export const noiseTexture = ({
  bigNoiseAmp,
  noiseTime,
  smallNoiseAmp,
}: WaveyUniforms) => {
  return Fn(() => {
    const bigWaves = mx_noise_float(
      positionLocal.xy.div(bigNoiseAmp).add(noiseTime.mul(0.1)),
      5,
      2
    );
    const texSpace = positionLocal.xy.add(bigWaves).add(noiseTime);
    const noiseStripesMap = mx_noise_float(
      texSpace.add(noiseTime.mul(1.5)).div(smallNoiseAmp),
      10,
      1
    );
    return vec3(noiseStripesMap.rgb);
  })();
};
