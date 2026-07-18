import {
  Fn,
  dot,
  mx_noise_float,
  normalLocal,
  positionGeometry,
  positionLocal,
  sin,
  vec3,
  ShaderNodeObject,
} from "three/tsl";
import { UniformNode } from "three/webgpu";

interface DisplacementUniforms {
  displacementAmp: ShaderNodeObject<UniformNode<number>>;
  displacementFreq: ShaderNodeObject<UniformNode<number>>;
  displacementBias: ShaderNodeObject<UniformNode<number>>;
  displacementSpeed: ShaderNodeObject<UniformNode<number>>;
  displacementDirX: ShaderNodeObject<UniformNode<number>>;
  displacementDirY: ShaderNodeObject<UniformNode<number>>;
  displacementDirZ: ShaderNodeObject<UniformNode<number>>;
  displacementTime: ShaderNodeObject<UniformNode<number>>;
}

export const displacement = ({
  displacementAmp,
  displacementFreq,
  displacementBias,
  displacementDirX,
  displacementDirY,
  displacementDirZ,
  displacementTime,
}: DisplacementUniforms) =>
  Fn(() => {
    const displacementDir = vec3(
      displacementDirX,
      displacementDirY,
      displacementDirZ,
    ).normalize();

    const directionalCoord = dot(positionGeometry, displacementDir)
      .mul(displacementFreq)
      .add(displacementTime);

    const displacementWave = sin(directionalCoord).mul(0.5);
    const displacementNoise = mx_noise_float(
      positionGeometry.mul(displacementFreq).add(displacementTime),
    ).mul(0.5);

    const displacementHeight = displacementWave
      .add(displacementNoise)
      .add(displacementBias)
      .mul(displacementAmp);

    return positionLocal.add(normalLocal.normalize().mul(displacementHeight));
  });
