/**
 * A lo-fi starfield effect using WebGPU instanced points
 * @author cale-bradbury
 */

import { Group, Vector3, InstancedBufferAttribute, Sprite } from "three";
import { PointsNodeMaterial } from "three/webgpu";
import {
  instancedBufferAttribute,
  shapeCircle,
  uniform,
  float,
  abs,
  smoothstep,
} from "three/tsl";

interface ParticleVert {
  position: Vector3;
  velocity: Vector3;
  colorIndex: number; // 0 or 1
  colorBlendValue: number; // blend value for color
}

const MAX_PARTICLES = 10000;

export default class Stars {
  range = new Vector3(10000, 10000, 10000);
  particleCount = 1800;
  root = new Group();
  vertices: ParticleVert[] = [];

  sprite: Sprite & { count: number };
  positionsAttribute: InstancedBufferAttribute;
  colorsAttribute: InstancedBufferAttribute;
  sizesAttribute: InstancedBufferAttribute;
  positionsArray: Float32Array;
  colorsArray: Float32Array;
  sizesArray: Float32Array;
  pauseUpdates: boolean = false;

  sizeUniform = uniform(16);
  opacityUniform = uniform(1);
  hiddenRangeStartUniform = uniform(0);
  hiddenRangeEndUniform = uniform(0);
  material: PointsNodeMaterial;

  constructor() {
    this.setupInstances();
  }

  randomInRange(range: number) {
    return Math.random() * range - range / 2;
  }

  vector3InRange(range: Vector3) {
    return new Vector3(
      this.randomInRange(range.x),
      this.randomInRange(range.y),
      this.randomInRange(range.z),
    );
  }

  setupInstances() {
    // Initialize arrays
    this.positionsArray = new Float32Array(MAX_PARTICLES * 3);
    this.colorsArray = new Float32Array(MAX_PARTICLES * 3);
    this.sizesArray = new Float32Array(MAX_PARTICLES).fill(1);

    // Create instanced buffer attributes
    this.positionsAttribute = new InstancedBufferAttribute(
      this.positionsArray,
      3,
    );
    this.colorsAttribute = new InstancedBufferAttribute(this.colorsArray, 3);
    this.sizesAttribute = new InstancedBufferAttribute(this.sizesArray, 1);

    // Create material with TSL nodes
    const positionNode = instancedBufferAttribute(this.positionsAttribute);
    const xPos = positionNode.x;
    const hiddenFactor = smoothstep(
      this.hiddenRangeStartUniform,
      this.hiddenRangeEndUniform,
      abs(xPos),
    );

    this.material = new PointsNodeMaterial({
      transparent: true,
      depthWrite: false,
      sizeAttenuation: true,
      colorNode: instancedBufferAttribute(this.colorsAttribute),
      positionNode: positionNode,
      sizeNode: instancedBufferAttribute(this.sizesAttribute).mul(
        this.sizeUniform,
      ),
      opacityNode: shapeCircle().mul(this.opacityUniform).mul(hiddenFactor),
    });

    // Create sprite with count
    this.sprite = new Sprite(this.material) as Sprite & { count: number };
    this.sprite.count = this.particleCount;
    this.sprite.frustumCulled = false;

    this.root.add(this.sprite);

    this.setParticleCount(this.particleCount);
  }

  setParticleCount(count: number) {
    this.particleCount = Math.max(0, Math.min(MAX_PARTICLES, count));
    this.sprite.count = this.particleCount;

    this.vertices = [];
    for (let i = 0; i < this.particleCount; i++) {
      const colorIndex = Math.random() < 0.5 ? 0 : 1;
      const colorBlendValue = Math.random();
      const position = this.vector3InRange(this.range);
      const velocity = this.vector3InRange(new Vector3(1, 1, 1));

      this.vertices.push({
        position,
        velocity,
        colorIndex,
        colorBlendValue,
      });

      // Set initial position in array
      const idx = i * 3;
      this.positionsArray[idx] = position.x;
      this.positionsArray[idx + 1] = position.y;
      this.positionsArray[idx + 2] = position.z;

      // Set initial color
      this.colorsArray[idx] = 1;
      this.colorsArray[idx + 1] = 1;
      this.colorsArray[idx + 2] = 1;

      // Set initial size
      this.sizesArray[i] = 1;
    }

    this.positionsAttribute.needsUpdate = true;
    this.colorsAttribute.needsUpdate = true;
    this.sizesAttribute.needsUpdate = true;
  }

