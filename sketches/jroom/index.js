import * as THREE from "three";
import { Tween } from "@tweenjs/tween.js";
import tileColorUrl from "./tile-color.png";
import tileRoughnessUrl from "./tile-roughness.png";
import tileNormalUrl from "./tile-normal.png";

const size = 30;
const geom = new THREE.BoxGeometry(size, size, size);
const mat0 = new THREE.MeshLambertMaterial({
  color: 0xff31ff,
  side: THREE.BackSide,
});
const mat1 = new THREE.MeshLambertMaterial({
  color: 0x1af9b0,
  side: THREE.BackSide,
});
const mat2 = new THREE.MeshLambertMaterial({
  color: 0xffffff,
  side: THREE.BackSide,
});
const mat3 = new THREE.MeshLambertMaterial({
  color: 0x000000,
  side: THREE.BackSide,
});

const colors = [
  new THREE.Color(0xff0000),
  new THREE.Color(0xffffff),
  new THREE.Color(0x00ff00),
];

const texLoader = new THREE.TextureLoader();

const texSizes = [1, 0.8, 0.2, 0.6, 0.135, 0.4, 0.135, 0.4];

export default class JRoom {
  constructor(sketchApi) {
    const colorMap = texLoader.load(tileColorUrl);
    const roughnessMap = texLoader.load(tileRoughnessUrl);
    const normalMap = texLoader.load(tileNormalUrl);

    this.currTexSizeIndex = 0;
    this.currMatIndex = 0;

    this.mats = [
      new THREE.MeshStandardMaterial({
        side: THREE.BackSide,
        map: colorMap,
        roughnessMap,
        normalMap,
        // color: 0xeeeeee,
        metalness: 0,
        roughness: 1.3,
        // roughness: 1,
        // metalness: 1,
        transparent: true,
      }),
      mat2,
    ];

    this.mat = this.mats[0];

    sketchApi.renderer.shadowMap.enabled = true;
    sketchApi.renderer.shadowMap.type = THREE.BasicShadowMap;

    this.root = new THREE.Group();

    const shadSize = 10;

    this.directionalLight1 = new THREE.DirectionalLight(0xffffff, 0);
    this.directionalLight1.castShadow = true;
    this.directionalLight1.position.set(60, 50, 20);

    this.directionalLight1.shadow.camera.near = -60;
    this.directionalLight1.shadow.camera.far = 100;
    this.directionalLight1.shadow.camera.right = shadSize;
    this.directionalLight1.shadow.camera.left = -shadSize;
    this.directionalLight1.shadow.camera.top = shadSize;
    this.directionalLight1.shadow.camera.bottom = -shadSize;
    this.directionalLight1.shadow.mapSize.width = 2048;
    this.directionalLight1.shadow.mapSize.height = 2048;

    this.root.add(this.directionalLight1);

    this.directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    this.directionalLight2.position.set(-60, -50, -20);

    this.root.add(this.directionalLight2);

    this.whitePLight = new THREE.PointLight(0xffffff, 0, 70);
    this.whitePLight.castShadow = true;
    this.whitePLight.shadow.mapSize.width = 2048;
    this.whitePLight.shadow.mapSize.height = 2048;
    this.whitePLight.distance = 99999999;
    this.whitePLight.position.set(0, 2, 0);
    this.root.add(this.whitePLight);

    this.pLight = new THREE.PointLight(0x00ff00, 0, 70);
    this.pLight.castShadow = true;
    this.pLight.shadow.mapSize.width = 2048;
    this.pLight.shadow.mapSize.height = 2048;
    this.pLight.distance = 99999999;

    this.root.add(this.pLight);

    this.mesh = new THREE.Mesh(geom, this.mat);
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = true;
    this.mesh.position.y = size / 2;
    this.mesh.rotation.x = -Math.PI / 2;
    this.root.add(this.mesh);

    this.pLightPosIndex = 0;

    this.props = {
      pLightInt: 0,
    };
    this.pLightTweens = [];

    const targetObj = {};
    targetObj.intensity = 0;

    this.pLightTween = new Tween(this.pLight).to({ intensity: 0 }, 500);
  }

  pLightFlash() {
    this.pLight.color = colors[Math.floor(Math.random() * 3)];
    this.pLight.position.y = Math.random() * 10;
    this.pLight.position.z = Math.random() * 10 - 5;
    this.pLight.intensity = 10;
    this.pLightTween.stop();
    this.pLightTween.start();
  }

  pLightFlashWhite() {
    this.pLight.color = colors[1];
    this.pLight.position.y = Math.random() * 10;
    this.pLight.position.z = Math.random() * 10 - 5;
    this.pLight.intensity = 10;
    this.pLightTween.start();
  }

  update({ params: p, deltaFrame: f }) {
    this.pLightTween.update();
    this.directionalLight1.intensity = p.dirLightInt;
    this.directionalLight2.intensity = p.dirLightInt;
    this.whitePLight.intensity = p.whitePLightInt;

    this.mat.opacity = p.opacity;

    if (this.pLightPosIndex !== parseInt(p.pLightPos)) {
      this.pLightPosIndex = parseInt(p.pLightPos);
      this.pLightFlash();
    }

    if (this.currTexSizeIndex !== parseInt(p.texSizes)) {
      this.currTexSizeIndex = parseInt(p.texSizes);
      const texSize = texSizes[this.currTexSizeIndex];
      this.mat.map.repeat.set(texSize, texSize);
      this.mat.roughnessMap.repeat.set(texSize, texSize);
      this.mat.normalMap.repeat.set(texSize, texSize);
    }
  }
}
