import * as THREE from "three";
import tiny5FontUrl from "@fontsource/tiny5/files/tiny5-latin-400-normal.woff2";
import { ensureFontInjected } from "./fontUtils";

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
    ensureFontInjected({
      fontFamily: "Tiny5",
      fontUrl: tiny5FontUrl,
    });
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
      bevelTopLeft: number;
      bevelTopRight: number;
      bevelBottomRight: number;
      bevelBottomLeft: number;
      text: string;
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
    const maxBevel = Math.max(
      0,
      Math.min((right - left) / 2, (bottom - top) / 2),
    );
    const bevelTopLeft = Math.min(
      Math.max(0, p.bevelTopLeft * scale),
      maxBevel,
    );
    const bevelTopRight = Math.min(
      Math.max(0, p.bevelTopRight * scale),
      maxBevel,
    );
    const bevelBottomRight = Math.min(
      Math.max(0, p.bevelBottomRight * scale),
      maxBevel,
    );
    const bevelBottomLeft = Math.min(
      Math.max(0, p.bevelBottomLeft * scale),
      maxBevel,
    );

    if (right > left && bottom > top) {
      ctx.beginPath();
      ctx.moveTo(left + bevelTopLeft, top);
      ctx.lineTo(right - bevelTopRight, top);
      ctx.lineTo(right, top + bevelTopRight);
      ctx.lineTo(right, bottom - bevelBottomRight);
      ctx.lineTo(right - bevelBottomRight, bottom);
      ctx.lineTo(left + bevelBottomLeft, bottom);
      ctx.lineTo(left, bottom - bevelBottomLeft);
      ctx.lineTo(left, top + bevelTopLeft);
      ctx.closePath();
      ctx.stroke();
    }

    if (p.text) {
      const fontSize = Math.max(12, Math.round(scale * 0.03));
      ctx.fillStyle = `rgba(${p.color.map((c) => Math.round(c * 255)).join(", ")}, ${p.opacity})`;
      ctx.font = `${fontSize}px "Tiny5", monospace`;
      ctx.textBaseline = "top";
      ctx.fillText(p.text, left + bevelTopLeft + bw * 2, top + bw * 2);
    }

    this.texture.needsUpdate = true;
  }
}
