export class Entity {
  constructor({ x = 0, y = 0, animation = null, facing = 1 }) {
    this.x = x;
    this.y = y;
    this.animation = animation;

    this.vx = 0;
    this.vy = 0;

    // 1 = facing right, -1 = facing left
    this.facing = facing;
  }

  update(dt) {
    this.x += this.vx * (dt / 1000);
    this.y += this.vy * (dt / 1000);

    if (this.animation && this.animation.update) {
      this.animation.update(dt);
    }
  }

  draw(ctx, scale) {
    if (this.animation && this.animation.draw) {
      const flipX = this.facing < 0;      // 👈 NEW
      this.animation.draw(ctx, scale, this.x, this.y, { flipX });
    }
  }
}