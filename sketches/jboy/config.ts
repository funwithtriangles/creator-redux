export const jboyMatUniformsConfig = [
  {
    title: "Wobble Amp",
    key: "wobbleAmp",
    defaultValue: 0.0,
  },
  {
    title: "Wobble Freq",
    key: "wobbleFreq",
    defaultValue: 0.0,
  },
  {
    title: "Wobble Speed",
    key: "wobbleSpeed",
    defaultValue: 0.0,
  },
];

export default {
  defaultTitle: "J-Boy",
  params: [
    {
      key: "posX",
      defaultValue: 0,
      sliderMin: -1,
      sliderMax: 1,
    },
    {
      key: "posY",
      defaultValue: 0,
      sliderMin: -1,
      sliderMax: 1,
    },
    {
      key: "posZ",
      defaultValue: 0,
      sliderMin: -1,
      sliderMax: 1,
    },
    {
      key: "rotY",
      defaultValue: 0,
      sliderMax: Math.PI * 2,
    },
    {
      key: "danceMove",
      title: "Dance Move",
      valueType: "enum",
      defaultValue: "bboy",
      options: [
        {
          value: "bboy",
          label: "B-Boy",
        },
        {
          value: "two-step",
          label: "Two Step",
        },
        {
          value: "big-step",
          label: "Big Step",
        },
        {
          value: "hiphop",
          label: "Hip Hop",
        },
        {
          value: "combo",
          label: "Combo",
        },
      ],
    },
    {
      key: "animSpeed",
      defaultValue: 1,
      sliderMin: 0,
      sliderMax: 1,
    },
    {
      key: "isVisible",
      title: "Visible",
      valueType: "boolean",
      defaultValue: true,
    },
    ...jboyMatUniformsConfig,
    {
      key: "opacity",
      defaultValue: 1.0,
    },
    {
      key: "color",
      defaultValue: [1, 0, 0],
      valueType: "rgb",
    },
  ],
};
