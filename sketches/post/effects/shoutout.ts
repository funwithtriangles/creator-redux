import * as THREE from "three";

export class Shoutout {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  textX: number = 0;

  constructor() {
    // Create canvas for text texture
    this.canvas = document.createElement("canvas");

    this.canvas.width = 1920;
    this.canvas.height = 1080;
    this.context = this.canvas.getContext("2d")!;

    // Set up canvas styling
    this.context.font = '700 48px "Roboto Condensed Variable"';
    this.context.letterSpacing = "0.2em";
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";

    // Create texture from canvas
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.flipY = false;

    // Initialize text position to start from right edge
    this.textX = this.canvas.width;
  }

  update({
    params: p,
  }: {
    params: {
      message: string;
      message1: string;
      message2: string;
      color: [number, number, number];
      scrollSpeed: number;
      positionX: number;
      positionX1: number;
      positionX2: number;
      positionY: number;
      positionY1: number;
      positionY2: number;
      scale: number;
      scale1: number;
      scale2: number;
      rotation: number;
      opacity: number;
    };
  }) {
    this.context.fillStyle = `rgba(${p.color.map((c) => c * 255).join(", ")}, ${
      p.opacity
    })`;

    // Clear canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate base position from manual positioning
    const baseX = p.positionX * this.canvas.width;
    const baseY = p.positionY * this.canvas.height;
    const baseX1 = p.positionX1 * this.canvas.width;
    const baseY1 = p.positionY1 * this.canvas.height;
    const baseX2 = p.positionX2 * this.canvas.width;
    const baseY2 = p.positionY2 * this.canvas.height;

    // Save the current context state
    this.context.save();

    // Apply transformations: translate to screen center, rotate, then translate to position and scale
    this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.context.rotate(p.rotation);
    this.context.translate(
      baseX - this.canvas.width / 2,
      baseY - this.canvas.height / 2,
    );
    this.context.scale(p.scale, p.scale);

    // Draw the text with scrolling applied in the rotated coordinate space
    this.context.fillText(p.message, 0, 0);

    this.context.restore();

    // Save the current context state
    this.context.save();

    // Apply transformations: translate to screen center, rotate, then translate to position and scale
    this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.context.rotate(p.rotation);
    this.context.translate(
      baseX2 - this.canvas.width / 2,
      baseY2 - this.canvas.height / 2,
    );
    this.context.scale(p.scale2, p.scale2);

    // Draw the text with scrolling applied in the rotated coordinate space
    this.context.fillText(p.message2, 0, 0);

    this.context.restore();

    // Save the current context state
    this.context.save();

    // Apply transformations: translate to screen center, rotate, then translate to position and scale
    this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.context.rotate(p.rotation);
    this.context.translate(
      baseX1 - this.canvas.width / 2,
      baseY1 - this.canvas.height / 2,
    );
    this.context.scale(p.scale1, p.scale1);

    // Draw the text with scrolling applied in the rotated coordinate space
    this.context.fillText(p.message1, 0, 0);

    this.context.restore();

    // Update texture
    this.texture.needsUpdate = true;
  }
}
