---
name: hedron-sketches
description: Explanation of what Hedron is and what sketches are.
---

# Hedron

Hedron is an Electron app, writen in Typescript, for creating visual experiences with three.js. It allows the user to take sketches they have created and control them with various inputs (e.g. MIDI, audio, LFO). The final product may be a live show, performed in a night club, or an interactive web page.

## Sketches

Sketches are written by the user (in JS or TS), creating various 3D elements that will get pulled into the three.js scene by Hedron. Examples might be a spinning cube (with controls to change the color, scale, rotation speed) or post processing effects.

### Anatomy of a Sketch

Each sketch folder typically contains:

- `index.ts` - The main sketch class
- `config.ts` - Parameter definitions for Hedron's UI

#### The Sketch Class

A sketch is a class with the following structure:

```typescript
import { Group } from "three/webgpu";

export default class MySketch {
  // Root group that gets added to the scene
  root = new Group();

  constructor() {
    // Initialize 3D objects, materials, lights, etc.
    // Add them to this.root
  }

  update({ params, deltaFrame, deltaTime }) {
    // Called every frame
    // params: object containing current values from Hedron's UI
    // deltaFrame: time delta normalized to 60fps (1.0 = 60fps)
    // deltaTime: raw time delta in seconds
  }

  dispose({ scene }) {
    // Optional cleanup when sketch is removed
  }
}
```

#### The Config File

The config file defines parameters that appear in Hedron's UI:

```typescript
export default {
  defaultTitle: "My Sketch",
  params: [
    {
      key: "speed", // Unique identifier
      defaultValue: 1, // Initial value
      sliderMin: 0, // Optional min
      sliderMax: 10, // Optional max
    },
    {
      key: "color",
      defaultValue: [1, 0, 0], // RGB values 0-1
      valueType: "rgb",
    },
    {
      key: "enabled",
      valueType: "boolean",
      defaultValue: true,
    },
  ],
};
```

Parameters can be grouped. Note that keys between groups still need to remain unique, the grouping is purely aesthetic.

```typescript
export default {
  {
    groupTitle: "Appearance",
    params: [
      { key: "intensity", defaultValue: 1 },
      { key: "color", defaultValue: [1, 1, 1], valueType: "rgb" },
    ],
  },
}
```

#### Using Uniforms with TSL

Not specific to Hedron, but this project has some utilities for convertin params to uniforms. (Three.js Shading Language (TSL)).

In the config file:

```typescript
export const sketchUniforms = convertParamsToUniforms([...myUniformParams]);
```

In the index file:

```typescript
import { uniform } from "three/tsl";
import { sketchUniforms } from "./config";
import { updateUniforms } from "../../uniformUtils";

class MySketch {
  uniforms = {
    ...sketchUniforms,
    // And other non-param uniforms
  };

  update({ params }) {
    // Sync incoming params from Hedron UI to shader uniforms
    updateUniforms(myUniformParams, this.uniforms, params);
  }
}
```
