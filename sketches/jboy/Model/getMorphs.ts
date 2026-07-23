// Inefficient but tidy
class Morph {
  meshes: any[];
  index: number;
  key: string;

  constructor(index: number, key: string, meshes: any[]) {
    this.meshes = meshes;
    this.index = index;
    this.key = key;
  }

  update(value: number) {
    this.meshes.forEach((mesh) => {
      mesh.morphTargetInfluences[this.index] = value;
    });
  }
}

const getMorphs = (object: any, morphKeys: string[]) => {
  const morphMeshes: any[] = [];
  const morphs: Morph[] = [];

  object.traverse((node: any) => {
    if (node.isMesh && node.morphTargetInfluences) {
      morphMeshes.push(node);
    }
  });

  if (morphMeshes.length > 0) {
    const numMorphs = morphMeshes[0].morphTargetInfluences.length;

    for (let i = 0; i < numMorphs; i++) {
      morphs.push(new Morph(i, morphKeys[i], morphMeshes));
    }
  }

  return morphs;
};

export default getMorphs;
