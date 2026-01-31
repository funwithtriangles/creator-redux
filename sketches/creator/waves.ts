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
} from "three/tsl";

interface WavesUniforms {
  // colorA: ShaderNodeObject<UniformNode<Color>>;
  // colorB: ShaderNodeObject<UniformNode<Color>>;
  // mixMin: ShaderNodeObject<UniformNode<number>>;
  // mixMax: ShaderNodeObject<UniformNode<number>>;
  // marbleScale: ShaderNodeObject<UniformNode<number>>;
  // marbleTime: ShaderNodeObject<UniformNode<number>>;
}

export const waves = ({}: WavesUniforms) =>
  Fn(() => {
    const warpBase = float(0);
    const warpFreq = float(5);
    const pos = positionGeometry.mul(
      // TODO: expermment with positionGeometry.x for different wave direction
      vec3(1, sin(positionGeometry.z.mul(warpFreq)).add(warpBase), 1),
    );

    const stripeFreq = 100;
    const y = pos.y.mul(stripeFreq).sub(time.mul(8));

    // Phase offsets for RGB
    // TODO: Try tweaking using sin curvature for a more subtle effect
    const phaseR = 0.0;
    const phaseG = 0.1;
    const phaseB = 0.25;

    // Sine for each channel with phase offset
    const r = sin(y.add(phaseR * Math.PI * 2));
    const g = sin(y.add(phaseG * Math.PI * 2));
    const b = sin(y.add(phaseB * Math.PI * 2));

    return vec3(r, g, b);
  });
