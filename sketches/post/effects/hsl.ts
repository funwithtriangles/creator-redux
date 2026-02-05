import { ShaderNodeObject, hue, saturation } from "three/tsl";
import { Node } from "three/webgpu";

export const hsl = (
  prevPass: ShaderNodeObject<Node>,
  h: Node,
  s: Node,
  l: Node
): ShaderNodeObject<Node> => hue(saturation(prevPass, s), h).mul(l);
