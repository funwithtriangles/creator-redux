import { Color } from "three";
import { color, uniform } from "three/tsl";
import { convertParamsToUniforms } from "./uniformsUtils";

export const numSlugs = 1;

export const uniformsParamsConfigBase = [
  {
    key: "waveAmp",
    defaultValue: 1,
    valueType: "number",
  },
  {
    key: "waveLength",
    defaultValue: 0.1,
    valueType: "number",
    sliderMin: 0.001,
    sliderMax: 0.5,
  },
  {
    key: "finWaveAmp",
    defaultValue: 0.1,
    valueType: "number",
    sliderMin: 0.001,
    sliderMax: 0.5,
  },
  {
    key: "finWaveLength",
    defaultValue: 0.1,
    valueType: "number",
    sliderMin: 0.001,
    sliderMax: 0.5,
  },
  {
    key: "sinAmp",
    defaultValue: 0.1,
    valueType: "number",
    sliderMin: 0.001,
    sliderMax: 0.5,
  },
  {
    key: "cosAmp",
    defaultValue: 0.1,
    valueType: "number",
    sliderMin: 0.001,
    sliderMax: 0.5,
  },
  {
    key: "bigNoiseAmp",
    defaultValue: 1,
    sliderMin: 0,
    sliderMax: 10,
    valueType: "number",
  },
  {
    key: "smallNoiseAmp",
    defaultValue: 1,
    sliderMin: 0,
    sliderMax: 10,
    valueType: "number",
  },
  {
    key: "noiseIntensity",
    defaultValue: 1,
  },
  {
    key: "colorA",
    defaultValue: [1, 0, 0],
    valueType: "rgb",
  },
  {
    key: "colorAOpacity",
    defaultValue: 1,
    valueType: "number",
  },
  {
    key: "colorB",
    defaultValue: [1, 0, 0],
    valueType: "rgb",
  },
  {
    key: "colorBOpacity",
    defaultValue: 1,
    valueType: "number",
  },
  {
    key: "wireframeFrontColor",
    defaultValue: [1, 0, 0],
    valueType: "rgb",
  },
  {
    key: "wireframeBackColor",
    defaultValue: [1, 0, 0],
    valueType: "rgb",
  },

  {
    key: "crush",
    defaultValue: 1,
    sliderMin: 0.001,
    sliderMax: 10,
    valueType: "number",
  },
  {
    key: "wireframeAlpha",
    defaultValue: 0,
    valueType: "number",
  },
  {
    key: "stripeLength",
    defaultValue: 0,
    valueType: "number",
  },
  {
    key: "stripeOffset",
    defaultValue: 0,
    valueType: "number",
  },
  {
    key: "stripeWaveAmp",
    defaultValue: 0,
    valueType: "number",
  },
  {
    key: "stripeWaveLength",
    defaultValue: 0,
    valueType: "number",
  },
  {
    key: "stripesIntensity",
    defaultValue: 1,
  },
  {
    key: "ringsIntensity",
    defaultValue: 1,
  },
  {
    key: "colorEmissiveIntensity",
    defaultValue: 1,
  },
] as const; // Important: use 'as const' to preserve literal types

export const uniformsParamsConfig = [];

for (let i = 0; i < numSlugs; i++) {
  uniformsParamsConfig.push({
    groupTitle: `Slug ${i}`,
    params: uniformsParamsConfigBase.map((param) => ({
      ...param,
      key: `${param.key}_${i}`,
    })),
  });
}

export const sketchUniforms = convertParamsToUniforms([
  ...uniformsParamsConfigBase,
]);
