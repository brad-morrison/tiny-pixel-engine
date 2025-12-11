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

      let camX = target.x - vw / 2;
      let camY = target.y - vh / 2;

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
    // World: with camera
    ctx.save();
    ctx.translate(-this.camera.x * scale, -this.camera.y * scale);

    for (const obj of this.objects) {
      if (obj.draw) obj.draw(ctx, scale, this);
    }

    ctx.restore();

    // UI: no camera transform
    for (const obj of this.uiObjects) {
      if (obj.draw) obj.draw(ctx, scale, this);
    }
  }
}