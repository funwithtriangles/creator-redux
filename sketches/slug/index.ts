import slugModelUrl from "./slug.glb";

import { GLTF, GLTFLoader, RGBELoader } from "three-stdlib";

const gltfLoader = new GLTFLoader();
const rgbeLoader = new RGBELoader();

import {
  step,
  color,
  mix,
  screenUV,
  Fn,
  uniform,
  roughness,
  pass,
  texture,
  pmremTexture,
  viewportSharedTexture,
  vec4,
  float,
} from "three/tsl";

import { noiseTexture } from "./textures/noiseTexture";
import {
  sketchUniforms,
  uniformsParamsConfig,
  uniformsParamsConfigBase,
} from "./uniformsParamsConfig";
import { updateUniforms, updateUniformsByChannel } from "./uniformsUtils";
import { slugWiggle } from "./textures/slugWiggle";
import {
  wireframeAlphaFloat,
  setupTriCenterAttributes,
  wireframeEmissiveColor,
} from "./textures/wireframe";
import {
  BackSide,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshNormalMaterial,
  MeshStandardNodeMaterial,
  Scene,
  TextureLoader,
} from "three/webgpu";
import { stripesTexture } from "./textures/stripesTexture";
import { ringsTexture } from "./textures/ringsTexture";

const textureLoader = new TextureLoader();
export default class Slug {
  root = new Group();
  maskScene = new Scene();

  material = new MeshStandardNodeMaterial({
    side: 2,
  });

  uniforms = {
    waveTime: uniform(0),
    finWaveTime: uniform(0),
    noiseTime: uniform(0),
    stripesTime: uniform(0),
    ringTime: uniform(0),
    roughness: uniform(0.2),
    metalness: uniform(0.2),
    ...sketchUniforms,
  };

  constructor({ renderer, camera, scene }) {
    this.material.positionNode = slugWiggle({
      waveTime: this.uniforms.waveTime,
      finWaveTime: this.uniforms.finWaveTime,
      waveAmp: this.uniforms.waveAmp,
      waveLength: this.uniforms.waveLength,
      finWaveAmp: this.uniforms.finWaveAmp,
      finWaveLength: this.uniforms.finWaveLength,
      sinAmp: this.uniforms.sinAmp,
      cosAmp: this.uniforms.cosAmp,
      crush: this.uniforms.crush,
    });

    this.material.transparent = true;
    // this.material.wireframe = true;

    // const split = viewportSharedTexture(screenUV).rgb.oneMinus();

    // const split = window._sceneMask;
    // const split = window._sceneMask.r;
    const split = float(1);

    const maskVal = window._xray_mask || float(0);

    this.material.opacityNode = Fn(() => {
      return mix(1, wireframeAlphaFloat(), this.uniforms.wireframeAlpha);
    })();

    this.material.metalnessNode = Fn(() => {
      return mix(0, this.uniforms.metalness, split);
    })();

    this.material.roughnessNode = Fn(() => {
      return mix(1, this.uniforms.roughness, split);
    })();

    let matCol = noiseTexture({
      bigNoiseAmp: this.uniforms.bigNoiseAmp,
      noiseTime: this.uniforms.noiseTime,
      smallNoiseAmp: this.uniforms.smallNoiseAmp,
    }).mul(this.uniforms.noiseIntensity);

    matCol = matCol.add(
      stripesTexture({
        waveAmp: this.uniforms.stripeWaveAmp,
        waveLength: this.uniforms.stripeWaveLength,
        stripeTime: this.uniforms.stripesTime,
        stripeLength: this.uniforms.stripeLength,
        stripeOffset: this.uniforms.stripeOffset,
      }).mul(this.uniforms.stripesIntensity),
    );

    matCol = matCol.add(
      ringsTexture({
        ringTime: this.uniforms.ringTime,
      }).mul(this.uniforms.ringsIntensity),
    ).r;

    matCol = vec4(
      mix(
        vec4(this.uniforms.colorA, this.uniforms.colorAOpacity),
        vec4(this.uniforms.colorB, this.uniforms.colorBOpacity),
        matCol,
      ),
    );

    this.material.emissiveNode = Fn(() => {
      const wireCol = wireframeEmissiveColor({
        wireframeBackColor: this.uniforms.wireframeBackColor,
        wireframeFrontColor: this.uniforms.wireframeFrontColor,
      });

      return matCol.mul(this.uniforms.colorEmissiveIntensity);

      // return emmissiveCol.add(mix(wireCol, color(0, 0, 0), maskVal.oneMinus()));
    })();

    this.material.colorNode = Fn(() => {
      return matCol;
    })();

    this.material.castShadowNode = Fn(() => {
      return vec4(0, 0, 0, 0.3);
    })();

    // Load the slug model with Draco compression
    gltfLoader.load(slugModelUrl, (gltf) => {
      const model = gltf.scene.children[0] as Mesh;
      const { map } = model.material as MeshStandardNodeMaterial;
      this.material.map = map;
      model.material = this.material;

      let geometry = model.geometry;
      geometry = setupTriCenterAttributes(geometry);
      model.geometry = geometry;
      model.castShadow = true;
      this.root.add(model);
    });
  }

  update({ params: p, deltaFrame: d, deltaTime: dt }) {
    this.root.visible = p.isVisible;

    if (!p.isVisible) return;

    // updateUniforms(uniformsParamsConfig, this.uniforms, p);
    updateUniformsByChannel(uniformsParamsConfigBase, this.uniforms, p);

    this.uniforms.waveTime.value += d * p.waveSpeed;
    this.uniforms.finWaveTime.value += d * p.finWaveSpeed;
    this.uniforms.noiseTime.value += d * p.noiseSpeed;
    this.uniforms.stripesTime.value += d * p.stripeSpeed;
    this.uniforms.ringTime.value += d * p.ringSpeed;

    this.uniforms.metalness.value = p.metalness;
    this.uniforms.roughness.value = p.roughness;

    this.root.position.z = p.slidePos;
  }

  dispose({ scene }) {}
}
