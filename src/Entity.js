export class Entity {
  constructor({ x = 0, y = 0, animation = null }) {
    this.x = x;
    this.y = y;
    this.animation = animation;

    // Optional: extra state later (velocity, etc.)
    this.vx = 0;
    this.vy = 0;
  }

  update(dt) {
    // Basic movement (if you want to use velocity later)
    this.x += this.vx * (dt / 1000);
    this.y += this.vy * (dt / 1000);

    if (this.animation && this.animation.update) {
      this.animation.update(dt);
    }
  }

  draw(ctx, scale) {
    if (this.animation && this.animation.draw) {
      this.animation.draw(ctx, scale, this.x, this.y);
    }
  }
}