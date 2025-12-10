// src/Scene.js
export class Scene {
  constructor() {
    // Things that live in this scene (player, enemies, etc.)
    this.entities = [];

    // Staging areas so we can safely add/remove during update
    this._toAdd = [];
    this._toRemove = new Set();

    // Optional background fill override (e.g. "#1d1d1d")
    this.background = null;

    // Optional camera
    this.camera = null;

    // If you want draw-order control, set entity.z
    this._sortNeeded = false;
  }

  /**
   * Lifecycle hook when this scene becomes active
   * (called by Engine.setScene)
   */
  onEnter(engine) {
    this.engine = engine;
  }

  /**
   * Lifecycle hook when this scene is deactivated
   */
  onExit(engine) {
    this.engine = null;
  }

  addEntity(entity) {
    this._toAdd.push(entity);
    if (typeof entity.onAddToScene === "function") {
      entity.onAddToScene(this);
    }
    return entity;
  }

  removeEntity(entity) {
    this._toRemove.add(entity);
    if (typeof entity.onRemoveFromScene === "function") {
      entity.onRemoveFromScene(this);
    }
  }

  clearEntities() {
    this.entities.length = 0;
    this._toAdd.length = 0;
    this._toRemove.clear();
  }

  /**
   * Override this if you want scene-level logic before entities update, e.g.:
   * - spawn timers
   * - win/lose conditions
   */
  update(dt) {
    this.beforeUpdate(dt);

    // Apply queued adds/removes
    if (this._toAdd.length > 0) {
      this.entities.push(...this._toAdd);
      this._toAdd.length = 0;
      this._sortNeeded = true;
    }

    if (this._toRemove.size > 0) {
      this.entities = this.entities.filter(
        (e) => !this._toRemove.has(e)
      );
      this._toRemove.clear();
      this._sortNeeded = true;
    }

    // Sort by z if needed (simple layering)
    if (this._sortNeeded) {
      this.entities.sort((a, b) => {
        const az = typeof a.z === "number" ? a.z : 0;
        const bz = typeof b.z === "number" ? b.z : 0;
        return az - bz;
      });
      this._sortNeeded = false;
    }

    // Update camera first (if any)
    if (this.camera && typeof this.camera.update === "function") {
      this.camera.update(dt);
    }

    // Update entities
    for (const entity of this.entities) {
      if (typeof entity.update === "function") {
        entity.update(dt, this);
      }
    }

    this.afterUpdate(dt);
  }

  /**
   * Hooks around entity updates
   */
  beforeUpdate(dt) {}
  afterUpdate(dt) {}

  draw(ctx, scale) {
    // Optional scene background (overrides engine background)
    if (this.background) {
      ctx.save();
      ctx.fillStyle = this.background;
      ctx.fillRect(0, 0, this.engine.canvasWidth, this.engine.canvasHeight);
      ctx.restore();
    }

    ctx.save();

    // Apply camera transform if present
    if (this.camera) {
      ctx.translate(
        -this.camera.x * scale,
        -this.camera.y * scale
      );
    }

    for (const entity of this.entities) {
      if (typeof entity.draw === "function") {
        entity.draw(ctx, scale, this);
      }
    }

    ctx.restore();

    // Optionally draw HUD or overlays here
    this.drawOverlay(ctx, scale);
  }

  /**
   * Override to draw UI that shouldn't move with camera
   */
  drawOverlay(ctx, scale) {}
}