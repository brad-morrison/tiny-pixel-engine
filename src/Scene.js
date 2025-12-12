// src/Scene.js
export class Scene {
  constructor() {
    this.engine = null;

    // World-space objects
    this.objects = [];

    // Screen-space UI objects
    this.uiObjects = [];

    // Simple camera
    this.camera = {
      x: 0,
      y: 0,
      target: null,
      zoom: 1, // 1 = normal, 2 = zoomed in 2x, etc.
    };
  }

  onEnter(engine) {
    this.engine = engine;
  }

  onExit(engine) {
    this.engine = null;
  }

  addObject(obj) {
    this.objects.push(obj);
    return obj;
  }

  addUIObject(obj) {
    this.uiObjects.push(obj);
    return obj;
  }

  setCameraTarget(obj) {
    this.camera.target = obj;
  }

  update(dt) {
    // Camera follow
    if (this.camera.target && this.engine) {
      const target = this.camera.target;
      const vw = this.engine.width;
      const vh = this.engine.height;
      const zoom = this.camera.zoom ?? 1;

      const halfViewW = vw / (2 * zoom);
      const halfViewH = vh / (2 * zoom);

      // target.x/y are now the logical origin (center/feet/etc.)
      const camX = target.x - halfViewW;
      const camY = target.y - halfViewH;

      this.camera.x = camX;
      this.camera.y = camY;
    }

    // World objects
    for (const obj of this.objects) {
      if (obj.update) obj.update(dt, this);
    }

    // UI objects (if they need update)
    for (const obj of this.uiObjects) {
      if (obj.update) obj.update(dt, this);
    }
  }

  draw(ctx, scale) {
    const zoom = this.camera.zoom ?? 1;

    // World scale = GB scale * zoom factor
    const worldScale = scale * zoom;

    // --- World layer (affected by camera + zoom) ---
    ctx.save();

    // Camera translation in worldScale
    ctx.translate(-this.camera.x * worldScale, -this.camera.y * worldScale);

    for (const obj of this.objects) {
      if (obj.draw) {
        obj.draw(ctx, worldScale, this);  // 👈 pass worldScale here
      }
    }

    ctx.restore();

    // --- UI layer (no zoom, no camera) ---
      // --- UI layer (also zoomed, but no camera translation) ---
    for (const obj of this.uiObjects) {
      if (obj.draw) {
        obj.draw(ctx, worldScale, this); // 👈 use worldScale here
      }
    }
  }
}