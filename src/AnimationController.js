export class AnimationController {
  constructor({ animations = {}, initialState }) {
    this.animations = animations; // { idle: SpriteAnimation, walk: SpriteAnimation, ... }
    this.currentState = initialState || Object.keys(animations)[0] || null;
    this.current = this.currentState ? this.animations[this.currentState] : null;
  }

  setState(name) {
    if (!name || name === this.currentState) return;

    const next = this.animations[name];
    if (!next) return;

    this.currentState = name;
    this.current = next;

    if (this.current.reset) {
      this.current.reset();
    }
  }

  update(dt) {
    if (this.current && this.current.update) {
      this.current.update(dt);
    }
  }

  draw(ctx, scale, x, y, options = {}) {
    if (this.current && this.current.draw) {
      this.current.draw(ctx, scale, x, y, options);
    }
  }
}