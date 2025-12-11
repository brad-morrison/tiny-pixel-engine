// src/Scene.js
export class Scene {
  constructor() {
    // The Engine will set this when setScene(...) is called
    this.engine = null;

    // All GameObjects in this scene
    this.objects = [];

    // Very simple camera: position + optional target object
    this.camera = {
      x: 0,
      y: 0,
      target: null, // GameObject to follow
    };
  }

  // Called by Engine when this scene becomes active
  onEnter(engine) {
    this.engine = engine;
  }

  // Called by Engine when this scene is no longer active
  onExit(engine) {
    this.engine = null;
  }

  addObject(obj) {
    this.objects.push(obj);
    return obj;
  }

  removeObject(obj) {
    const idx = this.objects.indexOf(obj);
    if (idx !== -1) {
      this.objects.splice(idx, 1);
    }
  }

  setCameraTarget(obj) {
    this.camera.target = obj;
  }

  update(dt) {
    // --- Camera follow logic ---
    if (this.camera.target && this.engine) {
      const target = this.camera.target;
      const vw = this.engine.width;
      const vh = this.engine.height;

      let camX = target.x - vw / 2;
      let camY = target.y - vh / 2;

      // (Optional) later we can clamp to world bounds if we add them.

      this.camera.x = camX;
      this.camera.y = camY;
    }

    // --- Update all GameObjects ---
    for (const obj of this.objects) {
      if (obj.update) {
        obj.update(dt, this);
      }
    }
  }

  draw(ctx, scale) {
    ctx.save();

    // Apply camera transform
    ctx.translate(-this.camera.x * scale, -this.camera.y * scale);

    // Draw all GameObjects
    for (const obj of this.objects) {
      if (obj.draw) {
        obj.draw(ctx, scale, this);
      }
    }

    ctx.restore();
  }
}