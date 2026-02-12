import * as THREE from "three";

export class Border {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 1920;
    this.canvas.height = 1080;
    this.context = this.canvas.getContext("2d")!;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.flipY = false;
  }

  update({
    params: p,
  }: {
    params: {
      color: [number, number, number];
      opacity: number;
      padding: number;
      topOffset: number;
      rightOffset: number;
      bottomOffset: number;
      leftOffset: number;
      borderWidth: number;
      canvasWidth: number;
      canvasHeight: number;
    };
  }) {
    if (
      this.canvas.width !== p.canvasWidth ||
      this.canvas.height !== p.canvasHeight
    ) {
      // Update the canvas size when screen size changes
      this.canvas.width = p.canvasWidth;
      this.canvas.height = p.canvasHeight;

      // Must dispose the old texture to force a new texture to be created with the new canvas size
      this.texture.dispose();
    }

    const { width, height } = this.canvas;
    const ctx = this.context;

    ctx.clearRect(0, 0, width, height);

    const scale = Math.max(width, height);
    const pad = p.padding * scale;
    const bw = p.borderWidth;

    ctx.strokeStyle = `rgba(${p.color.map((c) => Math.round(c * 255)).join(", ")}, ${p.opacity})`;
    ctx.lineWidth = bw;

    const top = pad + p.topOffset * scale + bw / 2;
    const right = width - (pad + p.rightOffset * scale) - bw / 2;
    const bottom = height - (pad + p.bottomOffset * scale) - bw / 2;
    const left = pad + p.leftOffset * scale + bw / 2;

    if (right > left && bottom > top) {
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, bottom);
      ctx.lineTo(left, bottom);
      ctx.closePath();
      ctx.stroke();
    }

    this.texture.needsUpdate = true;
  }
}
