import { convertParamsToUniforms } from "../../uniformUtils";

export const stripesParamsConfig = [
  {
    groupTitle: "Stripes",
    params: [
      { key: "stripeBias", defaultValue: 0, sliderMin: -1, sliderMax: 1 },
      { key: "stripeFreq", defaultValue: 100, sliderMin: 10, sliderMax: 200 },
      { key: "stripeSpeed", defaultValue: 10, sliderMin: 0, sliderMax: 50 },
      { key: "stripeDirX", defaultValue: 0, sliderMin: -1, sliderMax: 1 },
      { key: "stripeDirY", defaultValue: 1, sliderMin: -1, sliderMax: 1 },
      { key: "stripeDirZ", defaultValue: 0, sliderMin: -1, sliderMax: 1 },
      { key: "stripeWarpFreq", defaultValue: 1, sliderMin: 0, sliderMax: 10 },
      { key: "stripeWarpPhase", defaultValue: 0, sliderMin: -5, sliderMax: 5 },
      { key: "stripeWarpAmp", defaultValue: 0.5, sliderMin: 0, sliderMax: 5 },
      { key: "warpNoiseFreq", defaultValue: 2, sliderMin: 0, sliderMax: 10 },
      { key: "warpNoiseSpeed", defaultValue: 0.1, sliderMin: 0, sliderMax: 1 },
      { key: "warpNoiseAmp", defaultValue: 0.5, sliderMin: 0, sliderMax: 2 },
      { key: "offsetNoiseFreq", defaultValue: 2, sliderMin: 0, sliderMax: 10 },
      { key: "offsetNoiseAmp", defaultValue: 1, sliderMin: 0, sliderMax: 5 },
      { key: "phaseROffset", defaultValue: 0, sliderMin: 0, sliderMax: 1 },
      { key: "phaseGOffset", defaultValue: 0, sliderMin: 0, sliderMax: 1 },
      { key: "phaseBOffset", defaultValue: 0, sliderMin: 0, sliderMax: 1 },
      { key: "phaseRNoiseMult", defaultValue: 0.1, sliderMin: 0, sliderMax: 1 },
      { key: "phaseGNoiseMult", defaultValue: 0.2, sliderMin: 0, sliderMax: 1 },
      { key: "phaseBNoiseMult", defaultValue: 0.4, sliderMin: 0, sliderMax: 1 },
      { key: "shineIntensity", defaultValue: 0.5, sliderMin: 0, sliderMax: 2 },
      { key: "shinePower", defaultValue: 2, sliderMin: 0.1, sliderMax: 10 },
      {
        key: "frostedEdgeIntensity",
        defaultValue: 0,
        sliderMin: 0,
        sliderMax: 2,
      },
      { key: "rimPower", defaultValue: 2, sliderMin: 0.1, sliderMax: 10 },
    ],
  },
];

export const stripesUniforms = convertParamsToUniforms(
  stripesParamsConfig as any,
);

export default {
  title: "Sphere",
  description: "Flying spheres with stripes material",
  params: [
    {
      key: "speed",
      title: "Speed",
      defaultValue: 0.1,
      sliderMin: 0,
      sliderMax: 1,
    },
    ...stripesParamsConfig,
  ],
};
