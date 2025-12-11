// src/GameObject.js

export class GameObject {
  constructor({
    name = "GameObject",
    x = 0,
    y = 0,
    originX = 0,
    originY = 0,
  } = {}) {
    this.name = name;
    this.x = x;
    this.y = y;

    // NEW: origin in sprite pixels (virtual units)
    this.originX = originX;
    this.originY = originY;

    this.active = true;
    this.components = [];
  }

  addComponent(component) {
    component.entity = this; // tell the component who it belongs to

    if (typeof component.start === "function") {
      component.start();
    }

    this.components.push(component);
    return component;
  }

  getComponent(ComponentType) {
    return this.components.find((c) => c instanceof ComponentType) || null;
  }

  removeComponent(component) {
    const idx = this.components.indexOf(component);
    if (idx !== -1) {
      this.components.splice(idx, 1);
    }
  }

  update(dt, scene) {
    if (!this.active) return;

    for (const c of this.components) {
      if (typeof c.update === "function") {
        c.update(dt, scene);
      }
    }
  }

  draw(ctx, scale, scene) {
    if (!this.active) return;

    for (const c of this.components) {
      if (typeof c.draw === "function") {
        c.draw(ctx, scale, scene);
      }
    }
  }
}