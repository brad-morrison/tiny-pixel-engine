// src/components/SpriteRenderer.js
import { Component } from "../Component.js";

export class SpriteRenderer extends Component {
  constructor({
    sprite = null,
    animation = null,
    offsetX = 0,
    offsetY = 0,
  } = {}) {
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

    const originX = e.originX || 0;
    const originY = e.originY || 0;

    // Treat e.x/e.y as the origin point, so the actual top-left
    // for drawing is (x - originX, y - originY).
    
    const drawX = e.x - originX + this.offsetX;
    const drawY = e.y - originY + this.offsetY;

    const facing = typeof e.facing === "number" ? e.facing : 1;
    const flipX = facing === -1;

    if (this.animation && typeof this.animation.draw === "function") {
      this.animation.draw(ctx, scale, drawX, drawY, { flipX });
    } else if (this.sprite && typeof this.sprite.draw === "function") {
      this.sprite.draw(ctx, scale, drawX, drawY);
    }
  }
}