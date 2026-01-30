import hdrTextureUrl from "./night-blur.hdr";

import { GLTF, GLTFLoader, RGBELoader } from "three-stdlib";

const rgbeLoader = new RGBELoader();

import { sketchUniforms, uniformsParamsConfig } from "./config";
import { updateUniforms } from "../../uniformUtils";

import {
  DirectionalLight,
  EquirectangularReflectionMapping,
  Fog,
  Group,
  LinearMipMapLinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshStandardNodeMaterial,
  NearestFilter,
  PlaneGeometry,
  Scene,
  TextureLoader,
} from "three/webgpu";
import {
  color,
  float,
  mix,
  pmremTexture,
  Fn,
  hue,
  saturation,
} from "three/tsl";

const textureLoader = new TextureLoader();
export default class Env {
  root = new Group();
  uniforms = {
    ...sketchUniforms,
  };

  constructor({ renderer, camera, scene }) {
    // // Add Directional Light
    const directionalLight = new DirectionalLight("#ffffff", 2);
    // directionalLight.castShadow = true;
    // directionalLight.shadow.mapSize.set(256, 256);
    // directionalLight.shadow.camera.left = -3;
    // directionalLight.shadow.camera.right = 3;
    // directionalLight.shadow.camera.top = 3;
    // directionalLight.shadow.camera.bottom = -3;
    // directionalLight.shadow.camera.far = 15;
    // directionalLight.shadow.camera.near = 0.1;
    // directionalLight.shadow.normalBias = 0.01;
    // directionalLight.shadow.bias = -0.1;

    // directionalLight.position.set(0, 5, 0);
    // this.root.add(directionalLight);

    this.scene = scene;

    const maskVal = window._xray_mask || float(1);

    rgbeLoader.load(hdrTextureUrl, (environmentMap) => {
      const bg = pmremTexture(environmentMap).mul(this.uniforms.color);
      const maskBg = pmremTexture(environmentMap).mul(
        hue(saturation(this.uniforms.color, 1), 1),
      );

      environmentMap.mapping = EquirectangularReflectionMapping;

      scene.environmentNode = mix(bg, maskBg, maskVal);

      scene.backgroundNode = scene.environmentNode
        .context({
          getTextureLevel: () => float(0.5),
        })
        .mul(this.uniforms.bgIntensity);

      // scene.environment = environmentMap;
    });
  }

  update({ params: p, deltaFrame: d, deltaTime: dt }) {
    updateUniforms(uniformsParamsConfig, this.uniforms, p);

    this.scene.environmentIntensity = p.intensity;
  }

  dispose({ scene }) {
    scene.background = null;
    scene.environment = null;
    scene.backgroundNode = null;
  }
}
