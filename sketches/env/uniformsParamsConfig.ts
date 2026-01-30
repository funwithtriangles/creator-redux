import { Color } from "three";
import { color, uniform } from "three/tsl";
import { convertParamsToUniforms } from "./uniformsUtils";

export const uniformsParamsConfig = [
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
    key: "colorA",
    defaultValue: [1, 0, 0],
    valueType: "rgb",
  },
  {
    key: "colorB",
    defaultValue: [1, 0, 0],
    valueType: "rgb",
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
] as const; // Important: use 'as const' to preserve literal types

export const sketchUniforms = convertParamsToUniforms(uniformsParamsConfig);
