import {
  RenderTarget,
  Vector2,
  QuadMesh,
  NodeMaterial,
  RendererUtils,
  TempNode,
  NodeUpdateType,
  NodeFrame,
  NodeBuilder,
  TextureNode,
  Node,
} from "three/webgpu";
import {
  Fn,
  uv,
  texture,
  passTexture,
  convertToTexture,
  type ShaderNodeObject,
} from "three/tsl";

type ComposeFn = (
  texelNew: ShaderNodeObject<Node>,
  texelOld: ShaderNodeObject<Node>,
) => ShaderNodeObject<Node>;

const _size = /*@__PURE__*/ new Vector2();
const _quadMesh = /*@__PURE__*/ new QuadMesh();

let _rendererState: ReturnType<typeof RendererUtils.resetRendererState>;

/**
 * Generic ping-pong buffer node for feedback effects.
 *
 * Manages two render targets that swap each frame, giving you access
 * to both the current input and the previous frame's output. You supply
 * a compose function that receives the sampled texels and returns the
 * combined result.
 *
 * @augments TempNode
 */
class PingPongNode extends TempNode {
  static get type() {
    return "PingPongNode";
  }

  textureNode: ShaderNodeObject<TextureNode>;
  composeFn: ComposeFn;

  _compRT: RenderTarget;
  _oldRT: RenderTarget;
  _textureNode: ReturnType<typeof passTexture>;
  _textureNodeOld: ShaderNodeObject<TextureNode>;
  _materialComposed: NodeMaterial | null;

  /**
   * @param textureNode - The input texture node (current frame).
   * @param composeFn - A function `(texelNew, texelOld) => Node<vec4>` called
   *   inside a TSL `Fn` context. `texelNew` and `texelOld` are already-sampled
   *   `vec4` variables you can manipulate and combine.
   */
  constructor(
    textureNode: ShaderNodeObject<TextureNode>,
    composeFn: ComposeFn,
  ) {
    super("vec4");

    this.textureNode = textureNode;
    this.composeFn = composeFn;

    this._compRT = new RenderTarget(1, 1, { depthBuffer: false });
    this._compRT.texture.name = "PingPong.comp";

    this._oldRT = new RenderTarget(1, 1, { depthBuffer: false });
    this._oldRT.texture.name = "PingPong.old";

    // passTexture expects a PassNode but this works at runtime with any TempNode
    this._textureNode = passTexture(this as any, this._compRT.texture);
    this._textureNodeOld = texture(this._oldRT.texture);

    this._materialComposed = null;

    this.updateBeforeType = NodeUpdateType.FRAME;
  }

  getTextureNode(): ShaderNodeObject<Node> {
    return this._textureNode as unknown as ShaderNodeObject<Node>;
  }

  setSize(width: number, height: number): void {
    this._compRT.setSize(width, height);
    this._oldRT.setSize(width, height);
  }

  updateBefore(frame: NodeFrame): void {
    const renderer = frame.renderer!;

    _rendererState = RendererUtils.resetRendererState(renderer, _rendererState);

    const textureNode = this.textureNode;
    const map = textureNode.value;
    const textureType = map.type;

    this._compRT.texture.type = textureType;
    this._oldRT.texture.type = textureType;

    renderer.getDrawingBufferSize(_size);
    this.setSize(_size.x, _size.y);

    this._textureNode.value = this._compRT.texture;
    this._textureNodeOld.value = this._oldRT.texture;

    _quadMesh.material = this._materialComposed!;
    _quadMesh.name = "PingPong";

    renderer.setRenderTarget(this._compRT);
    _quadMesh.render(renderer);

    // swap
    const temp = this._oldRT;
    this._oldRT = this._compRT;
    this._compRT = temp;

    RendererUtils.restoreRendererState(renderer, _rendererState);
  }

  setup(builder: NodeBuilder) {
    const textureNode = this.textureNode;
    const textureNodeOld = this._textureNodeOld;

    textureNodeOld.uvNode = textureNode.uvNode || uv();

    const uvNode = textureNodeOld.uvNode;

    const compose = Fn(() => {
      const texelNew = textureNode.sample(uvNode).toVar();
      const texelOld = textureNodeOld.sample(uvNode).toVar();
      return this.composeFn(texelNew, texelOld);
    });

    const materialComposed =
      this._materialComposed || (this._materialComposed = new NodeMaterial());
    materialComposed.name = "PingPong";
    materialComposed.fragmentNode = compose();

    const properties = builder.getNodeProperties(this);
    properties.textureNode = textureNode;

    return this._textureNode;
  }

  dispose(): void {
    this._compRT.dispose();
    this._oldRT.dispose();

    if (this._materialComposed !== null) this._materialComposed.dispose();
  }
}

/**
 * Creates a ping-pong feedback node.
 *
 * @param node - The input node (current frame).
 * @param composeFn - `(texelNew, texelOld) => Node<vec4>` — combine the
 *   current frame with the previous frame's output.
 */
export const pingPong = (node: ShaderNodeObject<Node>, composeFn: ComposeFn) =>
  new PingPongNode(convertToTexture(node), composeFn);

export default PingPongNode;
