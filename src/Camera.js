// src/Camera.js
export class Camera {
  constructor({
    x = 0,
    y = 0,
    width,
    height,
    worldWidth = Infinity,
    worldHeight = Infinity,
    followTarget = null,
    lerp = 1.0, // 1 = snap, <1 = smooth
  } = {}) {
    this.x = x;
    this.y = y;

    this.width = width;
    this.height = height;

    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;

    this.followTarget = followTarget;
    this.lerp = lerp;
  }

  setFollowTarget(target) {
    this.followTarget = target;
  }

  /**
   * Very simple follow: keep target roughly centered, clamp to world bounds.
   * Assumes target has x, y and optional width/height.
   */
  update(dt) {
    if (!this.followTarget || !this.width || !this.height) return;

    const target = this.followTarget;

    const targetX = target.x + (target.width || 0) / 2;
    const targetY = target.y + (target.height || 0) / 2;

    const desiredX = targetX - this.width / 2;
    const desiredY = targetY - this.height / 2;

    // Lerp towards desired position
    const t = this.lerp <= 0 ? 1 : Math.min(this.lerp * (dt / 16.67), 1);

    this.x += (desiredX - this.x) * t;
    this.y += (desiredY - this.y) * t;

    // Clamp to world bounds
    this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.width));
    this.y = Math.max(0, Math.min(this.y, this.worldHeight - this.height));
  }
}