  update({ deltaTime, params: p }: { deltaTime: number; params: any }) {
    if (this.pauseUpdates) {
      if (p.opacity > 0) {
        this.pauseUpdates = false;
      } else {
        return;
      }
    }

    // Handle dynamic particle count
    if (
      p.particleCount !== undefined &&
      p.particleCount !== this.particleCount
    ) {
      this.setParticleCount(p.particleCount);
    }

    this.range.x = p.range[0] * 10000;
    this.range.y = p.range[1] * 10000;
    this.range.z = p.range[2] * 10000;
    this.opacityUniform.value = p.opacity;
    this.hiddenRangeStartUniform.value = p.hiddenRangeStart ?? 0;
    this.hiddenRangeEndUniform.value = p.hiddenRangeEnd ?? 0;
    this.sprite.position.z = p.depth ?? 0;
    this.sizeUniform.value = p.pointSize;

    // Update color buffer attribute based on params
    const colorA = p.color;
    const colorB = p.color2;
    const blend = p.colorBlend;

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;

      // Update colors
      let t = this.vertices[i].colorIndex;
      if (blend !== 0) {
        t = Math.abs(t - this.vertices[i].colorBlendValue * blend * 0.5);
      }
      this.colorsArray[idx] = colorA[0] * (1 - t) + colorB[0] * t;
      this.colorsArray[idx + 1] = colorA[1] * (1 - t) + colorB[1] * t;
      this.colorsArray[idx + 2] = colorA[2] * (1 - t) + colorB[2] * t;

      // Update positions
      this.positionsArray[idx + 2] += p.speed * deltaTime;
      const velocity = this.vertices[i].velocity;
      this.positionsArray[idx] += velocity.x * p.velocity * deltaTime;
      this.positionsArray[idx + 1] += velocity.y * p.velocity * deltaTime;
      this.positionsArray[idx + 2] += velocity.z * p.velocity * deltaTime;

      // random walk for x/y/z
      this.positionsArray[idx] += this.randomInRange(p.randomWalk) * deltaTime;
      this.positionsArray[idx + 1] +=
        this.randomInRange(p.randomWalk) * deltaTime;
      this.positionsArray[idx + 2] +=
        this.randomInRange(p.randomWalk) * deltaTime;

      // Only check z axis for bounds
      const z = this.positionsArray[idx + 2];
      const zRange = this.range.z;
      if (p.speed > 0 && z > zRange / 2) {
        this.positionsArray[idx] = this.randomInRange(this.range.x);
        this.positionsArray[idx + 1] = this.randomInRange(this.range.y);
        this.positionsArray[idx + 2] =
          -zRange / 2 - this.randomInRange(this.range.z * 0.5);
      } else if (p.speed < 0 && z < -zRange / 2) {
        this.positionsArray[idx] = this.randomInRange(this.range.x);
        this.positionsArray[idx + 1] = this.randomInRange(this.range.y);
        this.positionsArray[idx + 2] =
          zRange / 2 + this.randomInRange(this.range.z * 0.5);
      }
    }

    this.positionsAttribute.needsUpdate = true;
    this.colorsAttribute.needsUpdate = true;

    if (p.opacity === 0) {
      this.pauseUpdates = true;
    }
  }

  // A basic demo of a dynamic config, note the random description
  // getConfig is called any time a sketch is loaded (initial load, or code change)
  getConfig() {
    return {
      title: "Stars",
      description: `A simple star field - don't forget that ${
        this.sayings[Math.floor(Math.random() * this.sayings.length)]
      }`,
      category: "simple",
      params: [
        {
          title: "Speed",
          key: "speed",
          defaultValue: 10000,
          sliderMin: -10000,
          sliderMax: 10000,
        },
        {
          title: "Velocity",
          key: "velocity",
          defaultValue: 0,
          sliderMin: 0,
          sliderMax: 10000,
        },
        {
          title: "Random Walk",
          key: "randomWalk",
          defaultValue: 0,
          sliderMin: 0,
          sliderMax: 10000,
        },
        {
          title: "Range",
          key: "range",
          defaultValue: [1, 1, 1],
          valueType: "vector3",
        },
        {
          title: "Particle Count",
          key: "particleCount",
          defaultValue: 1800,
          sliderMin: 0,
          sliderMax: 10000,
        },
        {
          title: "Depth",
          key: "depth",
          defaultValue: 0,
          sliderMin: -10000,
          sliderMax: 0,
        },
        {
          title: "Color",
          key: "color",
          defaultValue: [1, 1, 1],
          valueType: "rgb",
        },
        {
          title: "Color 2",
          key: "color2",
          defaultValue: [1, 1, 1],
          valueType: "rgb",
        },
        {
          title: "Color Blend",
          key: "colorBlend",
          defaultValue: 0,
          sliderMin: 0,
          sliderMax: 1,
        },
        {
          title: "Opacity",
          key: "opacity",
          defaultValue: 1,
        },
        {
          title: "Point Size",
          key: "pointSize",
          defaultValue: 16,
          sliderMin: 1,
          sliderMax: 1000,
        },
        {
          title: "Hidden Range Start",
          key: "hiddenRangeStart",
          defaultValue: 0,
          sliderMin: 0,
          sliderMax: 10000,
        },
        {
          title: "Hidden Range End",
          key: "hiddenRangeEnd",
          defaultValue: 0,
          sliderMin: 0,
          sliderMax: 10000,
        },
      ],
      shots: [],
    };
  }

  // generated by copilot after the first string was strung <3
  sayings = [
    "you are a star",
    "you are amazing",
    "you are loved",
    "you are awesome",
    "you are special",
    "you are unique",
    "you are important",
    "you are appreciated",
    "you are valued",
    "you are cherished",
    "you are respected",
    "you are admired",
    "you are celebrated",
    "you are a gift",
    "you are a treasure",
    "you are a blessing",
    "you are a miracle",
    "you are a wonder",
    "you are a masterpiece",
    "you are a work of art",
  ];
}
