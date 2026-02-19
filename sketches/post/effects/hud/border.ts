import * as THREE from "three";
import bitesizedFontUrl from "@fontsource/bytesized/files/bytesized-latin-400-normal.woff2";
import { ensureFontInjected } from "./fontUtils";

type GlyphTile =
  | { shape: "empty" }
  | { shape: "square" }
  | { shape: "triangle"; orientation: 0 | 1 | 2 | 3 };

export class Border {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  trackerLines: string[] = [];
  glyphHistory: GlyphTile[][] = [];
  glyphTrailCount = 1;
  glyphSquareProbability = 0.375;
  glyphTriangleProbability = 0.375;
  glyphEmptyProbability = 0.25;
  miniWaveformSamples: number[] = [];

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 1920;
    this.canvas.height = 1080;
    this.context = this.canvas.getContext("2d")!;

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.flipY = false;
    ensureFontInjected({
      fontFamily: "Bytesized",
      fontUrl: bitesizedFontUrl,
    });

    this.newAlienGlyph();
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
      titleText: string;
      titleTextPos: [number, number];
      partText: string;
      partTextPos: [number, number];
      trackerTextPos: [number, number];
      trackerLines: number;
      glyphScale: number;
      glyphPos: [number, number];
      glyphTrailCount: number;
      glyphGutter: number;
      glyphSquareProbability: number;
      glyphTriangleProbability: number;
      glyphEmptyProbability: number;
      miniWaveform_latestValue: number;
      miniWaveform_pos: [number, number];
      miniWaveform_width: number;
      miniWaveform_height: number;
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

    this.glyphSquareProbability = Math.max(0, p.glyphSquareProbability);
    this.glyphTriangleProbability = Math.max(0, p.glyphTriangleProbability);
    this.glyphEmptyProbability = Math.max(0, p.glyphEmptyProbability);
    this.glyphTrailCount = Math.max(0, Math.floor(p.glyphTrailCount));

    if (this.glyphTrailCount === 0) {
      this.glyphHistory = [];
    } else if (this.glyphHistory.length > this.glyphTrailCount) {
      this.glyphHistory = this.glyphHistory.slice(0, this.glyphTrailCount);
    }

    if (this.glyphHistory.length === 0 && this.glyphTrailCount > 0) {
      this.newAlienGlyph();
    }

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

    if (p.titleText) {
      this.drawText({
        text: p.titleText,
        x: p.titleTextPos[0] * width,
        y: p.titleTextPos[1] * height,
        fontSize: Math.max(12, Math.round(scale * 0.025)),
        color: p.color,
        opacity: p.opacity,
        clearPadding: 10,
      });
    }

    if (p.partText) {
      this.drawText({
        text: p.partText,
        x: p.partTextPos[0] * width,
        y: p.partTextPos[1] * height,
        fontSize: Math.max(10, Math.round(scale * 0.02)),
        color: p.color,
        opacity: p.opacity,
        clearPadding: 10,
      });
    }

    const trackerFontSize = Math.max(8, Math.round(scale * 0.015));
    const trackerLineHeight = Math.max(10, Math.round(trackerFontSize * 1.2));
    const trackerTop = p.trackerTextPos[1] * height;

    const maxTrackerRows = Math.floor(p.trackerLines);

    if (maxTrackerRows === 0) {
      this.trackerLines = [];
    } else if (this.trackerLines.length > maxTrackerRows) {
      this.trackerLines = this.trackerLines.slice(-maxTrackerRows);
    }

    this.trackerLines.forEach((line, index) => {
      this.drawText({
        text: line,
        x: p.trackerTextPos[0] * width,
        y: trackerTop + index * trackerLineHeight,
        fontSize: trackerFontSize,
        color: p.color,
        opacity: p.opacity,
        clearPadding: Math.max(1, Math.round(bw * 0.5)),
      });
    });

    const glyphScale = Math.max(0.1, p.glyphScale);
    const glyphSize = Math.max(
      24,
      Math.round(Math.min(width, height) * 0.11 * glyphScale),
    );
    const glyphGutter = Math.max(0, p.glyphGutter);
    const glyphX = p.glyphPos[0] * width;
    const glyphY = p.glyphPos[1] * height;

    const tileSize = Math.max(2, glyphSize / 3);
    const glyphStepX = tileSize * 3 + glyphGutter * tileSize;

    this.glyphHistory.forEach((glyphTiles, index) => {
      this.drawGlyph({
        glyphTiles,
        x: glyphX + glyphStepX * index,
        y: glyphY,
        size: glyphSize,
        color: p.color,
        opacity: p.opacity,
      });
    });

    this.drawMiniWaveform({
      latestValue: p.miniWaveform_latestValue,
      x: p.miniWaveform_pos[0] * width,
      y: p.miniWaveform_pos[1] * height,
      width: p.miniWaveform_width * width,
      height: p.miniWaveform_height * height,
      color: p.color,
      opacity: p.opacity,
      lineWidth: Math.max(1, bw * 0.5),
    });

