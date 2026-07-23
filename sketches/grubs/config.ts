import { convertParamsToUniforms } from "../slug/uniformsUtils";

export const uniformsParamsConfig = [
  {
    groupTitle: "Background",
    params: [
      {
        key: "bgScale",
        title: "Background Scale",
        defaultValue: 1,
        sliderMin: 0.1,
        sliderMax: 10,
      },
      {
        key: "bgFreq",
        title: "Background Frequency",
        defaultValue: 1,
        sliderMin: 0.1,
        sliderMax: 5,
      },
      {
        key: "bgAmp",
        title: "Background Amp",
        defaultValue: 1,
        sliderMin: 0.1,
        sliderMax: 5,
      },
      {
        key: "bgColor",
        title: "Background Color",
        defaultValue: [0, 0, 0],
        valueType: "rgb",
      },
      {
        key: "bgRotSpeed",
        title: "Background Rot Speed",
        defaultValue: 0,
      },
    ],
  },
];

export default {
  title: "Grubs",
  description: "Segmented squirming grub prototype",
  params: [
    {
      groupTitle: "Swarm",
      params: [
        {
          key: "grubSpacingX",
          title: "Grub Spacing X",
          defaultValue: 10,
          sliderMin: 0.5,
          sliderMax: 40,
        },
        {
          key: "groupScale",
          title: "Group Scale",
          defaultValue: 1,
          sliderMin: 0.1,
          sliderMax: 5,
        },
        {
          key: "rowStagger",
          title: "Row Stagger",
          defaultValue: 1,
          sliderMin: 0.1,
          sliderMax: 5,
        },
        {
          key: "rowStaggerFreq",
          title: "Row Stagger Frequency",
          defaultValue: 1,
          sliderMin: 0.1,
          sliderMax: 5,
        },
        {
          key: "cylinderRadius",
          title: "Cylinder Radius",
          defaultValue: 2,
          sliderMin: 0.2,
          sliderMax: 8,
        },
        {
          key: "cylinderRotSpeed",
          title: "Cylinder Rotation Speed",
          defaultValue: 1,
          sliderMin: 0.1,
          sliderMax: 5,
        },

        {
          key: "cylinderAngle",
          title: "Cylinder Angle",
          defaultValue: 0,
          sliderMin: 0,
          sliderMax: Math.PI * 2,
        },
      ],
    },
    {
      groupTitle: "Grub",
      params: [
        {
          key: "segSpacing",
          title: "Seg Spacing",
          defaultValue: 0.01,
          sliderMin: 0,
          sliderMax: 0.1,
        },
        {
          key: "segScale",
          title: "Seg Scale",
          defaultValue: 0.6,
          sliderMin: 0.1,
          sliderMax: 2,
        },
        {
          key: "speed",
          title: "Speed",
          defaultValue: 1,
          sliderMin: 0,
          sliderMax: 5,
        },

        {
          key: "tailTaper",
          title: "Tail Taper",
          defaultValue: 0.45,
          sliderMin: 0,
          sliderMax: 1,
        },
        {
          key: "headTaper",
          title: "Head Taper",
          defaultValue: 0,
          sliderMin: 0,
          sliderMax: 1,
        },
        {
          key: "pulseAmp",
          title: "Pulse Amp",
          defaultValue: 0.28,
          sliderMin: 0,
          sliderMax: 1,
        },
        {
          key: "pulseFreq",
          title: "Pulse Freq",
          defaultValue: 4,
          sliderMin: 0,
          sliderMax: 15,
        },
        {
          key: "squirmAmpY",
          title: "Squirm Amp Y",
          defaultValue: 0.5,
          sliderMin: 0,
          sliderMax: 2,
        },
        {
          key: "squirmAmpZ",
          title: "Squirm Amp Z",
          defaultValue: 0.5,
          sliderMin: 0,
          sliderMax: 2,
        },
        {
          key: "squirmFreq",
          title: "Squirm Freq",
          defaultValue: 3,
          sliderMin: 0,
          sliderMax: 12,
        },
        {
          key: "matcapFileName",
          valueType: "file",
          title: "Matcap Texture",
          defaultValue: null,
          accept: ["image/*"],
        },
      ],
    },
    ...uniformsParamsConfig,
  ],
};

export const sketchUniforms = convertParamsToUniforms([
  ...uniformsParamsConfig,
]);
