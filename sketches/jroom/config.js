module.exports = {
  defaultTitle: "J-Room",
  params: [
    {
      key: "opacity",
      defaultValue: 1,
    },
    {
      key: "dirLightInt",
      defaultValue: 1,
    },
    {
      key: "whitePLightInt",
      defaultValue: 0,
    },
    {
      key: "pLightPos",
      valueType: "enum",
      defaultValue: "0",
      options: [
        {
          label: "0",
          value: "0",
        },
        {
          label: "1",
          value: "1",
        },
        {
          label: "2",
          value: "2",
        },
      ],
    },
    {
      key: "texSizes",
      valueType: "enum",
      defaultValue: "0",
      options: [
        {
          label: "0",
          value: "0",
        },
        {
          label: "1",
          value: "1",
        },
        {
          label: "2",
          value: "2",
        },
        {
          label: "3",
          value: "3",
        },
        {
          label: "4",
          value: "4",
        },
        {
          label: "5",
          value: "5",
        },
        {
          label: "6",
          value: "6",
        },
        {
          label: "7",
          value: "7",
        },
      ],
    },
  ],
  shots: [
    {
      key: "pLightFlash",
    },
  ],
};
