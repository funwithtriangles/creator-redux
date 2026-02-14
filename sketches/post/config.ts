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
    key: "shoutout_message2",
    title: "Message 3",
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
    key: "shoutout_positionX2",
    title: "Position X 3",
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
    key: "shoutout_positionY2",
    title: "Position Y 3",
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
    key: "shoutout_scale2",
    title: "Scale 3",
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

export const noiseParamsConfig = [
  {
    key: "noise_intensity",
    title: "Intensity",
    defaultValue: 0.1,
    sliderMin: 0,
    sliderMax: 1,
  },
  {
    key: "noise_speed",
    title: "Speed",
    defaultValue: 10,
    sliderMin: 0,
    sliderMax: 100,
  },
];

export const scanlinesParamsConfig = [
  {
    key: "scanlines_intensity",
    title: "Intensity",
    defaultValue: 0.15,
    sliderMin: 0,
    sliderMax: 1,
  },
  {
    key: "scanlines_density",
    title: "Density",
    defaultValue: 900,
    sliderMin: 100,
    sliderMax: 3000,
  },
  {
    key: "scanlines_speed",
    title: "Speed",
    defaultValue: 2,
    sliderMin: 0,
    sliderMax: 20,
  },
  {
    key: "scanlines_flicker",
    title: "Flicker",
    defaultValue: 0.05,
    sliderMin: 0,
    sliderMax: 0.5,
  },
  {
    key: "scanlines_vignette",
    title: "Vignette",
    defaultValue: 0.35,
    sliderMin: 0,
    sliderMax: 2,
  },
];

export const chromaticAberrationParamsConfig = [
  {
    key: "chromaticAberration_intensity",
    title: "Shift",
    defaultValue: 2,
    sliderMin: 0,
    sliderMax: 24,
  },
  {
    key: "chromaticAberration_edgeStart",
    title: "Edge Start",
    defaultValue: 0.35,
    sliderMin: 0,
    sliderMax: 1,
  },
  {
    key: "chromaticAberration_falloff",
    title: "Falloff",
    defaultValue: 2,
    sliderMin: 0.1,
    sliderMax: 6,
  },
  {
    key: "chromaticAberration_redOffset",
    title: "Red Split",
    defaultValue: 1,
    sliderMin: 0,
    sliderMax: 3,
  },
  {
    key: "chromaticAberration_blueOffset",
    title: "Blue Split",
    defaultValue: 1,
    sliderMin: 0,
    sliderMax: 3,
  },
];

export const borderParamsConfig = [
  {
    key: "border_color",
    title: "Color",
    valueType: "rgb",
    defaultValue: [1, 1, 1],
  },
  {
    key: "border_titleText",
    title: "Title Text",
    valueType: "string",
    defaultValue: "Hello, world!",
  },
  {
    key: "border_titleTextX",
    title: "Title Text X",
    defaultValue: 0.05,
    sliderMin: 0,
    sliderMax: 1,
  },
  {
    key: "border_titleTextY",
    title: "Title Text Y",
    defaultValue: 0.05,
    sliderMin: 0,
    sliderMax: 1,
  },
  {
    key: "border_opacity",
    title: "Opacity",
    defaultValue: 1,
    sliderMin: 0,
    sliderMax: 1,
  },
  {
    key: "border_padding",
    title: "Padding",
    defaultValue: 0.05,
    sliderMin: 0,
    sliderMax: 0.2,
  },
  {
    key: "border_width",
    title: "Width",
    defaultValue: 2,
    sliderMin: 1,
    sliderMax: 10,
  },
  {
    key: "border_topOffset",
    title: "Top Offset",
    defaultValue: 0,
    sliderMin: -1,
    sliderMax: 1,
  },
  {
    key: "border_rightOffset",
    title: "Right Offset",
    defaultValue: 0,
    sliderMin: -1,
    sliderMax: 1,
  },
  {
    key: "border_bottomOffset",
    title: "Bottom Offset",
    defaultValue: 0,
    sliderMin: -1,
    sliderMax: 1,
  },
  {
    key: "border_leftOffset",
    title: "Left Offset",
    defaultValue: 0,
    sliderMin: -1,
    sliderMax: 1,
  },
  {
    key: "border_bevelTopLeft",
    title: "Bevel Top Left",
    defaultValue: 0.03,
    sliderMin: 0,
    sliderMax: 0.2,
  },
  {
    key: "border_bevelTopRight",
    title: "Bevel Top Right",
    defaultValue: 0.03,
    sliderMin: 0,
    sliderMax: 0.2,
  },
  {
    key: "border_bevelBottomRight",
    title: "Bevel Bottom Right",
    defaultValue: 0.03,
    sliderMin: 0,
    sliderMax: 0.2,
  },
  {
    key: "border_bevelBottomLeft",
    title: "Bevel Bottom Left",
    defaultValue: 0.03,
    sliderMin: 0,
    sliderMax: 0.2,
  },
];

