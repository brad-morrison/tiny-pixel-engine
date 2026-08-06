# tiny-pixel-engine

A small 2D game engine for pixel-art games in the browser. It draws to a canvas at a fixed virtual resolution (160×144 by default, the Game Boy screen), scales that up by whole numbers so pixels stay square and crisp, and gives you scenes, game objects, components, sprite animation and pointer input on top.

There's no build step and no runtime dependencies. The engine is plain ES modules, so you can import `src/index.js` directly from a `<script type="module">` and start writing a game.

Version 0.0.1. This is a personal project and the API still moves around between commits.

## Getting started

```bash
git clone https://github.com/brad-morrison/tiny-pixel-engine.git
cd tiny-pixel-engine
npm install
npm run dev
```

That starts a static file server at the repository root. Open `/examples/demo/index.html` for the virtual pet demo, or `/examples/3d-gameboy-experiment/index.html` for the Game Boy one. Serving from the root matters for the first demo, which loads its assets from absolute paths.

You need a real server rather than opening the HTML from disk, because module imports and image loading both fail under `file://`.

## A minimal game

```html
<canvas id="game" style="width: 320px; height: 288px;"></canvas>
<script type="module" src="./main.js"></script>
```

```js
import {
  Engine,
  Scene,
  GameObject,
  SpriteSheet,
  SpriteAnimation,
  SpriteRenderer,
  assetLoader,
} from "./src/index.js";

const canvas = document.getElementById("game");

const image = await assetLoader.loadImage("./assets/pet_idle.png");
const sheet = new SpriteSheet({ image, frameWidth: 16, frameHeight: 16 });

const idle = new SpriteAnimation({
  spriteSheet: sheet,
  frames: [0, 1, 2, 3],
  frameDuration: 140,
});

const pet = new GameObject({ x: 72, y: 64, originX: 8, originY: 8 });
pet.addComponent(new SpriteRenderer({ animation: idle }));

const scene = new Scene();
scene.addObject(pet);

const engine = new Engine({
  canvas,
  width: 160,
  height: 144,
  background: "#346856",
});

engine.addScene("main", scene);
engine.setScene("main");
engine.start();
```

Give the canvas a CSS size and leave its `width`/`height` attributes alone. The engine measures the CSS box every frame, picks the largest whole-number scale that fits, and sets the pixel buffer itself. Add `image-rendering: pixelated` in your stylesheet so the browser doesn't blur the result during layout.

## How it fits together

### Engine

The engine owns the canvas, the render loop and the scene registry. `start()` kicks off `requestAnimationFrame`, and every frame it recomputes the scale, updates the current scene, then clears and redraws. Delta time is passed around in milliseconds.

It also tracks a single pointer for you at `engine.pointer`, holding position in canvas pixels plus `isDown`, `justDown`, `justUp` and the press timings. The `just*` flags are cleared at the end of each update, so read them during a scene or component update.

```js
const engine = new Engine({ canvas, width: 160, height: 144, background: "#000" });
engine.addScene("title", titleScene);
engine.addScene("level1", levelScene);
engine.setScene("title");   // fires onExit on the old scene, onEnter on the new one
engine.start();
```

### Scene

A scene holds two lists. World objects go through `addObject()` and are drawn under the camera transform, sorted by their `z` value each frame. UI objects go through `addUIObject()` and are drawn afterwards at the same zoom but without the camera translation, which keeps HUD elements pinned to the screen.

The built-in camera is a plain object on the scene with `x`, `y` and `zoom`. Point it at something with `setCameraTarget(obj)` and it centres on that object's position every update. `screenToWorld(x, y)` converts pointer coordinates back into world units.

Scenes can override `onEnter`, `onExit`, `update` and `draw`. If you override `draw`, call `super.draw(ctx, scale)` first so your objects still render.

### GameObjects and components

A `GameObject` is a position (`x`, `y`, `z`), an origin offset, an `active` flag and a list of components. Behaviour lives in the components.

```js
class Bobbing extends Component {
  constructor(amplitude = 2) {
    super();
    this.amplitude = amplitude;
    this.t = 0;
  }

  update(dt) {
    this.t += dt;
    this.entity.y = this.baseY + Math.sin(this.t / 300) * this.amplitude;
  }
}
```

Extend `Component` and implement any of `start()`, `update(dt, scene)` and `draw(ctx, scale, scene)`. `addComponent()` sets `component.entity` and calls `start()` immediately. Retrieve components by class with `getComponent(Type)` or `getComponents(Type)`.

Origins are worth understanding: `x` and `y` are the object's logical position, and renderers draw at `x - originX`, `y - originY`. Setting the origin to the middle of a 16×16 sprite means the object's position refers to its centre, which makes camera following and hit testing behave sensibly.

Three components ship with the engine:

**SpriteRenderer** draws a `Sprite` or an animation, flipping horizontally when the object's `facing` is `-1`. It accepts either a `SpriteAnimation` or an `AnimationController` since both expose the same update and draw signature.

**TextLabel** renders monospace text scaled to the virtual resolution. Attach it to a UI object for a HUD, or to a world object for a floating label.

