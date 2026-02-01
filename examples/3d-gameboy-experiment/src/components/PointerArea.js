// src/components/PointerArea.js
import { Component } from "../Component.js";

/**
 * PointerArea
 * Hover / click / hold interactions with a simple AABB hitbox in WORLD units.
 *
 * Hitbox is aligned the same way you draw sprites:
 * drawX = entity.x - originX + offsetX
 * drawY = entity.y - originY + offsetY
 */
export class PointerArea extends Component {
  constructor({
    width = 0,
    height = 0,
    offsetX = 0,
    offsetY = 0,

    holdThresholdMs = 450,
    clickMaxMovePx = 6,
    clickMaxDurationMs = 300,

    onHoverEnter = null,
    onHoverLeave = null,
    onHover = null,

    onDown = null,
    onUp = null,

    onClick = null,

    onHoldStart = null,
    onHoldEnd = null,
  } = {}) {
    super();
    this.width = width;
    this.height = height;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    this.holdThresholdMs = holdThresholdMs;
    this.clickMaxMovePx = clickMaxMovePx;
    this.clickMaxDurationMs = clickMaxDurationMs;

    this.onHoverEnter = onHoverEnter;
    this.onHoverLeave = onHoverLeave;
    this.onHover = onHover;

    this.onDown = onDown;
    this.onUp = onUp;

    this.onClick = onClick;

    this.onHoldStart = onHoldStart;
    this.onHoldEnd = onHoldEnd;
  }

  getWorldRect() {
    const e = this.entity;
    const originX = e?.originX || 0;
    const originY = e?.originY || 0;

    const x = (e?.x || 0) - originX + this.offsetX;
    const y = (e?.y || 0) - originY + this.offsetY;

    return { x, y, w: this.width, h: this.height };
  }

  hitTest(worldX, worldY) {
    if (!this.entity?.active) return false;
    const { x, y, w, h } = this.getWorldRect();
    return worldX >= x && worldX <= x + w && worldY >= y && worldY <= y + h;
  }
}