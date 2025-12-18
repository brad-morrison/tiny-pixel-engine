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

  screenToWorld(screenPxX, screenPxY) {
    if (!this.engine) return { x: screenPxX, y: screenPxY };

    const zoom = this.camera.zoom ?? 1;
    const worldScale = (this.engine.scale || 1) * zoom;

    return {
      x: screenPxX / worldScale + (this.camera.x || 0),
      y: screenPxY / worldScale + (this.camera.y || 0),
    };
  }

  handlePointer(pointer, dt) {
    const { x: worldX, y: worldY } = this.screenToWorld(pointer.x, pointer.y);

    const pickTopHit = () => {
      let best = null;

      for (const obj of this.objects) {
        if (!obj || obj.active === false) continue;
        const comps = obj.components || [];

        for (const c of comps) {
          if (!c || typeof c.hitTest !== "function") continue;
          if (!c.hitTest(worldX, worldY)) continue;

          const z = typeof obj.z === "number" ? obj.z : 0;
          const y = typeof obj.y === "number" ? obj.y : 0;

          if (!best || z > best.z || (z === best.z && y > best.y)) {
            best = { obj, area: c, z, y };
          }
        }
      }

      return best ? { obj: best.obj, area: best.area } : null;
    };

    const hovered = pickTopHit();
    const prevHovered = this._hovered || null;

    if (hovered?.area !== prevHovered?.area || hovered?.obj !== prevHovered?.obj) {
      prevHovered?.area?.onHoverLeave?.({ scene: this, entity: prevHovered.obj, worldX, worldY, pointer });
      hovered?.area?.onHoverEnter?.({ scene: this, entity: hovered.obj, worldX, worldY, pointer });
      this._hovered = hovered;
    }

    this._hovered?.area?.onHover?.({ scene: this, entity: this._hovered.obj, worldX, worldY, pointer });

    if (pointer.justDown) {
      this._pressed = hovered ? { obj: hovered.obj, area: hovered.area, holding: false } : null;
      this._pressed?.area?.onDown?.({ scene: this, entity: this._pressed.obj, worldX, worldY, pointer });
    }

    if (pointer.isDown && this._pressed && !this._pressed.holding) {
      const holdMs = this._pressed.area?.holdThresholdMs ?? 450;
      const downFor = performance.now() - (pointer.downTime || performance.now());

      if (downFor >= holdMs) {
        this._pressed.holding = true;
        this._pressed.area?.onHoldStart?.({ scene: this, entity: this._pressed.obj, worldX, worldY, pointer });
      }
    }

    if (pointer.justUp) {
      const pressed = this._pressed;

      pressed?.area?.onUp?.({ scene: this, entity: pressed.obj, worldX, worldY, pointer });

      if (pressed?.holding) {
        pressed?.area?.onHoldEnd?.({ scene: this, entity: pressed.obj, worldX, worldY, pointer });
      }

      if (pressed?.area?.onClick) {
        const upHit = hovered && hovered.obj === pressed.obj && hovered.area === pressed.area;

        const dx = (pointer.x || 0) - (pointer.downX || 0);
        const dy = (pointer.y || 0) - (pointer.downY || 0);
        const dist = Math.hypot(dx, dy);

        const duration = (pointer.upTime || performance.now()) - (pointer.downTime || performance.now());
        const maxMove = pressed.area?.clickMaxMovePx ?? 6;
        const maxDur = pressed.area?.clickMaxDurationMs ?? 300;

        if (upHit && dist <= maxMove && duration <= maxDur) {
          pressed.area.onClick({ scene: this, entity: pressed.obj, worldX, worldY, pointer });
        }
      }

      this._pressed = null;
    }
  }

  draw(ctx, scale) {
    const zoom = this.camera.zoom ?? 1;

    // World scale = GB scale * zoom factor
    const worldScale = scale * zoom;

    // --- World layer (affected by camera + zoom) ---
    ctx.save();

    // Camera translation in worldScale
    ctx.translate(-(this.camera.x || 0) * worldScale, -(this.camera.y || 0) * worldScale);

    this.objects.sort((a, b) => (a.z ?? 0) - (b.z ?? 0)); // Sort by z-depth
    for (const obj of this.objects) {
      if (obj.draw) {
        obj.draw(ctx, worldScale, this);  // 👈 pass worldScale here
      }
    }

    ctx.restore();

    // --- UI layer (zoomed like world, but no camera translation) ---
    for (const obj of this.uiObjects) {
      if (obj.draw) {
        obj.draw(ctx, worldScale, this);
      }
    }
  }
}