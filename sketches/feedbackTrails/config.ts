export default {
  title: "Feedback Trails",
  description: "Trailing feedback",
  params: [
    {
      title: "intensity",
      key: "intensity",
      defaultValue: 1,
      sliderMin: 0,
      sliderMax: 5,
    },
    {
      title: "speed",
      key: "speed",
      defaultValue: 1,
      sliderMin: 0,
      sliderMax: 0.01,
    },
    {
      title: "rotAngle",
      key: "rotAngle",
      defaultValue: 0,
      sliderMin: -0.1,
      sliderMax: 0.1,
    },
    {
      title: "scale",
      key: "scale",
      defaultValue: 0,
      sliderMin: -0.1,
      sliderMax: 0.1,
    },
    {
      title: "mixAmp",
      key: "mixAmp",
      defaultValue: 0.5,
      sliderMin: 0,
      sliderMax: 1,
    },
    {
      title: "direction",
      key: "direction",
      defaultValue: [0, 0],
      valueType: "vector2",
    },
  ],
};