    this.texture.needsUpdate = true;
  }

  newTrackerLine() {
    const nextLine = `0x${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .toUpperCase()
      .padStart(6, "0")}`;
    this.trackerLines.push(nextLine);
  }

  clearTrackerLines() {
    this.trackerLines = [];
  }

  newAlienGlyph() {
    const squareProb = Math.max(0, this.glyphSquareProbability);
    const triangleProb = Math.max(0, this.glyphTriangleProbability);
    const emptyProb = Math.max(0, this.glyphEmptyProbability);
    const totalProb = squareProb + triangleProb + emptyProb;

    const normalizedSquareProb = totalProb > 0 ? squareProb / totalProb : 1 / 3;
    const normalizedEmptyProb = totalProb > 0 ? emptyProb / totalProb : 1 / 3;

    const nextGlyphTiles = Array.from({ length: 9 }, () => {
      const roll = Math.random();

      if (roll < normalizedEmptyProb) {
        return { shape: "empty" } as const;
      }

      if (roll < normalizedEmptyProb + normalizedSquareProb) {
        return { shape: "square" } as const;
      }

      return {
        shape: "triangle",
        orientation: Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3,
      } as const;
    });

    this.glyphHistory.unshift(nextGlyphTiles);

    if (
      this.glyphTrailCount > 0 &&
      this.glyphHistory.length > this.glyphTrailCount
    ) {
      this.glyphHistory = this.glyphHistory.slice(0, this.glyphTrailCount);
    }
  }

  drawGlyph({
    glyphTiles,
    x,
    y,
    size,
    color,
    opacity,
  }: {
    glyphTiles: GlyphTile[];
    x: number;
    y: number;
    size: number;
    color: [number, number, number];
    opacity: number;
  }) {
    if (glyphTiles.length !== 9) {
      return;
    }

    const ctx = this.context;
    const tileSize = Math.max(2, size / 3);

    ctx.fillStyle = `rgba(${color.map((c) => Math.round(c * 255)).join(", ")}, ${opacity})`;

    for (let i = 0; i < 9; i++) {
      const tile = glyphTiles[i];
      const col = i % 3;
      const row = Math.floor(i / 3);
      const tx = x + col * tileSize;
      const ty = y + row * tileSize;

      if (tile.shape === "empty") {
        continue;
      }

      if (tile.shape === "square") {
        ctx.fillRect(tx, ty, tileSize, tileSize);
        continue;
      }

      const x0 = tx;
      const y0 = ty;
      const x1 = tx + tileSize;
      const y1 = ty + tileSize;

      ctx.beginPath();

      if (tile.orientation === 0) {
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y0);
        ctx.lineTo(x0, y1);
      } else if (tile.orientation === 1) {
        ctx.moveTo(x1, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x0, y0);
      } else if (tile.orientation === 2) {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x0, y1);
        ctx.lineTo(x1, y0);
      } else {
        ctx.moveTo(x0, y1);
        ctx.lineTo(x0, y0);
        ctx.lineTo(x1, y1);
      }

      ctx.closePath();
      ctx.fill();
    }
  }

  drawMiniWaveform({
    latestValue,
    x,
    y,
    width,
    height,
    color,
    opacity,
    lineWidth,
  }: {
    latestValue: number;
    x: number;
    y: number;
    width: number;
    height: number;
    color: [number, number, number];
    opacity: number;
    lineWidth: number;
  }) {
    const w = Math.max(1, Math.round(width));
    const h = Math.max(1, Math.round(height));
    if (w <= 1 || h <= 1) {
      this.miniWaveformSamples = [];
      return;
    }

    const sampleCount = Math.max(2, w);
    const clampedValue = Math.min(1, Math.max(0, latestValue));

    this.miniWaveformSamples.push(clampedValue);
    if (this.miniWaveformSamples.length > sampleCount) {
      this.miniWaveformSamples = this.miniWaveformSamples.slice(-sampleCount);
    }

    const ctx = this.context;
    ctx.strokeStyle = `rgba(${color.map((c) => Math.round(c * 255)).join(", ")}, ${opacity})`;
    ctx.lineWidth = lineWidth;

    const pointCount = this.miniWaveformSamples.length;
    if (pointCount < 2) {
      return;
    }

    ctx.beginPath();

    for (let i = 0; i < pointCount; i++) {
      const sample = this.miniWaveformSamples[i];
      const px = x + (i / (sampleCount - 1)) * w;
      const py = y + (1 - sample) * h;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.stroke();
  }

  drawText({
    text,
    x,
    y,
    fontSize,
    color,
    opacity,
    clearPadding,
  }: {
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: [number, number, number];
    opacity: number;
    clearPadding: number;
  }) {
    const ctx = this.context;
    ctx.fillStyle = `rgba(${color.map((c) => Math.round(c * 255)).join(", ")}, ${opacity})`;
    ctx.font = `${fontSize}px "Bytesized", monospace`;
    ctx.textBaseline = "top";
    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    const textH = fontSize;

    ctx.clearRect(
      x - clearPadding,
      y - clearPadding,
      textW + clearPadding * 2,
      textH + clearPadding * 2,
    );
    ctx.fillText(text, x, y);
  }
}
