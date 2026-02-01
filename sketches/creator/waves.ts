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

    const noise = mx_noise_float(
      positionGeometry.mul(2).add(time.mul(0.1)),
    ).mul(0.5);

    const pos = positionGeometry
      // .add(mx_noise_vec3(positionGeometry.mul(0.5).add(time.mul(0.1))).mul(2))
      .mul(
        // TODO: expermment with positionGeometry.x for different wave direction
        vec3(
          1,
          sin(positionGeometry.z.mul(warpFreq).add(noise)).add(warpBase),
          1,
        ),
      );

    const stripeFreq = 100;
    const y = pos.y.mul(stripeFreq).add(time.mul(10));

    const offsetNoise = mx_noise_float(positionGeometry.mul(2)).mul(1);

    // Phase offsets for RGB
    const phaseR = float(0.0).add(offsetNoise.mul(0.1));
    const phaseG = float(0.0).add(offsetNoise.mul(0.2));
    const phaseB = float(0.0).add(offsetNoise.mul(0.4));

    // Sine for each channel with phase offset
    const r = sin(y.add(phaseR.mul(Math.PI * 2)));
    const g = sin(y.add(phaseG.mul(Math.PI * 2)));
    const b = sin(y.add(phaseB.mul(Math.PI * 2)));

    return vec3(r, g, b);
  });
