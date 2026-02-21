export const HSLParamsConfig = [
  {
    title: "Hue",
    key: "hsl_hue",
    defaultValue: 0.0,
    sliderMin: -Math.PI,
    sliderMax: Math.PI,
  },
  {
    title: "Saturation",
    key: "hsl_saturation",
    defaultValue: 1.0,
    sliderMin: 0,
    sliderMax: 5,
  },
  {
    title: "Luminance",
    key: "hsl_luminance",
    defaultValue: 1.0,
    sliderMin: 0,
    sliderMax: 5,
  },
];

export const gradientMapParamsConfig = [
  {
    key: "gradientMap_intensity",
    title: "Intensity",
    defaultValue: 1,
    sliderMin: 0,
    sliderMax: 1,
  },
  {
    key: "gradientMap_color0",
    title: "Color 0",
    valueType: "rgb",
    defaultValue: [1, 0, 0],
  },
  {
    key: "gradientMap_pos0",
    title: "Pos 0",
    defaultValue: 0,
  },
  {
    key: "gradientMap_color1",
    title: "Color 1",
    valueType: "rgb",
    defaultValue: [0, 1, 0],
  },
  {
    key: "gradientMap_pos1",
    title: "Pos 1",
    defaultValue: 0.5,
  },
  {
    key: "gradientMap_color2",
    title: "Color 2",
    valueType: "rgb",
    defaultValue: [0, 0, 1],
  },
  {
    key: "gradientMap_pos2",
    title: "Pos 2",
    defaultValue: 1,
  },
];

export default {
  title: "Color",
  description: "Color adjustment",
  params: [
    {
      groupTitle: "HSL",
      params: HSLParamsConfig,
    },
    {
      groupTitle: "Gradient Map",
      params: gradientMapParamsConfig,
    },
  ],
};
