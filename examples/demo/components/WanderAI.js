// examples/demo/components/WanderAI.js
import { Component } from "../../../src/index.js";

export class WanderAI extends Component {
  constructor({ speed = 25, sm = null, bounds = null, clickMover = null } = {}) {
    super();
    this.speed = speed;
    this.sm = sm;
    this.bounds = bounds; // { xMin, xMax }
    this.clickMover = clickMover;

    this.mode = "idle";
    this.timeLeft = 0;
    this.dir = { x: 0, y: 0 };
  }

  rand(min, max) {
    return min + Math.random() * (max - min);
  }

  pickNewDirection() {
    this.dir = { x: Math.random() < 0.5 ? -1 : 1, y: 0 };
  }

  enterIdle() {
    this.mode = "idle";
    this.timeLeft = this.rand(3000, 9000);
    this.dir = { x: 0, y: 0 };
    this.sm?.setMoving(false);
  }

  enterWalk() {
    this.mode = "walk";
    this.timeLeft = this.rand(600, 2000);
    this.pickNewDirection();
    this.sm?.setMoving(true);
  }

  clampToBounds(e) {
    if (!this.bounds) return;
    const { xMin, xMax } = this.bounds;
    if (typeof xMin === "number" && typeof xMax === "number") {
      e.x = Math.max(xMin, Math.min(xMax, e.x));
    }
  }

  update(dt) {
    if (this.clickMover?.active) return;

    if (this.sm && !this.sm.canMove()) {
      this.sm.setMoving(false);
      return;
    }

    const e = this.entity;

    if (this.timeLeft <= 0) {
      this.mode === "idle" ? this.enterWalk() : this.enterIdle();
    }

    this.timeLeft -= dt;
    if (this.mode !== "walk") return;

    const s = dt / 1000;
    e.x += this.dir.x * this.speed * s;

    if (this.dir.x !== 0) e.facing = this.dir.x < 0 ? -1 : 1;

    this.clampToBounds(e);

    if (this.bounds) {
      const hitX = e.x === this.bounds.xMin || e.x === this.bounds.xMax;
      if (hitX) this.enterIdle();
    }
  }
}