import { UniformNode, Color } from "three/webgpu";
import {
  exp,
  float,
  Fn,
  mix,
  mx_worley_noise_float,
  mx_worley_noise_vec3,
  positionGeometry,
  ShaderNodeObject,
  smoothstep,
  time,
  vec3,
} from "three/tsl";

interface CausticsUniforms {
  colorA: ShaderNodeObject<UniformNode<Color>>;
  colorB: ShaderNodeObject<UniformNode<Color>>;
  mixMin: ShaderNodeObject<UniformNode<number>>;
  mixMax: ShaderNodeObject<UniformNode<number>>;
  marbleScale: ShaderNodeObject<UniformNode<number>>;
  marbleTime: ShaderNodeObject<UniformNode<number>>;
}

// Originally from https://github.com/boytchev/tsl-textures/blob/main/src/caustics.js
export const caustics = ({
  colorA,
  colorB,
  mixMin,
  mixMax,
  marbleScale,
  marbleTime,
}: CausticsUniforms) =>
  Fn(() => {
    console.log("wow");
    var pos = positionGeometry
      .mul(exp(marbleScale.sub(1)))
      .add(1389)
      .toVar();

    const t = vec3(marbleTime, marbleTime.mul(0.1), marbleTime);

    var p = mx_worley_noise_vec3(
      pos.add(
        vec3(
          mx_worley_noise_float(pos.add(t.xyz)),
          mx_worley_noise_float(pos.add(t.yzx)),
          mx_worley_noise_float(pos.add(t.zxy)),
        ),
      ),
    );

    var k = p.length().div(Math.sqrt(3));

    return mix(colorA, colorB, smoothstep(mixMin, mixMax, k));
  });
