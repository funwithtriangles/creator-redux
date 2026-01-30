import { convertParamsToUniforms } from "../../uniformUtils";

export const uniformsParamsConfig = [
  {
    key: "color",
    defaultValue: [1, 0, 0],
    valueType: "rgb",
  },
  {
    key: "bgIntensity",
    defaultValue: 1.0,
  },
] as const;

export default {
  title: "Env",
  description: "Environment",
  params: [
    ...uniformsParamsConfig,
    {
      key: "intensity",
      defaultValue: 1.0,
    },
  ],
};

export const sketchUniforms = convertParamsToUniforms([
  ...uniformsParamsConfig,
]);
