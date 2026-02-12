import {
  attribute,
  color,
  float,
  Fn,
  frontFacing,
  fwidth,
  min,
  mix,
  ShaderNodeObject,
  smoothstep,
  uniform,
} from "three/tsl";
import { BufferAttribute, Color, Vector3 } from "three";
import { UniformNode } from "three/webgpu";

export const wireframeAlphaFloat = ({
  thickness: thicknessUniform,
}: {
  thickness: ShaderNodeObject<UniformNode<number>>;
}) =>
  Fn(() => {
    const center = attribute("center", "vec3");

    const thickness = thicknessUniform;

    const afwidth = fwidth(center.xyz);
    const edge3 = smoothstep(
      thickness.sub(1.0).mul(afwidth),
      thickness.mul(afwidth),
      center.xyz,
    );

    const edge = min(min(edge3.x, edge3.y), edge3.z).oneMinus();

    const lineColor = float(1);
    const transparency = float(0);

    return mix(transparency, lineColor, edge);
  })();

interface WireframeEmissiveUniforms {
  wireframeFrontColor: ShaderNodeObject<UniformNode<Color>>;
  wireframeBackColor: ShaderNodeObject<UniformNode<Color>>;
}

export const wireframeEmissiveColor = ({
  wireframeFrontColor,
  wireframeBackColor,
}: WireframeEmissiveUniforms) =>
  Fn(() => {
    return mix(wireframeBackColor, wireframeFrontColor, frontFacing);
  })();

export const setupTriCenterAttributes = (geometry) => {
  if (geometry.index) {
    geometry = geometry.toNonIndexed();
  }

  const vectors = [
    new Vector3(1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, 0, 1),
  ];

  const position = geometry.attributes.position;
  const centers = new Float32Array(position.count * 3);

  for (let i = 0, l = position.count; i < l; i++) {
    vectors[i % 3].toArray(centers, i * 3);
  }

  geometry.setAttribute("center", new BufferAttribute(centers, 3));
  return geometry;
};
