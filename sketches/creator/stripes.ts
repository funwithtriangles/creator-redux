import {
  abs,
  dot,
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
  stripeDirX: ShaderNodeObject<UniformNode<number>>;
  stripeDirY: ShaderNodeObject<UniformNode<number>>;
  stripeDirZ: ShaderNodeObject<UniformNode<number>>;
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
  stripeDirX,
  stripeDirY,
  stripeDirZ,
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

    const pos = positionGeometry.mul(
      sin(positionGeometry.z.mul(stripeWarpFreq).add(warpNoise)).add(
        stripeWarpBase,
      ),
    );

    const stripies = dot(pos, vec3(stripeDirX, stripeDirY, stripeDirZ))
      .mul(stripeFreq)
      .add(stripeTime);

    const offsetNoise = mx_noise_float(
      positionGeometry.mul(offsetNoiseFreq),
    ).mul(offsetNoiseAmp);

    // Phase offsets for RGB
    const phaseR = phaseROffset.add(offsetNoise.mul(phaseRNoiseMult));
    const phaseG = phaseGOffset.add(offsetNoise.mul(phaseGNoiseMult));
    const phaseB = phaseBOffset.add(offsetNoise.mul(phaseBNoiseMult));

    // Sine for each channel with phase offset
    const r = sin(stripies.add(phaseR.mul(Math.PI * 2)));
    const g = sin(stripies.add(phaseG.mul(Math.PI * 2)));
    const b = sin(stripies.add(phaseB.mul(Math.PI * 2)));

    return vec3(r, g, b);
  });
