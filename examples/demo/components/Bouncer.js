// examples/new-demo/components/Bouncer.js
import { Component } from "../../../src/index.js";

/**
 * Bouncer
 * -----------------------------
 * Simple movement component:
 *   - Adds velocity
 *   - Bounces inside the virtual viewport
 *
 * Rendering is handled by SpriteRenderer.
 */
export class Bouncer extends Component {
  constructor({ vx = 30, vy = 20 } = {}) {
    super();
    this.vx = vx;
    this.vy = vy;
  }

  update(dt, scene) {
    const e = this.entity;
    const seconds = dt / 1000;

    // Move based on velocity
    e.x += this.vx * seconds;
    e.y += this.vy * seconds;

    const w = scene.engine.width;
    const h = scene.engine.height;
    const size = 16; // approximate sprite size in virtual pixels

    // Bounce horizontally
    if (e.x < 0) {
      e.x = 0;
      this.vx *= -1;
    } else if (e.x > w - size) {
      e.x = w - size;
      this.vx *= -1;
    }

    // Bounce vertically
    if (e.y < 0) {
      e.y = 0;
      this.vy *= -1;
    } else if (e.y > h - size) {
      e.y = h - size;
      this.vy *= -1;
    }
  }
}