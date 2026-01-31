import { Fn, positionGeometry, sin, time, vec3 } from "three/tsl";

interface WavesUniforms {
  // colorA: ShaderNodeObject<UniformNode<Color>>;
  // colorB: ShaderNodeObject<UniformNode<Color>>;
  // mixMin: ShaderNodeObject<UniformNode<number>>;
  // mixMax: ShaderNodeObject<UniformNode<number>>;
  // marbleScale: ShaderNodeObject<UniformNode<number>>;
  // marbleTime: ShaderNodeObject<UniformNode<number>>;
}

// Originally from https://github.com/boytchev/tsl-textures/blob/main/src/caustics.js
export const waves = ({}: WavesUniforms) =>
  Fn(() => {
    const pos = positionGeometry.mul(
      vec3(1, sin(positionGeometry.z.mul(10)), 1),
    );
    const y = pos.y.mul(100).sub(time.mul(15));

    const c = sin(y);

    return vec3(c);
  });
