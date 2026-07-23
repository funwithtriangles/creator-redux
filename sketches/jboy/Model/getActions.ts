import * as THREE from "three";

export const setWeight = (action: any, weight: number) => {
  action.enabled = true;
  action.setEffectiveTimeScale(1);
  action.setEffectiveWeight(weight);
};

export const getActions = (clips: any[], mixer: any) => {
  return clips.map((clip) => {
    const action = mixer.clipAction(clip);
    action.play();
    setWeight(action, 0);

    return action;
  });
};