**PointerArea** gives an object an axis-aligned hitbox in world units and a set of callbacks: `onHoverEnter`, `onHoverLeave`, `onHover`, `onDown`, `onUp`, `onClick`, `onHoldStart` and `onHoldEnd`. Each callback receives `{ scene, entity, worldX, worldY, pointer }`. A click only registers if the pointer stayed within `clickMaxMovePx` and released inside `clickMaxDurationMs`, and holds fire after `holdThresholdMs`. When areas overlap, the one with the highest `z` wins, with a tie broken by whichever object is further down the screen.

```js
const fridge = new GameObject({ x: 60, y: 45, z: 1 });
fridge.addComponent(new PointerArea({
  width: 16,
  height: 24,
  onClick: () => needs.eat(1),
  onHoverEnter: () => console.log("mmm"),
}));
```

### Sprites and animation

`SpriteSheet` slices an image into a grid by frame size and works out the row and column count. `SpriteAnimation` plays a list of frame indices from a sheet at a fixed duration per frame, looping or holding on the last frame. `AnimationController` keeps a named map of animations and swaps between them, resetting the new one when the state changes.

```js
const anim = new AnimationController({
  animations: { idle, walk, sleep },
  initialState: "idle",
});

anim.setState("walk");   // no-op if already walking
```

`Sprite` covers the simpler case of a single static image or one fixed region of a larger one.

### Assets, input and events

`assetLoader` is a shared `AssetLoader` instance that caches image promises by source path, so requesting the same file twice returns the same load. `loadImages([...])` resolves to an array in the order you asked for.

`Keyboard` tracks held keys by `KeyboardEvent.key`. Construct one, call `isDown("e")`, and call `destroy()` when you're done to unbind the listeners.

`EventBus` is a small pub/sub with `on`, `off`, `emit` and `clear`. `globalEventBus` is a ready-made instance for cases where wiring references through constructors gets tedious.

## Exports

Everything comes from `src/index.js`:

| Export | What it does |
| --- | --- |
| `Engine` | Canvas setup, scaling, render loop, pointer state, scene switching |
| `Scene` | World and UI object lists, camera, z-sorting, pointer dispatch |
| `GameObject` | Positioned container for components |
| `Component` | Base class for behaviour |
| `SpriteRenderer`, `TextLabel`, `PointerArea` | Built-in components |
| `Sprite` | A single image or sub-region |
| `SpriteSheet` | Grid slicing over an image |
| `SpriteAnimation` | Frame playback with looping |
| `AnimationController` | Named animation states |
| `Entity` | Older standalone sprite object with velocity, kept for the pre-component demos |
| `Camera` | Standalone follow camera with lerp and world clamping |
| `Keyboard` | Held-key tracking |
| `AssetLoader`, `assetLoader` | Image loading and caching |
| `EventBus`, `globalEventBus` | Pub/sub messaging |

## Examples

**`examples/demo`** is a virtual pet. The pet wanders within bounds, walks to wherever you click on the ground, and runs a small state machine across idle, walking, eating, sleeping and listening to music. A needs system drains hunger, energy and happiness on timers and refills them while the pet sleeps or listens. The HUD draws three block meters from sprite assets. Press `E` to eat, `M` to toggle music, `Q` to toggle sleep.

**`examples/3d-gameboy-experiment`** renders the same game onto the screen of a 3D Game Boy model. The engine draws to an offscreen 160×144 canvas, three.js wraps that canvas in a `CanvasTexture` with nearest-neighbour filtering and maps it to the screen mesh in the GLB, and pointer events are raycast onto the mesh and converted from UV coordinates back into game pixels. Orbit controls let you turn the model. This example carries its own copy of `src/` and pulls three.js from a CDN via an import map.

## Project layout

```
src/
  Engine.js               loop, scaling, pointer, scenes
  Scene.js                object lists, camera, pointer dispatch
  GameObject.js           entity container
  Component.js            behaviour base class
  components/
    SpriteRenderer.js
    TextLabel.js
    PointerArea.js
  Sprite.js
  SpriteSheet.js
  SpriteAnimation.js
  AnimationController.js
  Camera.js
  Entity.js
  Keyboard.js
  AssetLoader.js
  EventBus.js
  index.js                public exports

examples/
  demo/                   virtual pet
  3d-gameboy-experiment/  same game on a 3D model
```

## Rough edges

Worth knowing before you build anything serious on this:

- There's no collision detection or physics. Movement is whatever your components do to `x` and `y`.
- `PointerArea` hit testing only runs over world objects. UI objects draw but don't receive pointer events yet.
- `Camera.js` is a standalone helper with lerping and world-bound clamping. The `Scene` class doesn't use it and has its own simpler camera object instead.
- `Entity` predates the component system. New code should use `GameObject` with a `SpriteRenderer`.
- There's no audio support.
- The package isn't published anywhere. Vendor `src/` into your project or point an import at it.

## License

Released into the public domain under CC0 1.0 Universal. See `LICENSE` for the full text.
