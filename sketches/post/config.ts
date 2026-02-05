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

export const waterParamsConfig = [
  {
    title: "intensity",
    key: "water_intensity",
    defaultValue: 1,
    sliderMin: 0,
    sliderMax: 5,
  },
  {
    title: "speed",
    key: "water_speed",
    defaultValue: 1,
    sliderMin: 0,
    sliderMax: 0.01,
  },
];

export const shoutoutParamsConfig = [
  {
    key: "shoutout_message",
    title: "Message",
    valueType: "string",
    defaultValue: "Hello, world!",
  },
  {
    key: "shoutout_message1",
    title: "Message 2",
    valueType: "string",
    defaultValue: "Hello, world!",
  },
  {
    key: "shoutout_scrollSpeed",
    title: "Scroll Speed",
    defaultValue: 2,
    sliderMin: 0,
    sliderMax: 10,
  },
  {
    key: "shoutout_color",
    title: "Color",
    valueType: "rgb",
    defaultValue: [1, 1, 1],
  },
  {
    key: "shoutout_positionX",
    title: "Position X",
    defaultValue: 0,
    sliderMin: -1,
    sliderMax: 1,
  },
  {
    key: "shoutout_positionX1",
    title: "Position X 2",
    defaultValue: 0,
    sliderMin: -1,
    sliderMax: 1,
  },
  {
    key: "shoutout_positionY",
    title: "Position Y",
    defaultValue: 0,
    sliderMin: -0.5,
    sliderMax: 0.5,
  },
  {
    key: "shoutout_positionY1",
    title: "Position Y 2",
    defaultValue: 0,
    sliderMin: -0.5,
    sliderMax: 0.5,
  },
  {
    key: "shoutout_scale",
    title: "Scale",
    defaultValue: 1,
    sliderMin: 0.1,
    sliderMax: 3,
  },
  {
    key: "shoutout_scale1",
    title: "Scale 2",
    defaultValue: 1,
    sliderMin: 0.1,
    sliderMax: 3,
  },
  {
    key: "shoutout_rotation",
    title: "Rotation",
    defaultValue: 0,
    sliderMin: -Math.PI,
    sliderMax: Math.PI,
  },

  {
    key: "shoutout_opacity",
    title: "Opacity",
    defaultValue: 1,
    sliderMin: 0,
    sliderMax: 1,
  },
  {
    key: "shoutout_waterIntensity",
    title: "Water Intensity",
    defaultValue: 1,
    sliderMin: 0,
    sliderMax: 1,
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

export const logoParamsConfig = [
  {
    key: "logo_opacity",
    title: "Opacity",
    defaultValue: 1,
  },
  {
    key: "logo_scale",
    title: "Scale",
    defaultValue: 1,
    sliderMin: 0.1,
    sliderMax: 3,
  },
];

export const bloomParamsConfig = [
  {
    key: "bloom_strength",
    title: "Strength",
    defaultValue: 1,
    sliderMin: 0,
    sliderMax: 5,
  },
  {
    key: "bloom_radius",
    title: "Radius",
    defaultValue: 1,
    sliderMin: 0,
    sliderMax: 5,
  },
  {
    key: "bloom_threshold",
    title: "Threshold",
    defaultValue: 1,
    sliderMin: 0,
    sliderMax: 1,
  },
];

export default {
  title: "Post",
  description: "Post-processing effects",
  params: [
    {
      groupTitle: "Water",
      params: waterParamsConfig,
    },
    {
      groupTitle: "HSL",
      params: HSLParamsConfig,
    },
    {
      groupTitle: "Shoutout",
      params: shoutoutParamsConfig,
    },
    {
      groupTitle: "Gradient Map",
      params: gradientMapParamsConfig,
    },
    {
      groupTitle: "Logo",
      params: logoParamsConfig,
    },
    {
      groupTitle: "Bloom",
      params: bloomParamsConfig,
    },
  ],
};
