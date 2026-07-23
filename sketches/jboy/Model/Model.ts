import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";

import getCleanClips from "./getCleanClips";
import { getActions, setWeight } from "./getActions";
import getMorphs from "./getMorphs";

const loader = new GLTFLoader();

export class Model {
  group: any;
  gltf?: any;
  mixer?: any;
  clips?: any[];
  actions?: any[];
  morphs?: any[];
  isLoaded: boolean = false;

  constructor(
    modelUrlOrGltf: string | any,
    actions: any[] = [],
    morphs: string[] = [],
    callback?: (model: Model) => void
  ) {
    this.group = new THREE.Object3D();
    if (typeof modelUrlOrGltf === "string") {
      loader.load(
        modelUrlOrGltf,
        (gltf: any) => {
          this.processModel(gltf, actions, morphs);

          this.isLoaded = true;

          if (callback) callback(this);
        },
        undefined,
        (error: any) => console.error(error)
      );
    } else {
      this.processModel(modelUrlOrGltf, actions, morphs);
      this.isLoaded = true;
      if (callback) callback(this);
    }
  }

  processModel(gltf: any, actions: any[], morphs: string[]) {
    this.gltf = gltf;
    const object = gltf.scene || gltf.scenes[0];

    this.group.add(object);

    this.mixer = new THREE.AnimationMixer(object);

    this.clips = getCleanClips(gltf);
    this.actions = getActions(gltf.animations, this.mixer);
    this.morphs = getMorphs(object, morphs);
  }

  update(p: Record<string, number>, t: number, f: number) {
    if (this.isLoaded) {
      this.actions?.forEach((action) => {
        const name = action._clip.name;
        if (p[name] !== undefined) setWeight(action, p[name]);
      });

      this.morphs?.forEach((morph) => {
        if (p[morph.key] !== undefined) morph.update(p[morph.key]);
      });

      if (this.mixer) this.mixer.update(f / 60);
    }
  }
}
