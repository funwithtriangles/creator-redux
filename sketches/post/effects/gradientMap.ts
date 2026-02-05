import { ShaderNodeObject, luminance, mix, smoothstep } from "three/tsl";
import { Node } from "three/webgpu";

export const gradientMap = (
  prevPass: ShaderNodeObject<Node>,
  intensity: Node,
  c0: Node,
  p0: Node,
  c1: Node,
  p1: Node,
  c2: Node,
  p2: Node
): ShaderNodeObject<Node> => {
  const lum = luminance(prevPass.rgb);
  let gradientColor = mix(c0, c1, smoothstep(p0, p1, lum));
  gradientColor = mix(gradientColor, c2, smoothstep(p1, p2, lum));

  return mix(prevPass, gradientColor, intensity);
};