export const glyphParamsConfig = [
  {
    key: "border_glyphScale",
    title: "Glyph Scale",
    defaultValue: 1,
    sliderMin: 0.25,
    sliderMax: 3,
  },
  {
    key: "border_glyphPosX",
    title: "Glyph X",
    defaultValue: 0.82,
    sliderMin: 0,
    sliderMax: 1,
  },
  {
    key: "border_glyphPosY",
    title: "Glyph Y",
    defaultValue: 0.08,
    sliderMin: 0,
    sliderMax: 1,
  },
  {
    key: "border_glyphTrailCount",
    title: "Glyph Trail Count",
    defaultValue: 4,
    sliderMin: 0,
    sliderMax: 16,
  },
  {
    key: "border_glyphGutter",
    title: "Glyph Gutter",
    defaultValue: 0,
    sliderMin: 0,
    sliderMax: 3,
  },
  {
    key: "border_glyphSquareProbability",
    title: "Glyph Square Prob",
    defaultValue: 0.375,
    sliderMin: 0,
    sliderMax: 1,
  },
  {
    key: "border_glyphTriangleProbability",
    title: "Glyph Triangle Prob",
    defaultValue: 0.375,
    sliderMin: 0,
    sliderMax: 1,
  },
  {
    key: "border_glyphEmptyProbability",
    title: "Glyph Empty Prob",
    defaultValue: 0.25,
    sliderMin: 0,
    sliderMax: 1,
  },
];

export const miniSceneParamsConfig = [
  {
    key: "miniScene_opacity",
    title: "Opacity",
    defaultValue: 1,
    sliderMin: 0,
    sliderMax: 1,
  },
  {
    key: "miniScene_scale",
    title: "Scale",
    defaultValue: 0.25,
    sliderMin: 0.05,
    sliderMax: 1,
  },
  {
    key: "miniScene_posX",
    title: "Offset X",
    defaultValue: 0.02,
    sliderMin: 0,
    sliderMax: 0.5,
  },
  {
    key: "miniScene_posY",
    title: "Offset Y",
    defaultValue: 0.02,
    sliderMin: 0,
    sliderMax: 0.5,
  },
  {
    key: "miniScene_spinSpeed",
    title: "Spin Speed",
    defaultValue: 1,
    sliderMin: 0,
    sliderMax: 5,
  },
  {
    key: "miniScene_wireframeThickness",
    title: "Wireframe Thickness",
    defaultValue: 1.5,
    sliderMin: 0,
    sliderMax: 3,
  },
  {
    key: "miniScene_pixelation",
    title: "Pixelation",
    defaultValue: 512,
    sliderMin: 4,
    sliderMax: 512,
  },
  {
    key: "miniScene_wipe",
    title: "Wipe",
    defaultValue: 1,
    sliderMin: 0,
    sliderMax: 1,
  },
  {
    key: "hud_color",
    title: "HUD Color",
    valueType: "rgb",
    defaultValue: [1, 1, 1],
  },
  {
    key: "border_partTextX",
    title: "Part Text X",
    defaultValue: 0.05,
    sliderMin: 0,
    sliderMax: 1,
  },
  {
    key: "border_partTextY",
    title: "Part Text Y",
    defaultValue: 0.12,
    sliderMin: 0,
    sliderMax: 1,
  },
];

export const trackerParamsConfig = [
  {
    key: "border_trackerLines",
    title: "Tracker Lines",
    defaultValue: 12,
    sliderMin: 0,
    sliderMax: 64,
  },
  {
    key: "border_trackerTextX",
    title: "Tracker Text X",
    defaultValue: 0.05,
    sliderMin: 0,
    sliderMax: 1,
  },
  {
    key: "border_trackerTextY",
    title: "Tracker Text Y",
    defaultValue: 0.16,
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
    {
      groupTitle: "Noise",
      params: noiseParamsConfig,
    },
    {
      groupTitle: "Scanlines",
      params: scanlinesParamsConfig,
    },
    {
      groupTitle: "Chromatic Aberration",
      params: chromaticAberrationParamsConfig,
    },
    {
      groupTitle: "Border",
      params: borderParamsConfig,
    },
    {
      groupTitle: "Mini Scene",
      params: miniSceneParamsConfig,
    },
    {
      groupTitle: "Tracker",
      params: trackerParamsConfig,
    },
    {
      groupTitle: "Glyph",
      params: glyphParamsConfig,
    },
  ],
  shots: [
    {
      title: "Next Part",
      key: "nextPart",
    },
    {
      title: "Random Part",
      key: "randomPart",
    },
    {
      title: "New Tracker Line",
      key: "newTrackerLine",
    },
    {
      title: "New Alien Glyph",
      key: "newAlienGlyph",
    },
  ],
};
