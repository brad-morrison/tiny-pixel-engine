// src/Component.js

export class Component {
  constructor() {
    // The GameObject this component is attached to.
    // Filled in by GameObject.addComponent().
    this.entity = null;
  }

  // Called once when the component is first added.
  start() {}

  // Called every frame from the GameObject.
  update(dt, scene) {}

  // Called every frame when drawing from the GameObject.
  draw(ctx, scale, scene) {}
}