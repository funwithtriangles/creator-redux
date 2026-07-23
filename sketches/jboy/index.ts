import * as THREE from "three";
import jboyGlb from "./jboy.glb";

import { Model } from "./Model/Model.ts";
import { MeshStandardNodeMaterial } from "three/webgpu";
import {
  Fn,
  mx_noise_float,
  normalLocal,
  positionLocal,
  uniform,
  vec4,
} from "three/tsl";
import {
  convertParamsToUniforms,
  updateUniforms,
} from "../slug/uniformsUtils.ts";
import { jboyMatUniformsConfig } from "./config.ts";

interface JboyConstructorParams {
  sketchesDir: string;
  camera: any;
}

interface UpdateParams {
  params: Record<string, number>;
  elapsedFrames: number;
  deltaFrame: number;
}

export default class Jboy {
  root: THREE.Group;
  camera: any;
  frameBase: number;
  model: Model;
  isLoaded: boolean = false;
  material = new MeshStandardNodeMaterial();
  displaceTime = uniform(0);
  uniforms = convertParamsToUniforms(jboyMatUniformsConfig);

  constructor({ camera }: JboyConstructorParams) {
    this.root = new THREE.Group();

    this.camera = camera;

    this.frameBase = 0;

    this.model = new Model(jboyGlb, [], [], (model) => {
      model.group.scale.set(0.5, 0.5, 0.5);
      const mesh = model.group.getObjectByName("Mesh");

      mesh.material = this.material;
      mesh.castShadow = true;
      mesh.frustumCulled = false;
      mesh.material.roughness = 0.5;
      mesh.material.metalness = 0;
      this.root.add(model.group);
      this.isLoaded = true;
    });

    this.material.positionNode = Fn(() => {
      const wobble = mx_noise_float(
        vec4(positionLocal.mul(this.uniforms.wobbleFreq).add(this.displaceTime))
      ).mul(this.uniforms.wobbleAmp);
      const position = positionLocal.add(normalLocal.mul(wobble));

      return position;
    })();

    this.material.transparent = true;
  }

  randomFrame() {
    const mixer = this.model.mixer;
    mixer.setTime(mixer.time + 3000);
  }

  update({
    params: p,
    elapsedFrames: t,
    deltaFrame: f,
    deltaTime,
  }: UpdateParams) {
    this.root.visible = p.isVisible;

    if (!p.isVisible) return;

    this.displaceTime.value += deltaTime * p.wobbleSpeed;
    // Create a new params object with dance move weights
    const danceParams = {
      bboy: 0,
      "two-step": 0,
      "big-step": 0,
      hiphop: 0,
      combo: 0,
    };

    // Set the selected dance move to weight 1
    if (p.danceMove && danceParams.hasOwnProperty(p.danceMove)) {
      danceParams[p.danceMove] = 1;
    }

    // Combine with original params
    const combinedParams = { ...p, ...danceParams };

    this.model.update(combinedParams, t, f * p.animSpeed);
    this.model.group.position.set(p.posX * 10, p.posY * 10, p.posZ * 10);
    this.model.group.rotation.y = p.rotY;

    this.material.opacity = p.opacity;
    this.material.color.set(...p.color);

    updateUniforms(jboyMatUniformsConfig, this.uniforms, p);
  }
}
