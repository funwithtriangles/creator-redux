import { convertParamsToUniforms } from "../../uniformUtils";

export const uniformsParamsConfig = [
  {
    groupTitle: "Marble",
    params: [
      {
        key: "marbleScale",
        defaultValue: 3,
        sliderMin: 0.001,
        sliderMax: 5,
      },
      {
        key: "colorA",
        defaultValue: [1, 0, 0],
        valueType: "rgb",
      },
      {
        key: "colorB",
        defaultValue: [0, 0, 1],
        valueType: "rgb",
      },
      {
        key: "mixMin",
        defaultValue: 0.2,
        valueType: "number",
      },
      {
        key: "mixMax",
        defaultValue: 0.8,
        valueType: "number",
      },
      {
        key: "iridescence",
        defaultValue: 2,
        sliderMin: 0,
        sliderMax: 50,
      },
      {
        key: "iridescenceIOR",
        defaultValue: 0,
        sliderMin: 0,
        sliderMax: 2.333,
      },
      {
        key: "marbleSpeed",
        defaultValue: 1,
        sliderMin: 0,
        sliderMax: 5,
      },
    ],
  },
  {
    groupTitle: "Stripes",
    params: [
      {
        key: "stripeFreq",
        defaultValue: 100,
        sliderMin: 10,
        sliderMax: 200,
      },
      {
        key: "stripeSpeed",
        defaultValue: 10,
        sliderMin: 0,
        sliderMax: 50,
      },
      {
        key: "stripeDirX",
        defaultValue: 0,
        sliderMin: -1,
        sliderMax: 1,
      },
      {
        key: "stripeDirY",
        defaultValue: 1,
        sliderMin: -1,
        sliderMax: 1,
      },
      {
        key: "stripeDirZ",
        defaultValue: 0,
        sliderMin: -1,
        sliderMax: 1,
      },
      {
        key: "stripeWarpFreq",
        defaultValue: 1,
        sliderMin: 0,
        sliderMax: 10,
      },
      {
        key: "stripeWarpBase",
        defaultValue: 0,
        sliderMin: -5,
        sliderMax: 5,
      },
      {
        key: "warpNoiseFreq",
        defaultValue: 2,
        sliderMin: 0,
        sliderMax: 10,
      },
      {
        key: "warpNoiseSpeed",
        defaultValue: 0.1,
        sliderMin: 0,
        sliderMax: 1,
      },
      {
        key: "warpNoiseAmp",
        defaultValue: 0.5,
        sliderMin: 0,
        sliderMax: 2,
      },
      {
        key: "offsetNoiseFreq",
        defaultValue: 2,
        sliderMin: 0,
        sliderMax: 10,
      },
      {
        key: "offsetNoiseAmp",
        defaultValue: 1,
        sliderMin: 0,
        sliderMax: 5,
      },
      {
        key: "phaseROffset",
        defaultValue: 0,
        sliderMin: 0,
        sliderMax: 1,
      },
      {
        key: "phaseGOffset",
        defaultValue: 0,
        sliderMin: 0,
        sliderMax: 1,
      },
      {
        key: "phaseBOffset",
        defaultValue: 0,
        sliderMin: 0,
        sliderMax: 1,
      },
      {
        key: "phaseRNoiseMult",
        defaultValue: 0.1,
        sliderMin: 0,
        sliderMax: 1,
      },
      {
        key: "phaseGNoiseMult",
        defaultValue: 0.2,
        sliderMin: 0,
        sliderMax: 1,
      },
      {
        key: "phaseBNoiseMult",
        defaultValue: 0.4,
        sliderMin: 0,
        sliderMax: 1,
      },
      {
        key: "shineIntensity",
        defaultValue: 0.5,
        sliderMin: 0,
        sliderMax: 2,
      },
      {
        key: "shinePower",
        defaultValue: 2,
        sliderMin: 0.1,
        sliderMax: 10,
      },
      {
        key: "frostedEdgeIntensity",
        defaultValue: 0,
        sliderMin: 0,
        sliderMax: 2,
      },
      {
        key: "frostedEdgeThickness",
        defaultValue: 0.3,
        sliderMin: 0.01,
        sliderMax: 0.5,
      },
    ],
  },
] as const;

export default {
  title: "Creator",
  description: "The big guy",
  params: [...uniformsParamsConfig],
  shots: [],
};

export const sketchUniforms = convertParamsToUniforms([
  ...uniformsParamsConfig,
]);
