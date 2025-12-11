// src/components/SpriteRenderer.js
import { Component } from "../Component.js";

export class SpriteRenderer extends Component {
  constructor({ sprite = null, animation = null, offsetX = 0, offsetY = 0 } = {}) {
    super();
    this.sprite = sprite;
    this.animation = animation;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  update(dt, scene) {
    if (this.animation && typeof this.animation.update === "function") {
      this.animation.update(dt);
    }
  }

  draw(ctx, scale, scene) {
    const e = this.entity;
    const x = e.x + this.offsetX;
    const y = e.y + this.offsetY;

    // Default facing to 1 if it's not set
    const facing = typeof e.facing === "number" ? e.facing : 1;
    const flipX = facing === -1;

    if (this.animation && typeof this.animation.draw === "function") {
      // ✅ Let AnimationController / SpriteAnimation handle flipping internally
      this.animation.draw(ctx, scale, x, y, { flipX });
    } else if (this.sprite && typeof this.sprite.draw === "function") {
      // Static sprite path, no flip support here unless you add it
      this.sprite.draw(ctx, scale, x, y);
    }
  }
}