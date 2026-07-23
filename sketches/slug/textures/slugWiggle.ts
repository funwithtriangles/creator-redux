import {
  abs,
  cos,
  Fn,
  positionLocal,
  round,
  screenUV,
  ShaderNodeObject,
  sin,
  smoothstep,
  step,
  vec3,
} from "three/tsl";
import { Color, UniformNode } from "three/webgpu";

interface WiggleUniforms {
  waveTime: ShaderNodeObject<UniformNode<number>>;
  waveLength: ShaderNodeObject<UniformNode<number>>;
  waveAmp: ShaderNodeObject<UniformNode<number>>;
  sinAmp: ShaderNodeObject<UniformNode<number>>;
  cosAmp: ShaderNodeObject<UniformNode<number>>;
  finWaveLength: ShaderNodeObject<UniformNode<number>>;
  finWaveAmp: ShaderNodeObject<UniformNode<number>>;
  finWaveTime: ShaderNodeObject<UniformNode<number>>;
  crush: ShaderNodeObject<UniformNode<number>>;
}

export const slugWiggle = ({
  waveTime,
  waveLength,
  waveAmp,
  sinAmp,
  cosAmp,
  finWaveLength,
  finWaveAmp,
  finWaveTime,
  crush,
}: WiggleUniforms) => {
  return Fn(() => {
    const twistAngle = sin(positionLocal.y.mul(waveLength).add(waveTime)).mul(
      waveAmp
    );
    const sinAngle = sin(twistAngle.mul(sinAmp));
    const cosAngle = cos(twistAngle.mul(cosAmp));
    let x = positionLocal.x.mul(cosAngle).sub(positionLocal.z.mul(sinAngle));
    let z = positionLocal.x.mul(sinAngle).add(positionLocal.z.mul(cosAngle));

    const finInfluence = smoothstep(7, 8, abs(x));
    const finZ = sin(positionLocal.y.mul(finWaveLength).add(finWaveTime))
      .mul(finWaveAmp)
      .mul(finInfluence);
    z = z.add(finZ);

    z = z.add(sin(positionLocal.y.mul(0.1).add(waveTime.mul(1))).mul(2));

    z = round(z.div(crush)).mul(crush);
    x = round(x.div(crush)).mul(crush);
    let y = round(positionLocal.y.div(crush)).mul(crush);

    // Z is up
    return vec3(x, y, z);
  })();
};
