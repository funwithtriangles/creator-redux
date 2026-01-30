import { convertParamsToUniforms } from "../../uniformUtils";

export const uniformsParamsConfig = [
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
