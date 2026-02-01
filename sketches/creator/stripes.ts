import {
  abs,
  float,
  Fn,
  mix,
  positionGeometry,
  sin,
  smoothstep,
  time,
  vec3,
  mx_worley_noise_vec3,
  mx_noise_vec3,
  mx_noise_float,
  ShaderNodeObject,
} from "three/tsl";
import { UniformNode } from "three/webgpu";

interface WavesUniforms {
  stripeFreq: ShaderNodeObject<UniformNode<number>>;
  stripeTime: ShaderNodeObject<UniformNode<number>>;
  stripeWarpFreq: ShaderNodeObject<UniformNode<number>>;
  stripeWarpBase: ShaderNodeObject<UniformNode<number>>;
  warpNoiseFreq: ShaderNodeObject<UniformNode<number>>;
  warpNoiseTime: ShaderNodeObject<UniformNode<number>>;
  warpNoiseAmp: ShaderNodeObject<UniformNode<number>>;
  offsetNoiseFreq: ShaderNodeObject<UniformNode<number>>;
  offsetNoiseAmp: ShaderNodeObject<UniformNode<number>>;
  phaseROffset: ShaderNodeObject<UniformNode<number>>;
  phaseGOffset: ShaderNodeObject<UniformNode<number>>;
  phaseBOffset: ShaderNodeObject<UniformNode<number>>;
  phaseRNoiseMult: ShaderNodeObject<UniformNode<number>>;
  phaseGNoiseMult: ShaderNodeObject<UniformNode<number>>;
  phaseBNoiseMult: ShaderNodeObject<UniformNode<number>>;
}

export const stripes = ({
  stripeFreq,
  stripeTime,
  stripeWarpFreq,
  stripeWarpBase,
  warpNoiseFreq,
  warpNoiseTime,
  warpNoiseAmp,
  offsetNoiseFreq,
  offsetNoiseAmp,
  phaseROffset,
  phaseGOffset,
  phaseBOffset,
  phaseRNoiseMult,
  phaseGNoiseMult,
  phaseBNoiseMult,
}: WavesUniforms) =>
  Fn(() => {
    const warpNoise = mx_noise_float(
      positionGeometry.mul(warpNoiseFreq).add(warpNoiseTime),
    ).mul(warpNoiseAmp);

    const pos = positionGeometry
      // .add(mx_noise_vec3(positionGeometry.mul(0.5).add(time.mul(0.1))).mul(2))
      .mul(
        // TODO: expermment with positionGeometry.x for different wave direction
        vec3(
          1,
          sin(positionGeometry.z.mul(stripeWarpFreq).add(warpNoise)).add(
            stripeWarpBase,
          ),
          1,
        ),
      );

    const y = pos.y.mul(stripeFreq).add(stripeTime);

    const offsetNoise = mx_noise_float(
      positionGeometry.mul(offsetNoiseFreq),
    ).mul(offsetNoiseAmp);

    // Phase offsets for RGB
    const phaseR = phaseROffset.add(offsetNoise.mul(phaseRNoiseMult));
    const phaseG = phaseGOffset.add(offsetNoise.mul(phaseGNoiseMult));
    const phaseB = phaseBOffset.add(offsetNoise.mul(phaseBNoiseMult));

    // Sine for each channel with phase offset
    const r = sin(y.add(phaseR.mul(Math.PI * 2)));
    const g = sin(y.add(phaseG.mul(Math.PI * 2)));
    const b = sin(y.add(phaseB.mul(Math.PI * 2)));

    return vec3(r, g, b);
  });
